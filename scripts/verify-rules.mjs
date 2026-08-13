#!/usr/bin/env node
/**
 * « Validata des règles » v0 - vérification automatique depuis le format d'échange.
 *
 * Adossée à l'enveloppe de cas de tests (app/mocks/rule-tests.ts, format aligné sur
 * `shared-test-cases` d'aides-simplifiées : intention, provenance, période, version de
 * moteur). Pour chaque règle vérifiable, le script :
 *
 *   1. Rejoue les cas de l'enveloppe contre le moteur réel du producteur et compare au
 *      résultat attendu. Deux modes : `rest-get` (API GET pilotée par la fiche, ex. Prest'Agri)
 *      et `openfisca-post` (situation OpenFisca assemblée depuis le engineProfile, ex. prime
 *      d'activité). Chaque résultat porte la période et la version de moteur du cas.
 *   2. Pour les API `rest-get`, contrôle de dérive fiche/API : paramètres DÉCLARÉS dans la
 *      fiche vs ACCEPTÉS par l'API (openapi.json). Détecte un producteur qui change son API
 *      sans mettre à jour sa fiche.
 *
 * Statuts datés écrits dans app/data/verification.json, adossés par `testId` à chaque cas
 * daté/versionné et affichés sur la fiche. Sortie code 1 si un cas échoue ou si dérive :
 * comportement de CI - une rupture producteur doit se voir.
 *
 * Usage : pnpm verify:rules
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { ruleTestsMock } = await import(join(root, 'app/mocks/rule-tests.ts'))
const { buildPrimeActiviteRequest } = await import(join(root, 'app/utils/openfisca/build-request.ts'))

/** Règles vérifiables et leur mode de rejeu. */
const verifiable = {
  'prestagri': {
    kind: 'rest-get',
    fichePath: 'app/data/jsonld/ministere-agriculture/prestagri/metadata.jsonld',
    serviceIdentifier: 'prestagri-quotient-familial',
  },
  'prime-activite-openfisca': {
    kind: 'openfisca-post',
    api: 'https://api.fr.openfisca.org/latest/calculate',
  },
}

/** Nom de champ depuis un sh:path (`cprmv:garde_alternee` → `garde_alternee`). */
function shPathName(value) {
  const path = typeof value === 'string' ? value : ''
  return path.split(/[#:/]/).pop() ?? path
}

/** Champs feuilles d'une structure SHACL (récursif via sh:node résolu dans le graphe). */
function structureLeafNames(structure, graph) {
  const properties = Array.isArray(structure['sh:property'])
    ? structure['sh:property']
    : structure['sh:property'] ? [structure['sh:property']] : []
  return properties.flatMap((property) => {
    const nested = property['sh:node']
    if (nested) {
      const ref = typeof nested === 'string' ? nested : nested['@id'] ?? nested.id
      const target = typeof nested === 'object' && nested['sh:property']
        ? nested
        : graph.find(node => node['@id'] === ref || node.id === ref)
      return target ? structureLeafNames(target, graph) : []
    }
    const name = shPathName(property['sh:path'])
    return name ? [name] : []
  })
}

/** Nœud de service et son canal, lus depuis la fiche. */
function readService(fichePath, serviceIdentifier) {
  const graph = JSON.parse(readFileSync(join(root, fichePath), 'utf8'))['@graph']
  const service = graph.find(node => node['dct:identifier'] === serviceIdentifier)
  const channel = graph.find(node => node.id === service?.['cv:hasChannel']?.id)
  const endpoint = channel?.['foaf:page']?.id
  const inputs = [
    ...(service?.['cpsv:hasInput'] ?? []),
    ...(service?.['cv:hasInput'] ?? []),
  ]
  // Entrées composites (shapes SHACL) : la comparaison porte sur les champs feuilles.
  // La fiche ne déclarant pas la projection structure → paramètres HTTP, seul
  // l'appariement par nom exact est possible.
  const hasStructures = inputs.some(input => input['sh:property'] !== undefined)
  const declaredParams = inputs.flatMap(input =>
    input['sh:property'] !== undefined
      ? structureLeafNames(input, graph)
      : [String(input['dct:identifier'] ?? '')],
  ).filter(Boolean)
  return { endpoint, declaredParams, hasStructures }
}

/** Paramètres réellement acceptés par l'API, lus depuis son openapi.json. */
async function acceptedParams(endpoint) {
  const url = new URL(endpoint)
  const response = await fetch(`${url.origin}/openapi.json`)
  if (!response.ok)
    return null
  const doc = await response.json()
  return (doc.paths?.[url.pathname]?.get?.parameters ?? []).map(param => param.name)
}

/** Compare la valeur renvoyée (ex. "833.33€" ou 224.38) au résultat attendu de l'enveloppe. */
function matches(got, expected) {
  const gotNumber = Number.parseFloat(String(got).replace(/[€\s]/g, '').replace(',', '.'))
  const expectedNumber = Number.parseFloat(String(expected).replace(',', '.'))
  if (Number.isFinite(gotNumber) && Number.isFinite(expectedNumber))
    return Math.abs(gotNumber - expectedNumber) < 0.01
  return String(got) === String(expected)
}

/** Rejoue un cas contre une API GET (query pilotée par la fiche). */
async function replayRestGet(endpoint, test) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(test.inputs)) {
    if (value !== null && value !== false)
      query.set(key, String(value))
  }
  const url = `${endpoint}?${query.toString()}`
  const response = await fetch(url)
  const body = await response.json()
  return { got: body.value ?? null, ok: response.ok, url }
}

/** Rejoue un cas contre OpenFisca (situation assemblée, ppa extraite). */
async function replayOpenfiscaPost(api, test) {
  const request = buildPrimeActiviteRequest(test.inputs.salaire_de_base, test.period)
  const response = await fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  const data = await response.json()
  const ppa = data?.familles?.famille_1?.ppa?.[test.period] ?? null
  return { got: ppa, ok: response.ok, url: `${api} (POST, ppa ${test.period})` }
}

const caseResults = []
const schemaChecks = []
let failed = false

for (const [ruleId, config] of Object.entries(verifiable)) {
  let endpoint
  if (config.kind === 'rest-get') {
    const service = readService(config.fichePath, config.serviceIdentifier)
    endpoint = service.endpoint
    if (!endpoint) {
      console.error(`✗ ${ruleId} : endpoint introuvable dans la fiche`)
      failed = true
      continue
    }
    // Contrôle de dérive fiche <-> API.
    const accepted = await acceptedParams(endpoint)
    if (accepted) {
      const declaredNotAccepted = service.declaredParams.filter(p => !accepted.includes(p))
      const acceptedNotDeclared = accepted.filter(p => !service.declaredParams.includes(p))
      const drift = declaredNotAccepted.length > 0
      schemaChecks.push({
        ruleId,
        endpoint,
        drift,
        declaredNotAccepted,
        acceptedNotDeclared,
        ...(service.hasStructures
          ? { comparison: 'champs feuilles des structures SHACL, appariement par nom exact (projection HTTP non déclarée par la fiche)' }
          : {}),
      })
      if (drift) {
        failed = true
        console.log(`⚠ ${ruleId} : dérive fiche/API - déclarés non acceptés : ${declaredNotAccepted.join(', ')}`)
        if (acceptedNotDeclared.length > 0)
          console.log(`  acceptés non déclarés : ${acceptedNotDeclared.join(', ')}${service.hasStructures ? ' (projection composite → HTTP non déclarée)' : ''}`)
      }
      else {
        console.log(`✓ ${ruleId} : fiche et API déclarent les mêmes paramètres`)
      }
    }
  }

  // Rejeu des cas de l'enveloppe portant une projection plate exécutable. Les cas aux
  // entrées structurées (forme native du moteur) et les cas marqués `replayable: false`
  // sont documentés par l'enveloppe, pas rejoués : le test natif fait foi.
  const isFlat = inputs => Object.values(inputs).every(value => value === null || typeof value !== 'object')
  const allCases = ruleTestsMock.filter(test => test.ruleId === ruleId && test.inputs)
  const tests = allCases.filter(test => test.replayable !== false && isFlat(test.inputs))
  for (const skipped of allCases.filter(test => !tests.includes(test))) {
    const reason = skipped.replayable === false ? 'exclu du rejeu (replayable: false)' : 'entrées natives structurées'
    console.log(`- ${ruleId} / ${skipped.label} : non rejoué - ${reason}`)
  }
  for (const test of tests) {
    let status = 'echec'
    let got = null
    let url = null
    try {
      const replay = config.kind === 'openfisca-post'
        ? await replayOpenfiscaPost(config.api, test)
        : await replayRestGet(endpoint, test)
      got = replay.got
      url = replay.url
      status = replay.ok && matches(got, test.expected) ? 'conforme' : 'echec'
    }
    catch (error) {
      got = `erreur : ${error.message}`
    }
    if (status === 'echec')
      failed = true
    caseResults.push({
      ruleId,
      testId: test.id,
      label: test.label,
      expected: test.expected,
      got,
      status,
      period: test.period ?? null,
      engineVersion: test.engineVersion ?? null,
      url,
    })
    console.log(`${status === 'conforme' ? '✓' : '✗'} ${ruleId} / ${test.label} : attendu ${test.expected}, obtenu ${got}`)
  }
}

const verification = {
  checkedAt: new Date().toISOString().slice(0, 10),
  method: 'rejeu des cas plats de l\'enveloppe (rest-get + openfisca-post) + contrôle de dérive fiche/API (champs feuilles pour les fiches composites), adossé par testId aux cas datés/versionnés ; cas natifs structurés non rejoués (le test natif fait foi)',
  schemaChecks,
  results: caseResults,
}
writeFileSync(join(root, 'app/data/verification.json'), `${JSON.stringify(verification, null, 2)}\n`)
console.log(`\n${caseResults.length} cas rejoués, ${schemaChecks.length} contrôle(s) de dérive, écrit dans app/data/verification.json`)

if (failed)
  process.exit(1)
