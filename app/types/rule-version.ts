/**
 * Version historisée d'une règle.
 * Permet de tracer une divergence ou un changement (traçabilité juridique, revue collaborative, signalement de divergence).
 */
export interface RuleVersion {
  id: string
  ruleId: string
  /** Version sémantique (par exemple `2.4.0`) */
  version: string
  /** Date de publication (ISO 8601) */
  publishedAt: string
  /** Résumé éditorial du changement */
  changelog: string
  /** Type de changement principal */
  kind: 'majeur' | 'mineur' | 'correctif' | 'editorial'
  /** Auteur ou organisme à l'origine du changement */
  author: string
  /**
   * Identifiant de la référence légale qui a déclenché ce changement
   * (clé de legalReferencesMock). Matérialise « l'état du droit à une date donnée ».
   */
  triggeredBy?: string
}
