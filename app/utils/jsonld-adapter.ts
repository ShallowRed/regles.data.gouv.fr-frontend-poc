/**
 * Adaptateur metadata.jsonld → Rule.
 *
 * Consomme les fiches JSON-LD du dépôt data (profil CPSV-AP + sous-ensemble CPRMV +
 * schema.org + Dublin Core) sans stack RDF : le @context des fiches aplatit déjà les
 * clés utiles (`title`, `description` en français).
 *
 * Rôle stratégique : outil de discussion du contrat d'interface front ↔ data. L'adaptateur
 * remplit ce qu'il peut depuis le profil, et liste explicitement dans `gaps` les champs du
 * schéma catalogue SANS équivalent côté data (la « couche confiance » : maturité, régime de
 * certification, enveloppe de tests, frontière...). Cette liste est affichée sur la fiche.
 */

import type { LegalReference, Rule, RuleBoundaryInput, RuleEngine, RuleOutput } from '~/types'

interface JsonldNode {
  'id'?: string
  'type'?: string | string[]
  [key: string]: unknown
}

export interface JsonldAdaptation {
  /** Champs de Rule dérivables du profil data. */
  base: Partial<Rule>
  /** Entrées (cv:hasInput) projetées en frontière ; kind par défaut `declaration`, à requalifier par la couche catalogue. */
  boundaryDraft: RuleBoundaryInput[]
  /** Sorties (cpsv:produces), sorties d'explicabilité détectées. */
  outputs: RuleOutput[]
  /** Champs du schéma catalogue sans équivalent dans la fiche source. */
  gaps: string[]
}

const asArray = <T>(value: T | T[] | undefined): T[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value]

/** Types d'un nœud : alias `type` du @context ou clé brute `@type` (les deux coexistent). */
const nodeTypes = (node: JsonldNode): string[] =>
  [...asArray(node.type), ...asArray(node['@type'] as string | string[])]

const hasType = (node: JsonldNode, type: string): boolean =>
  asArray(node.type).includes(type)

/** Extrait une chaîne d'une valeur JSON-LD (littéral direct ou objet { @value }). */
const literal = (value: unknown): string | undefined => {
  if (typeof value === 'string')
    return value
  if (value && typeof value === 'object' && '@value' in value)
    return String((value as Record<string, unknown>)['@value'])
  return undefined
}

const nodeId = (value: unknown): string | undefined => {
  if (value && typeof value === 'object' && 'id' in value)
    return String((value as Record<string, unknown>).id)
  return undefined
}

/** Titre d'un nœud : alias `title` du @context (langue fr) ou clé `dct:title` historique. */
const nodeTitle = (node: JsonldNode): string | undefined =>
  literal(node.title) ?? literal(node['dct:title'])

/** Slug lisible depuis un identifiant de paramètre. */
const inputLabel = (param: JsonldNode): string =>
  nodeTitle(param) ?? String(param['dct:identifier'] ?? '')

/**
 * Entrées du service : `cpsv:hasInput` (la propriété CPSV-AP 3.2.0, tranchée au contrat)
 * avec lecture de `cv:hasInput` (motif historique des premières fiches).
 */
const serviceInputs = (leaf: JsonldNode): JsonldNode[] => [
  ...asArray(leaf['cpsv:hasInput'] as JsonldNode | JsonldNode[]),
  ...asArray(leaf['cv:hasInput'] as JsonldNode | JsonldNode[]),
]

/** Nom de champ depuis un sh:path (`cprmv:garde_alternee` → `garde_alternee`). */
const shPathName = (value: unknown): string => {
  const path = literal(value) ?? ''
  return path.split(/[#:/]/).pop() ?? path
}

/** Champ feuille d'une structure SHACL, avec le fil des structures traversées. */
export interface StructureLeaf {
  id: string
  label: string
  definition?: string
  datatype?: string
  required: boolean
  defaultValue?: unknown
  /** Chemin des structures traversées (par exemple « Ménage › Foyer fiscal »). */
  group: string
}

/**
 * Aplatit une structure SHACL (cprmv:Structure + sh:property) en champs feuilles.
 * Les propriétés `sh:node` renvoient vers une autre structure du graphe (par `@id`)
 * ou l'embarquent : on récurse en gardant le fil des titres.
 */
export function structureLeaves(
  structure: JsonldNode,
  graph: JsonldNode[],
  trail: string[] = [],
): StructureLeaf[] {
  const title = nodeTitle(structure) ?? String(structure['dct:identifier'] ?? '')
  const nextTrail = [...trail, title].filter(Boolean)

  // Entrée-référence : pas de sh:property propre, un sh:node vers une structure du
  // graphe. Les feuilles sont préfixées par l'identifiant de l'entrée (deux trajets
  // référençant la même structure gardent des ids distincts).
  if (!structure['sh:property'] && structure['sh:node']) {
    const nested = structure['sh:node']
    const ref = typeof nested === 'string' ? nested : nodeId(nested) ?? (nested as JsonldNode)['@id']
    const target = resolveNodeRef(ref, graph)
    if (!target)
      return []
    const prefix = String(structure['dct:identifier'] ?? '')
    // Titre et identifiant retirés de la cible : le fil est déjà porté par l'entrée.
    return structureLeaves(
      { ...target, 'dct:title': undefined, 'title': undefined, 'dct:identifier': undefined },
      graph,
      nextTrail,
    ).map(leaf => ({ ...leaf, id: prefix ? `${prefix}.${leaf.id}` : leaf.id }))
  }

  return asArray(structure['sh:property'] as JsonldNode | JsonldNode[]).flatMap((property) => {
    const nested = property['sh:node']
    if (nested) {
      const ref = typeof nested === 'string' ? nested : nodeId(nested) ?? (nested as JsonldNode)['@id']
      const target = typeof nested === 'object' && (nested as JsonldNode)['sh:property']
        ? nested as JsonldNode
        : resolveNodeRef(ref, graph)
      return target ? structureLeaves(target, graph, nextTrail) : []
    }
    const id = shPathName(property['sh:path'])
    if (!id)
      return []
    return [{
      id,
      label: nodeTitle(property) ?? id,
      definition: literal(property['cprmv:definition']),
      datatype: literal(property['sh:datatype']),
      required: Number(property['sh:minCount'] ?? 0) >= 1,
      defaultValue: property['schema:defaultValue'],
      group: nextTrail.join(' › '),
    }]
  })
}

/** Une entrée déclarée comme structure composite (profil SHACL) plutôt que paramètre plat. */
export const isStructureInput = (param: JsonldNode): boolean =>
  nodeTypes(param).includes('cprmv:Structure') || param['sh:property'] !== undefined

/**
 * Nœuds adressables par `@id`/`id`, où qu'ils vivent dans le graphe : les structures
 * référencées par sh:node sont souvent déclarées dans le tableau d'entrées d'un
 * service, pas à la racine du @graph.
 */
function collectResolvables(value: unknown, found: JsonldNode[] = []): JsonldNode[] {
  if (Array.isArray(value)) {
    value.forEach(item => collectResolvables(item, found))
  }
  else if (value && typeof value === 'object') {
    const node = value as JsonldNode
    if (node['@id'] !== undefined || node.id !== undefined)
      found.push(node)
    Object.values(node).forEach(child => collectResolvables(child, found))
  }
  return found
}

const resolveNodeRef = (ref: unknown, graph: JsonldNode[]): JsonldNode | undefined =>
  collectResolvables(graph).find(node => node['@id'] === ref || node.id === ref)

/** Ids des structures référencées par un sh:node : ces nœuds sont des définitions, pas des entrées. */
export function referencedStructureIds(value: unknown, found: Set<string> = new Set()): Set<string> {
  if (Array.isArray(value)) {
    value.forEach(item => referencedStructureIds(item, found))
  }
  else if (value && typeof value === 'object') {
    const node = value as JsonldNode
    const ref = node['sh:node']
    if (typeof ref === 'string')
      found.add(ref)
    else if (ref && typeof ref === 'object')
      found.add(String((ref as JsonldNode)['@id'] ?? (ref as JsonldNode).id ?? ''))
    Object.values(node).forEach(child => referencedStructureIds(child, found))
  }
  return found
}

const engineFromLanguages = (languages: string[]): RuleEngine => {
  const lower = languages.map(l => l.toLowerCase())
  if (lower.includes('catala'))
    return 'catala'
  if (lower.some(l => l.includes('publicodes')))
    return 'publicodes'
  return 'autre'
}

export function adaptJsonldGraph(raw: string): JsonldAdaptation {
  const doc = JSON.parse(raw) as { '@graph': JsonldNode[] }
  const graph = doc['@graph']
  const gaps: string[] = []

  const services = graph.filter(node => hasType(node, 'cpsv:PublicService'))
  const parent = services.find(node => node['dct:hasPart']) ?? services[0]
  const parts = services.filter(node => node['dct:isPartOf'])
  const leaves = parts.length > 0 ? parts : services
  const sourceCode = graph.find(node => hasType(node, 'schema:SoftwareSourceCode'))
  const organisation = graph.find(node => hasType(node, 'cv:PublicOrganisation'))
  const channels = graph.filter(node => hasType(node, 'cv:Channel'))

  // Titre et description : service parent, sinon composition des sous-services.
  const title = literal(parent?.title)
    ?? (sourceCode ? literal(sourceCode['schema:name']) : undefined)
    ?? leaves.map(leaf => literal(leaf.title)).filter(Boolean).join(' + ')
  if (!literal(parent?.title) && parts.length > 0)
    gaps.push('titre du service parent (dct:title au niveau composite)')

  const description = literal(parent?.description)
    ?? leaves.map(leaf => literal(leaf.description)).filter(Boolean).join(' ')

  // Références légales (absentes de certaines fiches).
  const legalReferences: LegalReference[] = leaves.flatMap(leaf =>
    asArray(leaf['cv:hasLegalResource'] as JsonldNode | JsonldNode[]).map(resource => ({
      id: nodeId(resource) ?? String(resource['dct:identifier'] ?? ''),
      label: [literal(resource.title), literal(resource['dct:coverage'])].filter(Boolean).join(' - '),
      kind: 'autre' as const,
      eli: nodeId(resource),
    })),
  )
  if (legalReferences.length === 0)
    gaps.push('base légale (cv:hasLegalResource absent de la fiche)')

  // Autorité compétente : parfois référencée sans être décrite dans le graphe.
  const organismLabel = organisation ? literal(organisation['skos:prefLabel']) : undefined
  if (!organismLabel)
    gaps.push('autorité compétente (nœud cv:PublicOrganisation référencé mais non décrit)')

  // Canal API → apiUrl.
  const apiChannel = channels.find((channel) => {
    const kind = channel['dct:type'] as JsonldNode | undefined
    return (literal(kind?.['skos:prefLabel']) ?? '').toLowerCase().includes('api')
  })
  const apiUrl = apiChannel ? nodeId(apiChannel['foaf:page']) : undefined

  // Entrées → frontière. Si la fiche porte l'extension rdgf:boundaryKind (profil couche
  // confiance), on la lit ; sinon kind par défaut `declaration`, requalifiable côté catalogue.
  const seen = new Set<string>()
  let boundaryQualified = false
  let hasStructureInputs = false
  const structureDefinitions = referencedStructureIds(leaves.map(leaf => serviceInputs(leaf)))
  const boundaryDraft: RuleBoundaryInput[] = leaves.flatMap(leaf =>
    serviceInputs(leaf).flatMap((param) => {
      // Définition de structure référencée ailleurs : pas une entrée en soi.
      if (structureDefinitions.has(String(param['@id'] ?? '')))
        return []
      // Structure composite (profil SHACL) : la frontière est portée par les champs
      // feuilles, pas par le conteneur.
      if (isStructureInput(param)) {
        hasStructureInputs = true
        return structureLeaves(param, graph).flatMap((field) => {
          if (seen.has(field.id))
            return []
          seen.add(field.id)
          return [{
            id: field.id,
            label: field.label,
            kind: 'declaration' as const,
            definition: field.definition,
            required: field.required,
            group: field.group,
          }]
        })
      }
      const id = String(param['dct:identifier'] ?? '')
      if (!id || seen.has(id))
        return []
      seen.add(id)
      const declaredKind = literal(param['rdgf:boundaryKind']) as RuleBoundaryInput['kind'] | undefined
      if (declaredKind)
        boundaryQualified = true
      const evidence = param['rdgf:evidenceSource'] as JsonldNode | undefined
      return [{
        id,
        label: inputLabel(param),
        kind: declaredKind ?? ('declaration' as const),
        definition: literal(param['cprmv:definition']),
        required: param['schema:valueRequired'] === true,
        ...(evidence
          ? {
              evidenceSource: {
                label: nodeTitle(evidence) ?? '',
                url: nodeId(evidence['foaf:page']),
              },
            }
          : {}),
      }]
    }),
  )

  // Sorties, dont les traces d'explicabilité (motif « utile pour expliquer un refus »).
  const outputs: RuleOutput[] = leaves.flatMap(leaf =>
    asArray(leaf['cpsv:produces'] as JsonldNode | JsonldNode[]).map((output) => {
      const id = String(output['dct:identifier'] ?? '')
      const definition = literal(output['cprmv:definition'])
      return {
        id,
        label: nodeTitle(output) ?? id,
        definition,
        isExplanation: id !== 'value',
      }
    }),
  ).filter((output, index, all) => all.findIndex(other => other.id === output.id) === index)

  const languages = sourceCode ? asArray(sourceCode['schema:programmingLanguage'] as string | string[]) : []

  // Extensions « couche confiance » (profil rdgf:, cf. contrat-interface/profil-metadonnees.md).
  // Quand la fiche les porte, l'adaptateur les lit et le gap correspondant disparaît :
  // profileGaps → zéro est l'indicateur de convergence du contrat d'interface.
  const maturity = literal(parent?.['rdgf:maturity']) as Rule['maturity'] | undefined
  const certificationRegime = literal(parent?.['rdgf:certificationRegime']) as Rule['certificationRegime'] | undefined
  const hasTestEnvelope = leaves.some(leaf => asArray(leaf['rdgf:testCase']).length > 0)
    || asArray(parent?.['rdgf:testCase']).length > 0
  const hasVersionEvents = asArray(parent?.['rdgf:versionEvent']).length > 0

  const base: Partial<Rule> = {
    title,
    shortDescription: description ?? '',
    engine: engineFromLanguages(languages),
    version: literal(parent?.['dct:version'])
      ?? (sourceCode ? literal(sourceCode['schema:softwareVersion']) : undefined)
      ?? '0.0.0',
    apiUrl,
    sourceUrl: sourceCode ? literal(sourceCode['schema:codeRepository']) : undefined,
    capabilities: {
      hasApiDocumentation: Boolean(apiUrl),
    },
    ...(maturity ? { maturity } : {}),
    ...(certificationRegime ? { certificationRegime } : {}),
  }

  // Champs du schéma catalogue absents de la fiche : c'est la « couche confiance »,
  // l'apport du front à la co-écriture du profil. Chaque gap disparaît quand la fiche
  // adopte l'extension rdgf: correspondante.
  if (!maturity)
    gaps.push('niveau de maturité (échelle N0-N3) - rdgf:maturity')
  if (!certificationRegime)
    gaps.push('régime de certification (frontière / implémentation / référencement) - rdgf:certificationRegime')
  if (!boundaryQualified)
    gaps.push('qualification de la frontière des entrées (déclaration / donnée attestée / sortie de règle) - rdgf:boundaryKind')
  if (!hasTestEnvelope)
    gaps.push('cas de tests structurés (seuls des liens bruts dct:source vers les fichiers de tests) - rdgf:testCase')
  if (!hasVersionEvents)
    gaps.push('historique de versions lié aux textes déclencheurs - rdgf:versionEvent')
  if (hasStructureInputs)
    gaps.push('projection des structures composites vers les paramètres HTTP (convention d\'aplatissement non déclarée) - rdgf:operationalMapping')
  gaps.push(
    'nature de publication (ouverte / hybride / fermée)',
    'position réglementaire (simulation → rescrit)',
    'date de dernière mise à jour',
  )

  return { base, boundaryDraft, outputs, gaps }
}
