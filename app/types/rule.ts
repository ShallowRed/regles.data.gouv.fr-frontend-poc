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
 * Niveau de maturité d'une règle.
 * - N0 : référencée (titre + organisme + texte légal)
 * - N1 : métadonnées CPRMV complètes
 * - N2 : code source publié et cas de tests
 * - N3 : exécutable (API ou widget intégrable)
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
 * Régime de certification d'une règle. Le catalogue assume plusieurs régimes
 * (variantes de schéma selon les propriétés de la règle) plutôt qu'une promesse uniforme.
 * - frontiere : règle packageable (propriétaire clair, dépendances peu profondes).
 *   L'administration certifie le comportement entrées → sorties sur des faits déclarés,
 *   à une version donnée (sémantique du rescrit). Les cas de tests sont l'artefact de certification.
 * - implementation : règle du cœur systémique (chaîne de dépendances transitive : SMIC,
 *   bases ressources…). L'unité cataloguée est « la règle telle que calculée par telle
 *   implémentation à tel snapshot » ; l'unité certifiable est le couple tests + snapshot.
 * - referencement : entrée simplement référencée (métadonnées descriptives, ni code ni tests publiés).
 */
export type CertificationRegime = 'frontiere' | 'implementation' | 'referencement'

/**
 * Nature d'une entrée à la frontière de la règle. Un badge « certifiée » doit dire ce qu'il
 * couvre : la certification porte sur les faits déclarés, pas sur la provenance amont.
 * - declaration : fait déclaré par l'usager, non vérifié.
 * - donnee-attestee : donnée administrative avec un propriétaire institutionnel
 *   (ex. RFR servi par la DGFiP via API Particulier). Logique Evidence de CCCEV.
 * - sortie-regle : résultat d'une autre règle ou paramètre législatif partagé (ex. SMIC).
 * - contexte : paramètre d'exécution qui change la règle appliquée (ex. type d'élection).
 */
export type BoundaryKind = 'declaration' | 'donnee-attestee' | 'sortie-regle' | 'contexte'

/** Entrée de la règle, classée à sa frontière. */
export interface RuleBoundaryInput {
  id: string
  label: string
  kind: BoundaryKind
  /** Définition juridique sourcée (reprise de cprmv:definition quand issue du profil data). */
  definition?: string
  /** Pour une donnée attestée : qui l'atteste, et par quel canal. */
  evidenceSource?: { label: string, url?: string }
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
 * Mapping opérationnel recensé. Le catalogue ne rédige pas de dictionnaire de
 * correspondances : il recense des mappings qui tournent (exercés par une CI qui casse
 * quand ils deviennent faux), avec propriétaire et statut.
 */
export interface OperationalMapping {
  label: string
  /** Espace de départ (ex. « formulaire déclaratif aides-simplifiées »). */
  from: string
  /** Espace d'arrivée (ex. « entités/périodes OpenFisca France »). */
  to: string
  artifactUrl: string
  maintainedBy: string
  ciStatus?: 'passing' | 'failing' | 'unknown'
}

/** Certification d'un résultat par une administration. */
export interface Certification {
  /** Administration qui certifie ; on garde un id léger pour éviter une dépendance circulaire. */
  byOrganismId: string
  /** Date de certification (ISO 8601). */
  at: string
  /** Référence du rescrit ou du document de certification, si applicable. */
  ref?: string
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
  /** Certification éventuelle (rescrit ou validation formelle). */
  certification?: Certification
  /** Régime de certification applicable (variantes de schéma selon les propriétés de la règle). */
  certificationRegime?: CertificationRegime
  /** Frontière de la règle : entrées classées par nature (déclaration, donnée attestée, sortie de règle, contexte). */
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
