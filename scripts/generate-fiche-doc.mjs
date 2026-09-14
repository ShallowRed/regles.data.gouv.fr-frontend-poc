#!/usr/bin/env node
/**
 * Génère une documentation markdown lisible par un humain depuis une fiche
 * metadata.jsonld (profil CPSV-AP + sous-ensemble CPRMV + surcouche rdgf:, cf.
 * contrat-interface/decisions/).
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
import { isStructureInput, referencedStructureIds, structureLeaves } from '../app/utils/jsonld-adapter.ts'

const asArray = v => (v === undefined ? [] : Array.isArray(v) ? v : [v])
/** Littéral JSON-LD : chaîne, objet { @value } ou tableau multilingue (français par défaut). */
function literal(v, lang = 'fr') {
  if (Array.isArray(v)) {
    const found = v.find(item => item?.['@language'] === lang) ?? v.find(item => item?.['@language'] === 'fr') ?? v[0]
    return literal(found, lang)
  }
  if (typeof v === 'string')
    return v
  return v && typeof v === 'object' && '@value' in v ? String(v['@value']) : undefined
}
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

const FACT_KIND_FR = {
  declared: 'fait déclaré par la personne, non vérifié',
  attested: 'donnée attestée par une administration qui en répond',
  derived: 'sortie d\'une autre règle ou paramètre partagé',
  context: 'paramètre de contexte (choisit la règle appliquée)',
}

const CERTIFICATION_FR = {
  'certified': {
    label: 'résultats certifiés',
    explain: 'L\'organisme répond des résultats calculés sur les faits déclarés, à la version indiquée. '
      + 'Le profil exige la nature de chaque entrée et des cas de tests avec enveloppe.',
  },
  'self-assessed': {
    label: 'code et tests publiés',
    explain: 'L\'organisme publie le code et les tests à un commit désigné. Le profil exige un dépôt '
      + 'désigné à un commit et une suite de tests native référencée.',
  },
}

const ORIGIN_FR = {
  'administration': 'administration compétente',
  'community': 'communauté',
  'case-law': 'jurisprudence',
  'circular': 'circulaire',
  'anonymised-case': 'dossier réel anonymisé',
}

const CHANGE_KIND_FR = { major: 'majeur', minor: 'mineur', legal: 'réglementaire' }

/** Libellé d'un agent référencé par identifiant dans le graphe, sinon l'identifiant ou le littéral. */
function agentLabel(ref, graph) {
  const id = typeof ref === 'string' ? ref : nodeId(ref)
  if (!id)
    return literal(ref)
  const node = graph.find(n => n.id === id || n['@id'] === id)
  return (node ? literal(node['skos:prefLabel']) ?? title(node) : undefined) ?? id
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
  const valid = literal(parent?.['dct:valid'])
  if (valid)
    identity.push(`- **Période de validité indicative** : \`${valid}\` (ne couvre pas le droit transitoire : savoir quelle version s'applique est une règle, pas une métadonnée)`)

  const desc = description(parent) ?? leaves.map(l => description(l)).filter(Boolean).join(' ')
  if (desc)
    push(desc, '')
  if (identity.length)
    push(...identity, '')

  // ── Garantie du producteur (rdgf:certification, ADR-0002) ────────────────
  const certification = parent?.['rdgf:certification']
  push('## Garantie du producteur', '')
  if (certification) {
    const level = literal(certification['rdgf:certificationLevel'])
    const info = CERTIFICATION_FR[level]
    push(info ? `**${info.label[0].toUpperCase()}${info.label.slice(1)}.** ${info.explain}` : `Niveau déclaré : \`${level}\`.`, '')
    const facts = []
    const by = agentLabel(certification['prov:wasAttributedTo'], graph)
    if (by)
      facts.push(`Engagement de ${by}`)
    const issued = literal(certification['dct:issued'])
    if (issued)
      facts.push(`le ${issued}`)
    const conformsTo = certification['dct:conformsTo']
    const coveredVersion = conformsTo ? literal(conformsTo['dct:version']) : undefined
    if (coveredVersion)
      facts.push(`version ${coveredVersion}`)
    if (facts.length)
      push(`${facts.join(', ')}.`, '')
    const scope = description(certification)
    if (scope)
      push(scope, '')
  }
  else {
    push('Règle référencée : le producteur ne s\'engage pas sur les résultats. La fiche décrit la règle, sa base légale et son organisme.', '')
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
      const qualified = inputs.some(p => literal(p['rdgf:factKind']))
      const header = qualified
        ? '| Paramètre | Type | Obligatoire | Nature du fait | Définition |'
        : '| Paramètre | Type | Obligatoire | Définition |'
      push(header, header.replace(/[^|]/g, '-'))
      // Structures composites (shapes SHACL) : une ligne par champ feuille, avec le fil
      // des structures traversées ; les définitions référencées ne sont pas des entrées.
      const structureDefinitions = referencedStructureIds(inputs)
      const rows = inputs.flatMap((param) => {
        if (structureDefinitions.has(String(param['@id'] ?? '')))
          return []
        if (isStructureInput(param)) {
          return structureLeaves(param, graph).map(leaf => ({
            'dct:identifier': leaf.id,
            'dct:title': leaf.group ? `${leaf.group} · ${leaf.label}` : leaf.label,
            'cprmv:definition': leaf.definition,
            'cprmv:type': leaf.datatype,
            'schema:valueRequired': leaf.required,
            'schema:defaultValue': leaf.defaultValue,
          }))
        }
        return [param]
      })
      for (const param of rows) {
        const id = param['dct:identifier'] ?? ''
        const label = title(param)
        const name = label ? `**${md(label)}**<br>\`${id}\`` : `\`${id}\``
        const datatype = param['sh:datatype'] ?? param['cprmv:type']
        const type = XSD_FR[datatype] ?? datatype ?? ''
        const required = param['schema:valueRequired'] === true
          ? 'obligatoire'
          : `optionnel${param['schema:defaultValue'] !== undefined ? ` (défaut : \`${param['schema:defaultValue']}\`)` : ''}`
        let definition = literal(param['cprmv:definition']) ?? ''
        const publisher = agentLabel(param['dct:publisher'], graph)
        if (publisher) {
          const page = nodeId(param['foaf:page']) ?? (typeof param['foaf:page'] === 'string' ? param['foaf:page'] : undefined)
          definition += `${definition ? '<br>' : ''}Attestée par ${page ? `[${md(publisher)}](${page})` : md(publisher)}`
        }
        const cells = [name, md(type), required]
        if (qualified)
          cells.push(md(FACT_KIND_FR[literal(param['rdgf:factKind'])] ?? literal(param['rdgf:factKind']) ?? ''))
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

  // ── Cas de tests (enveloppe rdgf:TestCase, ADR-0006) ─────────────────────
  const testCases = [...new Set(parent && !leaves.includes(parent) ? [...leaves, parent] : leaves)]
    .flatMap(l => asArray(l['rdgf:testCase']))
  if (testCases.length) {
    push('## Cas de tests', '')
    push('Le test natif constitue la référence ; la fiche publie son enveloppe (ce qu\'il vérifie, origine, validation). Les résultats d\'exécution du registre sont publiés à part, en assertions EARL.', '')
    for (const test of testCases) {
      const label = title(test)
      if (label)
        push(`- **${md(label)}**`)
      const testDesc = description(test)
      if (testDesc)
        push(`  - ${testDesc}`)
      const envelope = []
      const origin = literal(test['rdgf:origin'])
      if (origin)
        envelope.push(`origine : ${ORIGIN_FR[origin] ?? origin}`)
      const validatedBy = agentLabel(test['prov:wasAttributedTo'], graph)
      if (validatedBy)
        envelope.push(`validé par : ${validatedBy}`)
      const validatedAt = literal(test['dct:date'])
      if (validatedAt)
        envelope.push(`le ${validatedAt}`)
      const status = literal(test['adms:status'])
      if (status)
        envelope.push(`statut : ${status}`)
      const legal = nodeId(test['cv:hasLegalResource']) ?? literal(test['cv:hasLegalResource'])
      if (legal)
        envelope.push(`texte visé : ${legal}`)
      const tolerance = literal(test['rdgf:tolerance'])
      if (tolerance)
        envelope.push(`tolérance : ${tolerance}`)
      const format = literal(test['dct:format'])
      if (format)
        envelope.push(`format natif : \`${format}\``)
      if (envelope.length)
        push(`  - ${envelope.join(' · ')}`)
      const nativeRef = nodeId(test['dct:source']) ?? literal(test['dct:source'])
      if (nativeRef)
        push(`  - [Test natif de référence](${nativeRef})`)
    }
    push('')
  }

  // ── Correspondances opérationnelles (rdgf:operationalMapping, ADR-0017) ───
  const mappings = asArray(parent?.['rdgf:operationalMapping'])
  if (mappings.length) {
    push('## Correspondances opérationnelles recensées', '')
    push('Le registre recense des correspondances en production, exercées par une intégration continue ; il n\'en rédige aucune.', '')
    for (const mapping of mappings) {
      const label = title(mapping)
      const from = literal(mapping['rdgf:mapsFrom'])
      const to = literal(mapping['rdgf:mapsTo'])
      const artifact = nodeId(mapping['dct:source']) ?? literal(mapping['dct:source'])
      const maintainedBy = agentLabel(mapping['dct:publisher'], graph)
      const ciStatus = literal(mapping['adms:status'])
      push(`- **${label ?? 'Correspondance'}**${from && to ? ` : ${from} → ${to}` : ''}`)
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

  // ── Historique de versions (rdgf:versionEvent, ADR-0008) ─────────────────
  const events = asArray(parent?.['rdgf:versionEvent'])
  if (events.length) {
    push('## Historique de versions', '')
    for (const event of events) {
      const eventVersion = literal(event['dct:version'])
      const date = literal(event['dct:issued'])
      const kind = literal(event['rdgf:changeKind'])
      const eventDesc = description(event)
      const trigger = nodeId(event['rdgf:triggeredBy']) ?? literal(event['rdgf:triggeredBy'])
      push(`- **${eventVersion ?? date ?? ''}**${date && eventVersion ? ` (${date})` : ''}${kind ? ` - ${CHANGE_KIND_FR[kind] ?? kind}` : ''}${eventDesc ? ` : ${eventDesc}` : ''}${trigger ? ` ([texte déclencheur](${trigger}))` : ''}`)
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
