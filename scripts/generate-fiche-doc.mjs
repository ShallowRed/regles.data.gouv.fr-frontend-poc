#!/usr/bin/env node
/**
 * Génère une documentation markdown lisible par un humain depuis une fiche
 * metadata.jsonld (profil CPSV-AP + sous-ensemble CPRMV + extensions rdgf:).
 *
 * Préfiguration de l'étape « doc générée » de la future moulinette, sur le
 * modèle de schema.data.gouv.fr (datagouvfr_data_pipelines/schema/utils/
 * jsonschema.py, jsonschema_to_markdown) : conventions françaises, un bloc
 * par champ, valeurs obligatoires/optionnelles explicites.
 *
 * Anti-fabrication : un champ absent de la fiche est une section omise,
 * jamais une valeur inventée.
 *
 * Usage : node scripts/generate-fiche-doc.mjs <metadata.jsonld> [...]
 *         (écrit documentation.md à côté de chaque fiche)
 * Ou en module : import { generateFicheDoc } from './generate-fiche-doc.mjs'
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const asArray = v => (v === undefined ? [] : Array.isArray(v) ? v : [v])
const literal = v => (typeof v === 'string' ? v : v && typeof v === 'object' && '@value' in v ? String(v['@value']) : undefined)
const nodeId = v => (v && typeof v === 'object' && ('id' in v || '@id' in v) ? String(v.id ?? v['@id']) : undefined)
const types = node => asArray(node?.type).concat(asArray(node?.['@type']))
const title = node => literal(node?.title) ?? literal(node?.['dct:title'])
const description = node => literal(node?.description) ?? literal(node?.['dct:description'])

/** Entrées d'un service : cpsv:hasInput (CPSV-AP 3.2.0) ou cv:hasInput (motif historique). */
const serviceInputs = leaf => asArray(leaf['cpsv:hasInput']).concat(asArray(leaf['cv:hasInput']))

const XSD_FR = {
  'xsd:boolean': 'booléen (oui/non)',
  'xsd:integer': 'nombre entier',
  'xsd:decimal': 'nombre décimal',
  'xsd:string': 'chaîne de caractères',
  'xsd:date': 'date',
}

const BOUNDARY_FR = {
  'declaration': 'déclaration (fait déclaré par l\'usager, non vérifié)',
  'donnee-attestee': 'donnée attestée (propriétaire institutionnel identifié)',
  'sortie-regle': 'sortie d\'une autre règle ou paramètre législatif partagé',
  'contexte': 'contexte d\'exécution (change la règle appliquée)',
}

const REGIME_FR = {
  frontiere: {
    label: 'frontière',
    explain: 'L\'administration certifie le comportement entrées → sorties sur des faits déclarés, '
      + 'à une version donnée. C\'est la sémantique du rescrit : l\'engagement porte sur les faits '
      + 'déclarés, pas sur leur provenance amont. Les cas de tests publiés sont l\'artefact de cette certification.',
  },
  implementation: {
    label: 'implémentation',
    explain: 'Règle du cœur socio-fiscal : sa chaîne de dépendances (SMIC, bases ressources, définitions '
      + 'de revenus) n\'a pas de porteur administratif unique. L\'unité cataloguée est la règle telle que '
      + 'calculée par une implémentation donnée ; l\'unité certifiable est le couple suite de tests + '
      + 'snapshot d\'implémentation.',
  },
  referencement: {
    label: 'référencement',
    explain: 'Entrée simplement référencée : métadonnées descriptives, sans code ni tests publiés. '
      + 'C\'est le premier barreau de l\'échelle de maturité du catalogue.',
  },
}

const PROVENANCE_FR = {
  'administration': 'administration compétente',
  'communaute': 'communauté',
  'jurisprudence': 'jurisprudence',
  'circulaire': 'circulaire',
  'cas-reel-anonymise': 'cas réel anonymisé',
}

const md = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ')

/** Transforme le contenu d'une fiche metadata.jsonld (objet parsé) en markdown. */
export function generateFicheDoc(doc, { sourcePath } = {}) {
  const graph = doc['@graph'] ?? []
  const services = graph.filter(n => types(n).includes('cpsv:PublicService'))
  const parent = services.find(n => n['dct:hasPart']) ?? services[0]
  const parts = services.filter(n => n['dct:isPartOf'])
  const leaves = parts.length > 0 ? parts : services
  const sourceCode = graph.find(n => types(n).includes('schema:SoftwareSourceCode'))
  const organisation = graph.find(n => types(n).includes('cv:PublicOrganisation'))
  const channels = graph.filter(n => types(n).includes('cv:Channel'))

  const docTitle = title(parent)
    ?? literal(sourceCode?.['schema:name'])
    ?? leaves.map(l => title(l)).filter(Boolean).join(' + ')

  const lines = []
  const push = (...xs) => lines.push(...xs)

  push(`# ${docTitle}`, '')
  push('> Documentation générée depuis `metadata.jsonld` par `scripts/generate-fiche-doc.mjs` - ne pas éditer à la main.')
  if (sourcePath)
    push(`> Fiche source : \`${sourcePath}\``)
  push('')

  // ── En-tête : identité de la règle ────────────────────────────────────────
  const identity = []
  const identifier = parent?.['dct:identifier']
  const version = literal(parent?.['dct:version']) ?? literal(sourceCode?.['schema:softwareVersion'])
  const orgLabel = organisation ? literal(organisation['skos:prefLabel']) : undefined
  if (identifier)
    identity.push(`- **Identifiant** : \`${identifier}\``)
  if (version)
    identity.push(`- **Version** : ${version}`)
  if (orgLabel)
    identity.push(`- **Autorité compétente** : ${orgLabel}`)
  const maturity = literal(parent?.['rdgf:maturity'])
  if (maturity)
    identity.push(`- **Maturité** : ${maturity} (échelle N0 référencée → N3 exécutable)`)
  const valid = literal(parent?.['dct:valid'])
  if (valid)
    identity.push(`- **Période de validité indicative** : \`${valid}\` (ne couvre pas le droit transitoire : savoir quelle version s'applique est une règle, pas une métadonnée)`)

  const desc = description(parent) ?? leaves.map(l => description(l)).filter(Boolean).join(' ')
  if (desc)
    push(desc, '')
  if (identity.length)
    push(...identity, '')

  // ── Régime de certification ───────────────────────────────────────────────
  const regime = literal(parent?.['rdgf:certificationRegime'])
  if (regime) {
    const info = REGIME_FR[regime]
    push('## Régime de certification', '')
    push(info ? `**Régime ${info.label}.** ${info.explain}` : `Régime déclaré : \`${regime}\`.`, '')
    const snapshot = parent?.['rdgf:implementationSnapshot']
    if (snapshot) {
      const repo = literal(snapshot['schema:codeRepository']) ?? nodeId(snapshot['schema:codeRepository'])
      const ref = literal(snapshot['rdgf:ref'])
      push(`Snapshot d'implémentation : ${repo ? `[${repo}](${repo})` : '(dépôt non renseigné)'}${ref ? ` - référence : ${ref}` : ''}.`, '')
    }
  }

  // ── Base légale ───────────────────────────────────────────────────────────
  const legal = leaves.flatMap(l => asArray(l['cv:hasLegalResource']))
  if (legal.length) {
    push('## Base légale', '')
    for (const resource of legal) {
      const url = nodeId(resource)
      const label = title(resource) ?? url
      const coverage = literal(resource['dct:coverage'])
      push(`- ${url ? `[${label}](${url})` : label}${coverage ? ` - ${coverage}` : ''}`)
    }
    push('')
  }

  // ── Par service (fiches composées : une section par sous-service) ────────
  const multi = leaves.length > 1
  for (const leaf of leaves) {
    if (multi) {
      push(`## ${title(leaf) ?? leaf['dct:identifier'] ?? nodeId(leaf)}`, '')
      const leafDesc = description(leaf)
      if (leafDesc)
        push(leafDesc, '')
      const requires = asArray(leaf['dct:requires']).map(nodeId).filter(Boolean)
      if (requires.length)
        push(`Dépend de : ${requires.map(r => `\`${r}\``).join(', ')}.`, '')
    }

    const inputs = serviceInputs(leaf)
    if (inputs.length) {
      push(multi ? '### Paramètres d\'entrée' : '## Paramètres d\'entrée', '')
      const qualified = inputs.some(p => literal(p['rdgf:boundaryKind']))
      const header = qualified
        ? '| Paramètre | Type | Obligatoire | Nature de frontière | Définition |'
        : '| Paramètre | Type | Obligatoire | Définition |'
      push(header, header.replace(/[^|]/g, '-'))
      for (const param of inputs) {
        const id = param['dct:identifier'] ?? ''
        const label = title(param)
        const name = label ? `**${md(label)}**<br>\`${id}\`` : `\`${id}\``
        const type = XSD_FR[param['cprmv:type']] ?? param['cprmv:type'] ?? ''
        const required = param['schema:valueRequired'] === true
          ? 'obligatoire'
          : `optionnel${param['schema:defaultValue'] !== undefined ? ` (défaut : \`${param['schema:defaultValue']}\`)` : ''}`
        let definition = literal(param['cprmv:definition']) ?? ''
        const evidence = param['rdgf:evidenceSource']
        if (evidence) {
          const evLabel = title(evidence)
          const evUrl = nodeId(evidence['foaf:page'])
          definition += `${definition ? '<br>' : ''}Attestée par : ${evUrl ? `[${md(evLabel ?? evUrl)}](${evUrl})` : md(evLabel ?? '')}`
        }
        const cells = [name, md(type), required]
        if (qualified)
          cells.push(md(BOUNDARY_FR[literal(param['rdgf:boundaryKind'])] ?? literal(param['rdgf:boundaryKind']) ?? ''))
        cells.push(md(definition))
        push(`| ${cells.join(' | ')} |`)
      }
      push('')
    }

    const outputs = asArray(leaf['cpsv:produces'])
    if (outputs.length) {
      push(multi ? '### Sorties' : '## Sorties', '')
      for (const output of outputs) {
        const id = output['dct:identifier'] ?? ''
        const label = title(output) ?? id
        const definition = literal(output['cprmv:definition'])
        const isExplanation = id !== 'value' && id !== 'ppa' && /explan|explic|conditions|trace/i.test(String(id) + String(definition ?? ''))
        push(`- **${label}** (\`${id}\`)${isExplanation ? ' - *sortie d\'explicabilité, utile pour expliquer un refus*' : ''}${definition ? ` : ${definition}` : ''}`)
      }
      push('')
    }
  }

  // ── Canaux d'accès ────────────────────────────────────────────────────────
  if (channels.length) {
    push('## Canaux d\'accès', '')
    for (const channel of channels) {
      const kind = literal(channel['dct:type']?.['skos:prefLabel'])
      const channelDesc = description(channel)
      const page = nodeId(channel['foaf:page'])
      push(`- ${kind ? `**${kind}**` : `\`${channel['dct:identifier'] ?? nodeId(channel)}\``}${channelDesc ? ` : ${channelDesc}` : ''}${page ? ` ([lien](${page}))` : ''}`)
    }
    push('')
  }

  // ── Cas de tests (enveloppe rdgf:) ────────────────────────────────────────
  const testCases = [...new Set(parent && !leaves.includes(parent) ? [...leaves, parent] : leaves)]
    .flatMap(l => asArray(l['rdgf:testCase']))
  if (testCases.length) {
    push('## Cas de tests', '')
    push('Les tests natifs font foi ; le catalogue publie leur enveloppe (intention, provenance, validation), jamais un format de situation commun.', '')
    for (const test of testCases) {
      const intent = literal(test['rdgf:intent'])
      if (intent)
        push(`- **Intention** : ${intent}`)
      const envelope = []
      const provenance = literal(test['rdgf:provenance'])
      if (provenance)
        envelope.push(`provenance : ${PROVENANCE_FR[provenance] ?? provenance}`)
      const validatedBy = literal(test['rdgf:validatedBy'])
      if (validatedBy)
        envelope.push(`validé par : ${validatedBy}`)
      const validatedAt = literal(test['rdgf:validatedAt'])
      if (validatedAt)
        envelope.push(`le ${validatedAt}`)
      const status = literal(test['rdgf:status'])
      if (status)
        envelope.push(`statut : ${status}`)
      const legalAnchor = literal(test['rdgf:legalAnchor'])
      if (legalAnchor)
        envelope.push(`ancre légale : ${legalAnchor}`)
      const tolerance = literal(test['rdgf:tolerance'])
      if (tolerance)
        envelope.push(`tolérance : ${tolerance}`)
      const nativeFormat = literal(test['rdgf:nativeFormat'])
      if (nativeFormat)
        envelope.push(`format natif : \`${nativeFormat}\``)
      if (envelope.length)
        push(`  - ${envelope.join(' · ')}`)
      const nativeRef = nodeId(test['rdgf:nativeRef'])
      if (nativeRef)
        push(`  - [Tests natifs (référence qui fait foi)](${nativeRef})`)
    }
    push('')
  }

  // ── Mappings opérationnels ────────────────────────────────────────────────
  const mappings = asArray(parent?.['rdgf:operationalMapping'])
  if (mappings.length) {
    push('## Mappings opérationnels recensés', '')
    push('Le catalogue recense des correspondances qui tournent (exercées par une CI), il n\'en rédige aucune.', '')
    for (const mapping of mappings) {
      const label = title(mapping)
      const from = literal(mapping['rdgf:from'])
      const to = literal(mapping['rdgf:to'])
      const artifact = nodeId(mapping['rdgf:artifact'])
      const maintainedBy = literal(mapping['rdgf:maintainedBy'])
      const ciStatus = literal(mapping['rdgf:ciStatus'])
      push(`- **${label ?? 'Mapping'}**${from && to ? ` : ${from} → ${to}` : ''}`)
      const detail = []
      if (artifact)
        detail.push(`[artefact](${artifact})`)
      if (maintainedBy)
        detail.push(`maintenu par : ${maintainedBy}`)
      if (ciStatus)
        detail.push(`statut CI : ${ciStatus}`)
      if (detail.length)
        push(`  - ${detail.join(' · ')}`)
    }
    push('')
  }

  // ── Historique de versions ────────────────────────────────────────────────
  const events = asArray(parent?.['rdgf:versionEvent'])
  if (events.length) {
    push('## Historique de versions', '')
    for (const event of events) {
      const eventVersion = literal(event['rdgf:version'])
      const date = literal(event['rdgf:date'])
      const kind = literal(event['rdgf:kind'])
      const eventDesc = description(event)
      const trigger = nodeId(event['rdgf:triggeredBy'])
      push(`- **${eventVersion ?? date ?? ''}**${date && eventVersion ? ` (${date})` : ''}${kind ? ` - ${kind}` : ''}${eventDesc ? ` : ${eventDesc}` : ''}${trigger ? ` ([texte déclencheur](${trigger}))` : ''}`)
    }
    push('')
  }

  // ── Code source ───────────────────────────────────────────────────────────
  if (sourceCode) {
    push('## Code source', '')
    const repo = literal(sourceCode['schema:codeRepository'])
    const name = literal(sourceCode['schema:name'])
    const codeDesc = literal(sourceCode['schema:description'])
    const languages = asArray(sourceCode['schema:programmingLanguage'])
    if (repo)
      push(`- **Dépôt** : [${name ?? repo}](${repo})${repo.includes('/tree/') ? ' (épinglé à une révision précise)' : ''}`)
    if (languages.length)
      push(`- **Langage(s)** : ${languages.join(', ')}`)
    if (codeDesc)
      push(`- ${codeDesc}`)
    push('')
  }

  return `${lines.join('\n').trimEnd()}\n`
}

// ── CLI ─────────────────────────────────────────────────────────────────────
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())
if (isMain) {
  const files = process.argv.slice(2)
  if (!files.length) {
    console.error('Usage : node scripts/generate-fiche-doc.mjs <metadata.jsonld> [...]')
    process.exit(1)
  }
  for (const file of files) {
    const doc = JSON.parse(readFileSync(file, 'utf8'))
    const out = join(dirname(file), 'documentation.md')
    writeFileSync(out, generateFicheDoc(doc, { sourcePath: file }))
    console.log(`- ${out}`)
  }
}
