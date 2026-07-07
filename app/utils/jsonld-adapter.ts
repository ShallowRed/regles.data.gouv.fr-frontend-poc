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

/** Slug lisible depuis un identifiant de paramètre. */
const inputLabel = (param: JsonldNode): string =>
  literal(param['dct:title']) ?? String(param['dct:identifier'] ?? '')

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

  // Entrées → frontière (kind par défaut : déclaration ; requalification côté catalogue).
  const seen = new Set<string>()
  const boundaryDraft: RuleBoundaryInput[] = leaves.flatMap(leaf =>
    asArray(leaf['cv:hasInput'] as JsonldNode | JsonldNode[]).flatMap((param) => {
      const id = String(param['dct:identifier'] ?? '')
      if (!id || seen.has(id))
        return []
      seen.add(id)
      return [{
        id,
        label: inputLabel(param),
        kind: 'declaration' as const,
        definition: literal(param['cprmv:definition']),
        required: param['schema:valueRequired'] === true,
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
        label: literal(output['dct:title']) ?? id,
        definition,
        isExplanation: id !== 'value',
      }
    }),
  ).filter((output, index, all) => all.findIndex(other => other.id === output.id) === index)

  const languages = sourceCode ? asArray(sourceCode['schema:programmingLanguage'] as string | string[]) : []

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
  }

  // Champs du schéma catalogue toujours absents du profil data actuel : c'est la
  // « couche confiance », l'apport du front à la co-écriture du profil.
  gaps.push(
    'niveau de maturité (échelle N0-N3)',
    'régime de certification (frontière / implémentation / référencement)',
    'nature de publication (ouverte / hybride / fermée)',
    'position réglementaire (simulation → rescrit)',
    'qualification de la frontière des entrées (déclaration / donnée attestée / sortie de règle)',
    'cas de tests structurés (seuls des liens bruts dct:source vers les fichiers de tests)',
    'historique de versions lié aux textes déclencheurs',
    'date de dernière mise à jour',
  )

  return { base, boundaryDraft, outputs, gaps }
}
