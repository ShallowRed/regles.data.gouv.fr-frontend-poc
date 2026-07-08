#!/usr/bin/env node
/**
 * Synchronise les fiches metadata.jsonld depuis un clone local du dépôt data
 * (datagouv/regles.data.gouv.fr, privé) vers le POC front, et matérialise deux
 * pièces manquantes du contrat d'interface :
 *
 * 1. app/data/catalog.json           - l'index de catalogue (le dépôt data n'en a pas)
 * 2. contrat-interface/rapport-conformite.md - contrôles structurels par fiche
 * 3. app/data/jsonld/<org>/<slug>/metadata.jsonld - fiches vendorées, slugs normalisés
 *
 * Usage : node scripts/sync-data-repo.mjs [chemin-du-clone]
 *         (défaut : ../regles.data.gouv.fr)
 *
 * Les contrôles sont volontairement structurels (JS pur, sans stack RDF) : la
 * validation sémantique SHACL (shapes CPSV-AP 3.2.0) est documentée dans
 * qloridant/vocabulaire-commun (tutoriel 04) et a vocation à vivre dans la CI
 * du dépôt data, pas ici.
 */

import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateFicheDoc } from './generate-fiche-doc.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dataRepo = resolve(process.argv[2] ?? join(root, '..', 'regles.data.gouv.fr'))
const outJsonldDir = join(root, 'app/data/jsonld')
const outCatalog = join(root, 'app/data/catalog.json')
const outReport = join(root, 'contrat-interface/rapport-conformite.md')

if (!existsSync(join(dataRepo, 'site'))) {
  console.error(`Dépôt data introuvable ou sans dossier site/ : ${dataRepo}`)
  process.exit(1)
}

/** Slug kebab-case sans accents ni espaces (convention proposée du contrat d'interface). */
function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['']/g, '-')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

const asArray = v => (v === undefined ? [] : Array.isArray(v) ? v : [v])
const literal = v => (typeof v === 'string' ? v : v && typeof v === 'object' && '@value' in v ? String(v['@value']) : undefined)
const types = node => asArray(node?.type).concat(asArray(node?.['@type']))

/** Contrôles structurels d'une fiche. Retourne { errors, warnings }. */
function checkFiche(doc, relPath) {
  const errors = []
  const warnings = []

  if (!doc['@context'])
    errors.push('`@context` absent')
  const graph = doc['@graph']
  if (!Array.isArray(graph)) {
    errors.push('`@graph` absent ou invalide')
    return { errors, warnings }
  }

  const services = graph.filter(n => types(n).includes('cpsv:PublicService'))
  if (services.length === 0)
    errors.push('aucun nœud `cpsv:PublicService`')

  const leaves = services.filter(n => !n['dct:hasPart'])
  for (const leaf of leaves) {
    const label = leaf['dct:identifier'] ?? leaf.id ?? '(sans id)'
    if (!leaf['dct:identifier'])
      errors.push(`service ${label} : \`dct:identifier\` absent`)
    if (!literal(leaf.title) && !literal(leaf['dct:title']))
      errors.push(`service ${label} : \`dct:title\` absent`)
    if (!asArray(leaf['cv:hasLegalResource']).length && !asArray(leaf['cpsv:hasLegalResource']).length)
      warnings.push(`service ${label} : base légale absente (\`cv:hasLegalResource\`)`)
    if (!literal(leaf['dct:version']))
      warnings.push(`service ${label} : \`dct:version\` absent`)

    // Incohérences de vocabulaire relevées entre les fiches existantes.
    // Point tranché au contrat : la propriété CPSV-AP 3.2.0 est cpsv:hasInput
    // (shape officielle : shacl:path <http://purl.org/vocab/cpsv#hasInput>).
    if (leaf['cv:hasInput'])
      warnings.push(`service ${label} : \`cv:hasInput\` utilisé - la propriété CPSV-AP 3.2.0 est \`cpsv:hasInput\``)
    const params = asArray(leaf['cv:hasInput']).concat(asArray(leaf['cpsv:hasInput']))
    const withType = params.filter(p => p['@type']).length
    const withBareType = params.filter(p => p.type).length
    if (withType > 0 && withBareType > 0)
      warnings.push(`service ${label} : mélange \`type\` et \`@type\` sur les paramètres`)
  }

  // Autorité compétente référencée mais non décrite dans le graphe.
  const orgDescribed = graph.some(n => types(n).includes('cv:PublicOrganisation'))
  const orgReferenced = graph.some(n => n['cv:hasCompetentAuthority'] || n['cv:ownedBy'])
  if (orgReferenced && !orgDescribed)
    warnings.push('autorité compétente référencée mais nœud `cv:PublicOrganisation` absent du graphe')

  // Schéma d'URI : la convention canonique reste à trancher (cf. profil).
  const serviceIds = services.map(n => n.id).filter(Boolean)
  if (serviceIds.some(id => !String(id).startsWith('https://regles')))
    warnings.push(`URI de service hors convention regles.* : ${serviceIds.join(', ')}`)

  // Arborescence : espaces/accents dans les dossiers cassent les routes front.
  if (/[^a-z0-9/\-_.]/i.test(relPath) || /\s/.test(relPath))
    warnings.push(`chemin non normalisé (espaces/accents) : \`${relPath}\``)

  return { errors, warnings }
}

// ── Collecte ────────────────────────────────────────────────────────────────
const ficheFiles = execSync('find site -name metadata.jsonld', { cwd: dataRepo, encoding: 'utf8' })
  .trim().split('\n').filter(Boolean).sort()

let sourceCommit = 'inconnu'
let sourceCommitDate = 'inconnue'
try {
  sourceCommit = execSync('git rev-parse HEAD', { cwd: dataRepo, encoding: 'utf8' }).trim()
  sourceCommitDate = execSync('git log -1 --format=%cI', { cwd: dataRepo, encoding: 'utf8' }).trim()
}
catch { /* clone sans .git : on continue */ }

rmSync(outJsonldDir, { recursive: true, force: true })

const entries = []
const reportRows = []

for (const relPath of ficheFiles) {
  const abs = join(dataRepo, relPath)
  const doc = JSON.parse(readFileSync(abs, 'utf8'))
  const segments = relPath.split('/') // site / <Organisation> / <slug> / metadata.jsonld
  const organisation = segments[1]
  const ruleDir = segments[2]
  const organisationSlug = slugify(organisation)
  const ruleSlug = slugify(ruleDir)

  const dest = join(outJsonldDir, organisationSlug, ruleSlug, 'metadata.jsonld')
  mkdirSync(dirname(dest), { recursive: true })
  cpSync(abs, dest)

  // Doc générée à côté de la fiche vendorée (préfiguration de la moulinette).
  writeFileSync(join(dirname(dest), 'documentation.md'), generateFicheDoc(doc, { sourcePath: relPath }))

  const graph = doc['@graph'] ?? []
  const services = graph.filter(n => types(n).includes('cpsv:PublicService'))
  const parent = services.find(n => n['dct:hasPart']) ?? services[0]
  const sourceCode = graph.find(n => types(n).includes('schema:SoftwareSourceCode'))
  const title = literal(parent?.title)
    ?? literal(sourceCode?.['schema:name'])
    ?? services.filter(n => n['dct:isPartOf']).map(n => literal(n.title)).filter(Boolean).join(' + ')

  const { errors, warnings } = checkFiche(doc, relPath)

  entries.push({
    organisation,
    organisationSlug,
    slug: ruleSlug,
    title: title ?? ruleSlug,
    identifier: parent?.['dct:identifier'] ?? null,
    version: literal(parent?.['dct:version']) ?? literal(sourceCode?.['schema:softwareVersion']) ?? null,
    languages: asArray(sourceCode?.['schema:programmingLanguage']),
    sourcePath: relPath,
    localPath: relative(root, dest),
    conformite: { errors: errors.length, warnings: warnings.length },
  })
  reportRows.push({ relPath, title: title ?? ruleSlug, errors, warnings })
}

// ── Index de catalogue ──────────────────────────────────────────────────────
const catalog = {
  $schema: 'contrat-interface/profil-metadonnees.md#index',
  description: 'Index de catalogue généré depuis le dépôt data (pièce manquante du contrat d\'interface, générée côté POC en attendant d\'être produite côté data).',
  source: {
    repository: 'datagouv/regles.data.gouv.fr (privé)',
    commit: sourceCommit,
    commitDate: sourceCommitDate,
  },
  syncedAt: new Date().toISOString(),
  entries,
}
writeFileSync(outCatalog, `${JSON.stringify(catalog, null, 2)}\n`)

// ── Rapport de conformité ───────────────────────────────────────────────────
const lines = [
  '# Rapport de conformité des fiches metadata.jsonld',
  '',
  `> Généré par \`scripts/sync-data-repo.mjs\` - ne pas éditer à la main.`,
  `> Source : \`${sourceCommit.slice(0, 9)}\` (${sourceCommitDate}). Contrôles structurels JS ;`,
  '> la validation SHACL CPSV-AP 3.2.0 (cf. vocabulaire-commun, tutoriel 04) reste à brancher en CI du dépôt data.',
  '',
]
for (const row of reportRows) {
  lines.push(`## ${row.title}`, '', `Fiche : \`${row.relPath}\``, '')
  if (!row.errors.length && !row.warnings.length)
    lines.push('Aucun écart détecté.', '')
  if (row.errors.length) {
    lines.push('Erreurs (bloquantes pour le front) :', '')
    row.errors.forEach(e => lines.push(`- ${e}`))
    lines.push('')
  }
  if (row.warnings.length) {
    lines.push('Points à trancher ensemble (profil) :', '')
    row.warnings.forEach(w => lines.push(`- ${w}`))
    lines.push('')
  }
}
mkdirSync(dirname(outReport), { recursive: true })
writeFileSync(outReport, `${lines.join('\n')}\n`)

// ── Doc générée pour les fiches de proposition (profil rdgf: complet) ───────
const propositionFiles = execSync('find contrat-interface/propositions -name metadata.jsonld', { cwd: root, encoding: 'utf8' })
  .trim().split('\n').filter(Boolean).sort()
for (const relPath of propositionFiles) {
  const doc = JSON.parse(readFileSync(join(root, relPath), 'utf8'))
  writeFileSync(join(root, dirname(relPath), 'documentation.md'), generateFicheDoc(doc, { sourcePath: relPath }))
}

console.log(`${entries.length} fiche(s) synchronisée(s) depuis ${dataRepo}`)
console.log(`${propositionFiles.length} doc(s) de proposition générée(s)`)
console.log(`- index    : ${relative(root, outCatalog)}`)
console.log(`- rapport  : ${relative(root, outReport)}`)
for (const e of entries)
  console.log(`- ${e.organisationSlug}/${e.slug} (${e.conformite.errors} err, ${e.conformite.warnings} warn)`)
