#!/usr/bin/env node
/**
 * « Validata des règles » v0 - vérification automatique depuis le format d'échange.
 *
 * Démonstration que le format génère des features de confiance. Pour chaque règle dont la
 * fiche metadata.jsonld déclare une API (canal), le script fait deux choses, entièrement
 * pilotées par la fiche :
 *
 *   1. Rejeu des cas de tests de l'enveloppe (app/mocks/rule-tests.ts) contre l'API réelle,
 *      et comparaison au résultat attendu.
 *   2. Contrôle de dérive : comparaison des paramètres d'entrée DÉCLARÉS dans la fiche
 *      (cpsv:hasInput / cv:hasInput) à ceux réellement ACCEPTÉS par l'API (son openapi.json).
 *      Un producteur qui change son API sans mettre à jour sa fiche est détecté ici.
 *
 * Les statuts datés sont écrits dans app/data/verification.json, affichés sur la fiche.
 * Sortie en code 1 si un cas échoue ou si une dérive est détectée : comportement attendu
 * en CI - une rupture côté producteur doit se voir.
 *
 * Usage : pnpm verify:rules
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { ruleTestsMock } = await import(join(root, 'app/mocks/rule-tests.ts'))

/** Règles vérifiables : fiche + service porteur de l'API. */
const verifiable = {
  prestagri: {
    fichePath: 'app/data/jsonld/ministere-agriculture/prestagri/metadata.jsonld',
    serviceIdentifier: 'prestagri-quotient-familial',
  },
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
  const declaredParams = inputs.map(input => String(input['dct:identifier'])).filter(Boolean)
  return { endpoint, declaredParams }
}

/** Paramètres réellement acceptés par l'API, lus depuis son openapi.json. */
async function acceptedParams(endpoint) {
  const url = new URL(endpoint)
  const openapiUrl = `${url.origin}/openapi.json`
  const response = await fetch(openapiUrl)
  if (!response.ok)
    return null
  const doc = await response.json()
  const operation = doc.paths?.[url.pathname]?.get
  return (operation?.parameters ?? []).map(param => param.name)
}

/** Compare la valeur renvoyée (ex. "833.33€") au résultat attendu de l'enveloppe. */
function matches(got, expected) {
  const gotNumber = Number.parseFloat(String(got).replace(/[€\s]/g, '').replace(',', '.'))
  const expectedNumber = Number.parseFloat(String(expected).replace(',', '.'))
  if (Number.isFinite(gotNumber) && Number.isFinite(expectedNumber))
    return Math.abs(gotNumber - expectedNumber) < 0.01
  return String(got) === String(expected)
}

const caseResults = []
const schemaChecks = []
let failed = false

for (const [ruleId, { fichePath, serviceIdentifier }] of Object.entries(verifiable)) {
  const { endpoint, declaredParams } = readService(fichePath, serviceIdentifier)
  if (!endpoint) {
    console.error(`✗ ${ruleId} : endpoint introuvable dans la fiche`)
    failed = true
    continue
  }

  // 1. Contrôle de dérive fiche <-> API.
  const accepted = await acceptedParams(endpoint)
  if (accepted) {
    const declaredNotAccepted = declaredParams.filter(p => !accepted.includes(p))
    const acceptedNotDeclared = accepted.filter(p => !declaredParams.includes(p))
    const drift = declaredNotAccepted.length > 0
    schemaChecks.push({ ruleId, endpoint, drift, declaredNotAccepted, acceptedNotDeclared })
    if (drift) {
      failed = true
      console.log(`⚠ ${ruleId} : dérive fiche/API - paramètres déclarés non acceptés : ${declaredNotAccepted.join(', ')}`)
    }
    else {
      console.log(`✓ ${ruleId} : la fiche et l'API déclarent les mêmes paramètres`)
    }
  }

  // 2. Rejeu des cas de tests contre l'API.
  const tests = ruleTestsMock.filter(test => test.ruleId === ruleId && test.inputs)
  for (const test of tests) {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(test.inputs)) {
      if (value !== null && value !== false)
        query.set(key, String(value))
    }
    const url = `${endpoint}?${query.toString()}`
    let status = 'echec'
    let got = null
    try {
      const response = await fetch(url)
      const body = await response.json()
      got = body.value ?? null
      status = response.ok && matches(got, test.expected) ? 'conforme' : 'echec'
    }
    catch (error) {
      got = `erreur réseau : ${error.message}`
    }
    if (status === 'echec')
      failed = true
    caseResults.push({ ruleId, testId: test.id, label: test.label, expected: test.expected, got, status, url })
    console.log(`${status === 'conforme' ? '✓' : '✗'} ${ruleId} / ${test.label} : attendu ${test.expected}, obtenu ${got}`)
  }
}

const verification = {
  checkedAt: new Date().toISOString().slice(0, 10),
  method: 'rejeu des cas de l\'enveloppe + contrôle de dérive fiche/API (openapi), pilotés par la fiche metadata.jsonld',
  schemaChecks,
  results: caseResults,
}
writeFileSync(join(root, 'app/data/verification.json'), `${JSON.stringify(verification, null, 2)}\n`)
console.log(`\n${caseResults.length} cas rejoués, ${schemaChecks.length} contrôle(s) de dérive, écrit dans app/data/verification.json`)

if (failed)
  process.exit(1)
