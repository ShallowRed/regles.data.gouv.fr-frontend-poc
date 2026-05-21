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
}
