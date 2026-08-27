import type { ExplanationNode } from '~/components/business/RuleSimulationPreview.vue'

/**
 * Aperçus de calcul pré-calculés, par règle exécutable.
 *
 * Démo resserrée : l'aperçu Prest'Agri reproduit un appel réel à l'API de production
 * (GET api.prest-agri.beta.gouv.fr/quotient_familial, exécuté le 2026-07-07), y compris
 * sa trace d'explication Catala.
 *
 * La règle entreprise-innovation n'a plus d'entrée ici : son aperçu est calculé en
 * direct dans la page par le moteur Publicodes (composant RuleLiveCalculation,
 * composable usePublicodesEngine), à partir des fichiers de règles réels vendorés
 * dans app/data/publicodes/entreprise-innovation/.
 */
export interface RulePreview {
  /** Description en une ligne de la situation d'exemple. */
  situation: string
  /** Entrées de la situation, présentées à l'usager. */
  inputs: { label: string, value: string }[]
  /** Résultat principal affiché. */
  result: { value: string | number, unit?: string, label: string }
  /** Date du calcul d'exemple (ISO). */
  computedAt: string
  /** Arbre d'explicabilité du résultat. */
  explanation: ExplanationNode[]
}

export const rulePreviewsMock: Record<string, RulePreview> = {
  prestagri: {
    situation: 'Agent du ministère, revenu fiscal de référence de 30 000 €, 2 enfants à charge.',
    inputs: [
      { label: 'Revenu fiscal de référence annuel', value: '30 000 €' },
      { label: 'Enfants à charge', value: '2' },
    ],
    result: { value: '833,33 €', label: 'Quotient familial mensuel' },
    computedAt: '2026-07-07',
    explanation: [
      {
        label: 'Unités du foyer',
        value: '3,0',
        source: 'Note de service MASA : agent + majorations pour enfants à charge',
      },
      {
        label: 'Quotient familial = revenu / (12 × unités)',
        value: '30 000,00 / (12 × 3,0) = 833,33 €',
        source: 'Détail renvoyé par l\'API Prest\'Agri : « 30000.00 / (12 × 3.0) »',
      },
    ],
  },
}
