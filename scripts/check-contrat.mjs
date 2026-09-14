#!/usr/bin/env node
/**
 * Indicateur de convergence du contrat d'interface front ↔ data.
 *
 * Passe l'adaptateur JSON-LD (le vrai, celui du front) sur les fiches réelles
 * synchronisées ET sur les fiches de proposition (surcouche rdgf:), et affiche les
 * écarts de profil restants. La convergence est atteinte quand les fiches du
 * dépôt data produisent autant de gaps que les propositions (idéalement zéro).
 *
 * Contrôles de la surcouche (contrat-interface/decisions/) :
 * - ADR-0009 : toute clé `rdgf:` d'une fiche est déclarée dans le contexte partagé, et les
 *   valeurs d'énumération appartiennent à leur schéma de concepts ;
 * - ADR-0002 : une règle `certified` a la nature de chaque entrée et au moins un cas de test
 *   avec enveloppe ; une règle `self-assessed` désigne son code à un commit et sa suite native.
 *
 * Usage : pnpm check:contrat
 * (nécessite le type stripping de Node >= 22.18 : l'adaptateur n'a que des
 * imports de types, il s'exécute donc tel quel.)
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { adaptJsonldGraph } = await import(join(root, 'app/utils/jsonld-adapter.ts'))

const sharedContext = JSON.parse(readFileSync(join(root, 'contrat-interface/rdgf/context.jsonld'), 'utf8'))['@context']
const declaredTerms = new Set(Object.keys(sharedContext).filter(key => key.startsWith('rdgf:')))

/** Schémas de concepts SKOS (contrat-interface/rdgf/rdgf.ttl). */
const enumerations = {
  'rdgf:certificationLevel': ['certified', 'self-assessed'],
  'rdgf:factKind': ['declared', 'attested', 'derived', 'context'],
  'rdgf:origin': ['administration', 'case-law', 'circular', 'anonymised-case', 'community'],
  'rdgf:changeKind': ['major', 'minor', 'legal'],
}

const cases = [
  ['fiche réelle', 'app/data/jsonld/ministere-agriculture/prestagri/metadata.jsonld'],
  ['fiche réelle', 'app/data/jsonld/ministere-interieur/droits-civiques-elections/metadata.jsonld'],
  ['proposition rdgf', 'contrat-interface/propositions/dge/entreprise-innovation/metadata.jsonld'],
  ['proposition rdgf', 'contrat-interface/propositions/cnaf/prime-activite/metadata.jsonld'],
]

const asArray = value => (value === undefined ? [] : Array.isArray(value) ? value : [value])
const types = node => asArray(node?.type).concat(asArray(node?.['@type']))

/** Parcourt tous les objets du document et rapporte les clés `rdgf:` non déclarées et les valeurs hors schéma. */
function checkVocabulary(value, errors, path = '') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => checkVocabulary(item, errors, `${path}[${index}]`))
    return
  }
  if (!value || typeof value !== 'object')
    return
  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith('rdgf:') && !declaredTerms.has(key))
      errors.push(`clé absente du contexte partagé : ${key} (${path || 'racine'})`)
    const allowed = enumerations[key]
    if (allowed && !allowed.includes(String(child)))
      errors.push(`valeur hors schéma pour ${key} : « ${child} » (attendu : ${allowed.join(', ')})`)
    if (key !== 'rdgf:engineProfile')
      checkVocabulary(child, errors, path ? `${path}.${key}` : key)
  }
}

/** Exigences du niveau d'engagement (ADR-0002, Confirmation). */
function checkCertification(doc, adaptation, errors) {
  const graph = doc['@graph'] ?? []
  const services = graph.filter(node => types(node).includes('cpsv:PublicService'))
  const parent = services.find(node => node['dct:hasPart']) ?? services[0]
  const level = parent?.['rdgf:certification']?.['rdgf:certificationLevel']
  if (!level)
    return
  if (level === 'certified') {
    const inputs = services.flatMap(node => asArray(node['cpsv:hasInput']).concat(asArray(node['cv:hasInput'])))
    const untyped = inputs.filter(input => !input['rdgf:factKind']).map(input => input['dct:identifier'])
    if (untyped.length)
      errors.push(`règle certified : entrées sans rdgf:factKind (${untyped.join(', ')})`)
    if (adaptation.tests.length === 0)
      errors.push('règle certified : aucun cas de test avec enveloppe (rdgf:testCase)')
  }
  if (level === 'self-assessed') {
    const sourceCode = graph.find(node => types(node).includes('schema:SoftwareSourceCode'))
    const repository = sourceCode?.['schema:codeRepository']
    if (!repository || !/\/(?:tree|blob|commit)\/[0-9a-f]{7,}|\/tree\/[\w.-]+$/.test(String(repository)))
      errors.push('règle self-assessed : aucun schema:SoftwareSourceCode désigné à un commit ou un tag')
    if (!adaptation.tests.some(test => test.nativeRef))
      errors.push('règle self-assessed : aucune suite de tests native référencée (rdgf:testCase › dct:source)')
  }
}

let failed = false
for (const [kind, path] of cases) {
  const raw = readFileSync(join(root, path), 'utf8')
  let adaptation
  try {
    adaptation = adaptJsonldGraph(raw)
  }
  catch (error) {
    console.error(`✗ ${path} : ${error.message}`)
    failed = true
    continue
  }
  const { base, boundaryDraft, gaps, tests, versions } = adaptation
  console.log(`\n[${kind}] ${path}`)
  console.log(`  titre       : ${base.title}`)
  console.log(`  garantie    : ${base.certification ? `${base.certification.level} (${base.certification.byLabel ?? '?'})` : 'référencée'}`)
  console.log(`  entrées     : ${[...new Set(boundaryDraft.map(b => b.kind))].join(', ') || '(vide)'}`)
  console.log(`  tests       : ${tests.length} enveloppe(s) · versions : ${versions.length} événement(s)`)
  console.log(`  gaps (${gaps.length}) :`)
  gaps.forEach(g => console.log(`   - ${g}`))

  const errors = []
  checkVocabulary(JSON.parse(raw)['@graph'], errors)
  checkCertification(JSON.parse(raw), adaptation, errors)
  for (const error of errors)
    console.error(`  ✗ ${error}`)
  if (errors.length)
    failed = true
}

if (failed)
  process.exit(1)
console.log('\nConvergence : les gaps des fiches réelles disparaîtront à mesure que la surcouche rdgf: y est adoptée.')
