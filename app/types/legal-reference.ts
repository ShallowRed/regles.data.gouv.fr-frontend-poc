/**
 * Référence légale rattachée à une règle.
 * Champ CPRMV : `legalBasis`.
 */
export interface LegalReference {
  id: string
  label: string
  /** URL ELI (European Legislation Identifier) si disponible */
  eli?: string
  /** Type de texte (loi, décret, arrêté, circulaire, code) */
  kind?: 'loi' | 'decret' | 'arrete' | 'circulaire' | 'code' | 'autre'
}
