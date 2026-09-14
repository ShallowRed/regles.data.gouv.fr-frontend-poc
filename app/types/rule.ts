/**
 * Type Rule - règle référencée au catalogue.
 *
 * Source : champs CPRMV (Common Public Rule Metadata Vocabulary) + extensions FR.
 */

import type { LegalReference } from './legal-reference'
import type { Organism } from './organism'

export type RuleEngine = 'publicodes' | 'openfisca' | 'catala' | 'proprietaire' | 'autre'

export type RuleNature = 'ouverte' | 'hybride' | 'fermee'

/**
 * Domaine de politique publique d'une règle. Facette de découverte du catalogue,
 * pensée pour des publics métier (cf. cas d'usages de la restitution).
 */
export type RuleDomain
  = | 'solidarite'
    | 'fiscalite'
    | 'emploi'
    | 'retraite'
    | 'logement'
    | 'culture'
    | 'sante'
    | 'citoyennete'

/**
 * Niveau d'une règle, calculé par le registre (ADR-0003), jamais lu dans une fiche.
 * - N0 : référencée (organisme et base légale)
 * - N1 : documentée (version, description, entrées et sorties)
 * - N2 : vérifiée (tests exécutés avec succès par le registre)
 * - N3 : exécutable (canal d'exécution : API ou moteur embarqué)
 */
export type MaturityLevel = 'N0' | 'N1' | 'N2' | 'N3'

export type Opposability = 'indicatif' | 'opposable'

/**
 * Position d'une règle sur le spectre de l'autorité administrative (cf. lecons-restitution).
 * - simulation-indicative : aperçu pédagogique, aucune valeur opposable.
 * - aide-au-remplissage : préremplit un formulaire que l'usager peut amender.
 * - assistance-administration : sert d'aide à l'instruction par un agent.
 * - rescrit-certifie : prise de position opposable d'une administration sur un cas.
 */
export type RegulatoryPosition
  = | 'simulation-indicative'
    | 'aide-au-remplissage'
    | 'assistance-administration'
    | 'rescrit-certifie'

/**
 * Niveau d'engagement du producteur (`rdgf:certificationLevel`, ADR-0002).
 * - certified : l'organisme répond des résultats calculés sur les faits déclarés, à la version indiquée.
 * - self-assessed : l'organisme publie le code et les tests à un commit désigné.
 * L'absence d'engagement signifie que la règle est référencée.
 */
export type CertificationLevel = 'certified' | 'self-assessed'

/**
 * Nature du fait d'une entrée (`rdgf:factKind`, ADR-0004). Un engagement « résultats certifiés »
 * couvre les résultats calculés sur les faits déclarés ; la nature dit qui répond de chaque valeur.
 * - declared : déclaré par la personne, non vérifié.
 * - attested : attesté par une administration qui en répond, mobilisable par une API.
 * - derived : sortie d'une autre règle ou paramètre partagé (SMIC).
 * - context : choisit la règle appliquée (type d'élection).
 */
export type FactKind = 'declared' | 'attested' | 'derived' | 'context'

/** Entrée de la règle, classée à sa frontière. */
export interface RuleBoundaryInput {
  id: string
  label: string
  kind: FactKind
  /** Définition juridique sourcée (reprise de cprmv:definition quand issue du profil data). */
  definition?: string
  /** Pour un fait attesté : l'organisme qui en répond (`dct:publisher`) et l'accès (`foaf:page`). */
  publisher?: { label: string, url?: string }
  required?: boolean
  /** Structure composite d'origine quand la fiche déclare des shapes SHACL (« Ménage › Foyer fiscal »). */
  group?: string
}

/** Sortie produite par la règle (dont les sorties d'explicabilité, « utiles pour expliquer un refus »). */
export interface RuleOutput {
  id: string
  label: string
  definition?: string
  /** Sortie d'explicabilité (trace de calcul) plutôt que résultat principal. */
  isExplanation?: boolean
}

/**
 * Correspondance opérationnelle recensée (`rdgf:operationalMapping`, ADR-0017). Le registre
 * recense des projections en production, exercées par une intégration continue, avec leur
 * mainteneur et l'état de cette intégration.
 */
export interface OperationalMapping {
  label: string
  /** Espace de départ (`rdgf:mapsFrom`). */
  from: string
  /** Espace d'arrivée (`rdgf:mapsTo`). */
  to: string
  /** Artefact en production (`dct:source`). */
  artifactUrl: string
  /** Mainteneur (`dct:publisher`). */
  maintainedBy: string
  /** État de l'intégration continue (`adms:status`). */
  ciStatus?: 'passing' | 'failing' | 'unknown'
}

/** Engagement du producteur (`rdgf:certification`, ADR-0002). */
export interface Certification {
  level: CertificationLevel
  /** Organisme qui s'engage (`prov:wasAttributedTo`), par identifiant du catalogue. */
  byOrganismId?: string
  /** Libellé de l'organisme quand il est lu dans la fiche. */
  byLabel?: string
  /** Date de l'engagement (`dct:issued`, ISO 8601). */
  at?: string
  /** Version couverte (`dct:conformsTo` › `dct:version`). */
  version?: string
  /** Périmètre en une phrase (`dct:description`). */
  description?: string
}

export interface Rule {
  id: string
  slug: string
  title: string
  shortDescription: string
  /** Nature de publication de la règle (ouverte, hybride, fermée). */
  nature: RuleNature
  /** Domaine de politique publique (facette de découverte). */
  domain: RuleDomain
  engine: RuleEngine
  maturity: MaturityLevel
  opposability: Opposability
  /** Position de la règle sur le spectre simulation → rescrit. */
  regulatoryPosition: RegulatoryPosition
  organism: Organism
  legalReferences: LegalReference[]
  /** Mots-clés (secteur, public, moment de vie) */
  tags: string[]
  /** Date de dernière modification (ISO 8601) */
  updatedAt: string
  /** Version sémantique */
  version: string
  /** URL d'API d'exécution si maturité N3 */
  apiUrl?: string
  /** URL d'un simulateur officiel opéré par l'administration productrice. */
  officialSimulatorUrl?: string
  /** URL du code source (forge publique) si maturité >= N2 */
  sourceUrl?: string
  /** Capabilités publiquement exposées sur la fiche règle. */
  capabilities?: {
    hasApiDocumentation?: boolean
    hasCalculationPreview?: boolean
    hasLegalTraceability?: boolean
    hasPublicTestCases?: boolean
  }
  /** Identifiants d'autres règles dont celle-ci dépend (variables partagées) */
  dependsOn?: string[]
  /** Engagement du producteur ; absent quand la règle est référencée. */
  certification?: Certification
  /** Entrées de la règle, classées par nature de fait (déclaré, attesté, dérivé, contexte). */
  boundary?: RuleBoundaryInput[]
  /** Sorties produites, dont les sorties d'explicabilité. */
  outputs?: RuleOutput[]
  /** Mappings opérationnels recensés (jamais rédigés par le catalogue). */
  operationalMappings?: OperationalMapping[]
  /**
   * Bloc d'extension namespacé par moteur. Les opinions ontologiques (entités, périodes)
   * restent locales au moteur, jamais dans le socle commun de métadonnées.
   */
  engineProfile?: Record<string, Record<string, unknown>>
  /**
   * Champs du schéma catalogue sans équivalent dans le profil metadata.jsonld source.
   * Renseigné par l'adaptateur JSON-LD : outil de discussion pour co-écrire le profil
   * avec l'équipe data (la « couche confiance » est l'apport du front au profil).
   */
  profileGaps?: string[]
  /** Chemin de la fiche metadata.jsonld source, quand l'entrée en est issue. */
  metadataSourcePath?: string
}
