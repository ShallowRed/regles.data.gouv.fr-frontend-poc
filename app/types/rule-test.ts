/**
 * Cas de test attaché à une règle (entrées attendues / résultat attendu).
 * Permet la validation N2 et l'illustration de la vue de traçabilité juridique.
 */

/** Valeur scalaire pouvant être passée en entrée d'une règle. */
export type RuleTestValue = string | number | boolean | null

export interface RuleTest {
  id: string
  /** Identifiant de la règle parente */
  ruleId: string
  /** Libellé court du cas (par exemple « Lycéen 17 ans, premier achat ») */
  label: string
  /** Résumé en une phrase de l'hypothèse testée */
  scenario: string
  /** Entrées clés-valeurs (clés selon le moteur) */
  inputs: Record<string, RuleTestValue>
  /** Résultat attendu (généralement un montant, un booléen ou un statut) */
  expected: RuleTestValue
  /** Unité du résultat attendu si numérique (par exemple `EUR`, `mois`) */
  expectedUnit?: string
  /** Source du cas : administration officielle, communauté tierce */
  source: 'administration' | 'communaute' | 'jurisprudence'
  /** Statut de validation du cas */
  status: 'valide' | 'en_revue' | 'echec'
}
