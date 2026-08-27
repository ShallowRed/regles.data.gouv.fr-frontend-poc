#!/usr/bin/env node
/**
 * Lint éditorial de la copie UI (doctrine 15 : affordance, pas de méta).
 *
 * Balaie les chaînes visibles (templates .vue, mocks affichés) à la recherche des
 * patterns interdits : antithèses, négations défensives, vocabulaire de doctrine.
 * Les lignes de commentaires (code) sont ignorées ; les exceptions justifiées vivent
 * dans scripts/copy-allowlist.txt (une par ligne : `chemin:extrait`).
 *
 * Le méta-discours ne se détecte pas à la regex : ce lint attrape les tics mécaniques,
 * la relecture humaine fait le reste (test : « existerait-il sur service-public.fr ? »).
 *
 * Usage : pnpm lint:copy - sortie code 1 si une occurrence non listée est trouvée.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const ROOTS = ['app/pages', 'app/components', 'app/mocks']
const EXTENSIONS = ['.vue', '.ts']

const PATTERNS = [
  { name: 'tiret cadratin', regex: /—/ },
  { name: 'signe différent', regex: /≠/ },
  { name: 'antithèse « n\'est pas X mais/c\'est Y »', regex: /n(?:'|’)est pas [^.!?]{0,60}\b(?:mais|c(?:'|’)est)/i },
  { name: 'antithèse « ne sont pas X mais Y »', regex: /ne sont pas [^.!?]{0,60}\bmais/i },
  { name: 'antithèse « non pas »', regex: /\bnon pas\b/i },
  { name: 'négation défensive « sans jamais »', regex: /\bsans jamais\b/i },
  { name: 'négation défensive « aucun porteur »', regex: /\baucune? porteur/i },
  { name: 'doctrine « fait foi »', regex: /fait foi/i },
  { name: 'comparatif béquille « plutôt que de »', regex: /plutôt que de/i },
  { name: 'minimisation « se contente de »', regex: /se contente de/i },
]

const allowlistPath = join(root, 'scripts/copy-allowlist.txt')
const allowlist = readFileSync(allowlistPath, 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'))
  .map((line) => {
    const [file, ...rest] = line.split(':')
    return { file, excerpt: rest.join(':') }
  })

function isAllowed(file, text) {
  return allowlist.some(entry => file === entry.file && text.includes(entry.excerpt))
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory())
      yield* walk(path)
    else if (EXTENSIONS.some(ext => name.endsWith(ext)))
      yield path
  }
}

const COMMENT_LINE = /^\s*(?:\/\/|\/?\*|<!--)/

const findings = []
for (const rootDir of ROOTS) {
  for (const path of walk(join(root, rootDir))) {
    const file = relative(root, path)
    const lines = readFileSync(path, 'utf8').split('\n')
    lines.forEach((line, index) => {
      if (COMMENT_LINE.test(line))
        return
      for (const pattern of PATTERNS) {
        if (pattern.regex.test(line) && !isAllowed(file, line.trim()))
          findings.push({ file, line: index + 1, name: pattern.name, text: line.trim().slice(0, 110) })
      }
    })
  }
}

if (findings.length === 0) {
  console.log('✓ lint:copy - aucune occurrence interdite dans la copie UI')
  process.exit(0)
}

for (const finding of findings)
  console.log(`✗ ${finding.file}:${finding.line} [${finding.name}]\n  ${finding.text}`)
console.log(`\n${findings.length} occurrence(s). Reformuler, ou justifier dans scripts/copy-allowlist.txt.`)
process.exit(1)
