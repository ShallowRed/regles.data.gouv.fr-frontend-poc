/**
 * Génération de formulaire depuis une fiche metadata.jsonld.
 *
 * Démonstration « le format génère des features » : les paramètres typés de la fiche
 * (cpsv:hasInput → cprmv:Parameter : identifiant, titre, définition juridique, type XSD,
 * caractère requis, valeur par défaut) suffisent à produire un formulaire exécutable,
 * et le canal API déclaré dans la fiche (cv:hasChannel → foaf:page) donne l'endpoint.
 * Aucune connaissance de la règle n'est codée en dur ici.
 */

import prestagriRaw from '~/data/jsonld/ministere-agriculture/prestagri/metadata.jsonld?raw'
import { isStructureInput, structureLeaves } from '~/utils/jsonld-adapter'

interface JsonldNode {
  'id'?: string
  'type'?: string | string[]
  '@type'?: string | string[]
  [key: string]: unknown
}

export interface FicheFormParam {
  id: string
  label: string
  definition?: string
  /** Type XSD compacté (`integer`, `boolean`, `decimal`, `string`...). */
  xsdType: string
  required: boolean
  defaultValue?: string | number | boolean
}

export interface FicheForm {
  serviceTitle: string
  serviceDescription?: string
  endpoint: string
  params: FicheFormParam[]
  /**
   * La fiche déclare des structures composites (shapes SHACL) sans déclarer leur
   * projection vers les paramètres HTTP : le rejeu piloté par la fiche est suspendu
   * tant que la convention d'aplatissement n'est pas au contrat.
   */
  compositeWithoutMapping?: boolean
}

function asArray<T>(value: T | T[] | undefined): T[] {
  return value === undefined ? [] : Array.isArray(value) ? value : [value]
}

function literal(value: unknown): string | undefined {
  if (typeof value === 'string')
    return value
  if (value && typeof value === 'object' && '@value' in value)
    return String((value as Record<string, unknown>)['@value'])
  return undefined
}

function refId(value: unknown): string | undefined {
  return value && typeof value === 'object' && 'id' in value
    ? String((value as Record<string, unknown>).id)
    : undefined
}

/** Compacte un type XSD, qu'il soit préfixé (`xsd:integer`) ou IRI complet. */
function compactXsd(value: unknown): string {
  const raw = literal(value) ?? ''
  return raw.split(/[#:]/).pop() ?? 'string'
}

export function extractServiceForm(raw: string, serviceIdentifier: string): FicheForm | null {
  const graph = (JSON.parse(raw) as { '@graph': JsonldNode[] })['@graph']
  const service = graph.find(node => node['dct:identifier'] === serviceIdentifier)
  if (!service)
    return null

  const channel = graph.find(node => node.id === refId(service['cv:hasChannel']))
  const endpoint = channel ? refId(channel['foaf:page']) : undefined
  if (!endpoint)
    return null

  const inputs = [
    ...asArray(service['cpsv:hasInput'] as JsonldNode | JsonldNode[]),
    ...asArray(service['cv:hasInput'] as JsonldNode | JsonldNode[]),
  ]

  // Structures composites : les champs typés existent (feuilles SHACL) mais la fiche
  // ne déclare pas comment ils se projettent en paramètres HTTP - le formulaire les
  // montre sans prétendre pouvoir rejouer.
  const compositeWithoutMapping = inputs.some(param => isStructureInput(param))

  const params: FicheFormParam[] = inputs.flatMap((param) => {
    if (isStructureInput(param)) {
      return structureLeaves(param, graph).map(field => ({
        id: field.id,
        label: field.group ? `${field.group} · ${field.label}` : field.label,
        definition: field.definition,
        xsdType: compactXsd(field.datatype),
        required: field.required,
        defaultValue: field.defaultValue as FicheFormParam['defaultValue'],
      }))
    }
    return [{
      id: String(param['dct:identifier'] ?? ''),
      label: literal(param.title) ?? literal(param['dct:title']) ?? String(param['dct:identifier'] ?? ''),
      definition: literal(param['cprmv:definition']),
      xsdType: compactXsd(param['cprmv:type']),
      required: param['schema:valueRequired'] === true,
      defaultValue: param['schema:defaultValue'] as FicheFormParam['defaultValue'],
    }]
  }).filter(param => param.id)

  return {
    serviceTitle: literal(service.title) ?? literal(service['dct:title']) ?? serviceIdentifier,
    serviceDescription: literal(service.description) ?? literal(service['dct:description']),
    endpoint,
    params,
    ...(compositeWithoutMapping ? { compositeWithoutMapping } : {}),
  }
}

/** Formulaire du calcul de quotient familial Prest'Agri, dérivé de la fiche réelle. */
export const prestagriQuotientFamilialForm = extractServiceForm(prestagriRaw, 'prestagri-quotient-familial')
