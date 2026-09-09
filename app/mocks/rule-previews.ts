import type { ExplanationNode } from '~/components/business/RuleSimulationPreview.vue'
import type { Multilingual } from '~/utils/localized-text'
import { byLocale, localizeDeep } from '~/utils/localized-text'

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

export const rulePreviewsSource: Record<string, Multilingual<RulePreview>> = {
  prestagri: {
    situation: {
      fr: 'Agent du ministère, revenu fiscal de référence de 30 000 €, 2 enfants à charge.',
      en: 'Ministry civil servant, reference tax income of 30 000 €, 2 dependent children.',
    },
    inputs: [
      {
        label: { fr: 'Revenu fiscal de référence annuel', en: 'Annual reference tax income' },
        value: '30 000 €',
      },
      { label: { fr: 'Enfants à charge', en: 'Dependent children' }, value: '2' },
    ],
    result: {
      value: '833,33 €',
      label: { fr: 'Quotient familial mensuel', en: 'Monthly family quotient' },
    },
    computedAt: '2026-07-07',
    explanation: [
      {
        label: { fr: 'Unités du foyer', en: 'Household units' },
        value: '3,0',
        source: {
          fr: 'Note de service MASA : agent + majorations pour enfants à charge',
          en: 'Ministry of Agriculture service note: civil servant + increases for dependent children',
        },
      },
      {
        label: {
          fr: 'Quotient familial = revenu / (12 × unités)',
          en: 'Family quotient = income / (12 × units)',
        },
        value: '30 000,00 / (12 × 3,0) = 833,33 €',
        source: {
          fr: 'Détail renvoyé par l\'API Prest\'Agri : « 30000.00 / (12 × 3.0) »',
          en: 'Detail returned by the Prest\'Agri API: "30000.00 / (12 × 3.0)"',
        },
      },
    ],
  },
}

export const rulePreviewsFor = byLocale(
  locale => localizeDeep<Record<string, RulePreview>>(rulePreviewsSource, locale),
)
