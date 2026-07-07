#!/usr/bin/env node
/**
 * Indicateur de convergence du contrat d'interface front ↔ data.
 *
 * Passe l'adaptateur JSON-LD (le vrai, celui du front) sur les fiches réelles
 * synchronisées ET sur les fiches de proposition (profil rdgf:), et affiche les
 * écarts de profil restants. La convergence est atteinte quand les fiches du
 * dépôt data produisent autant de gaps que les propositions (idéalement zéro).
 *
 * Usage : pnpm check:contrat
 * (nécessite le type stripping de Node >= 22.18 : l'adaptateur n'a que des
 * imports de types, il s'exécute donc tel quel.)
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { adaptJsonldGraph } = await import(join(root, 'app/utils/jsonld-adapter.ts'))

const cases = [
  ['fiche réelle', 'app/data/jsonld/ministere-agriculture/prestagri/metadata.jsonld'],
  ['fiche réelle', 'app/data/jsonld/ministere-interieur/droits-civiques-elections/metadata.jsonld'],
  ['proposition rdgf', 'contrat-interface/propositions/dge/entreprise-innovation/metadata.jsonld'],
  ['proposition rdgf', 'contrat-interface/propositions/cnaf/prime-activite/metadata.jsonld'],
]

let failed = false
for (const [kind, path] of cases) {
  let adaptation
  try {
    adaptation = adaptJsonldGraph(readFileSync(join(root, path), 'utf8'))
  }
  catch (error) {
    console.error(`✗ ${path} : ${error.message}`)
    failed = true
    continue
  }
  const { base, boundaryDraft, gaps } = adaptation
  console.log(`\n[${kind}] ${path}`)
  console.log(`  titre     : ${base.title}`)
  console.log(`  maturité  : ${base.maturity ?? '(absente)'} · régime : ${base.certificationRegime ?? '(absent)'}`)
  console.log(`  frontière : ${[...new Set(boundaryDraft.map(b => b.kind))].join(', ') || '(vide)'}`)
  console.log(`  gaps (${gaps.length}) :`)
  gaps.forEach(g => console.log(`   - ${g}`))

  // Garde-fou : une proposition doit démontrer le profil complet côté confiance.
  if (kind === 'proposition rdgf' && gaps.some(g => g.includes('rdgf:maturity') || g.includes('rdgf:certificationRegime'))) {
    console.error('  ✗ une proposition doit porter rdgf:maturity et rdgf:certificationRegime')
    failed = true
  }
}

if (failed)
  process.exit(1)
console.log('\nConvergence : les gaps des fiches réelles disparaîtront à mesure que le profil rdgf: y est adopté.')
