/**
 * Version publiée d'une règle (`rdgf:versionEvent`, ADR-0008) : un événement daté par version,
 * relié au texte qui l'a déclenchée.
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
  /** Nature du changement (`rdgf:changeKind`, ADR-0008). */
  kind: 'major' | 'minor' | 'legal'
  /** Auteur ou organisme à l'origine du changement */
  author: string
  /**
   * Identifiant de la référence légale qui a déclenché ce changement
   * (clé de legalReferencesSource). Matérialise « l'état du droit à une date donnée ».
   */
  triggeredBy?: string
}
