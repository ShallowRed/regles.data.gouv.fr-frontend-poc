import type { ExplanationNode } from '~/components/business/RuleSimulationPreview.vue'

/**
 * Aperçus de calcul, par règle exécutable.
 *
 * Démo resserrée : l'aperçu Prest'Agri reproduit un appel réel à l'API de production
 * (GET api.prest-agri.beta.gouv.fr/quotient_familial, exécuté le 2026-07-07), y compris
 * sa trace d'explication Catala. L'aperçu entreprise-innovation applique le barème réel
 * du fichier cir.publicodes à une assiette d'exemple.
 *
 * TODO (stretch) : exécuter publicodes-entreprise-innovation dans le navigateur pour un
 * aperçu calculé en direct plutôt que dérivé du barème.
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
  'prestagri': {
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
        source: 'Trace d\'explication renvoyée par l\'API Prest\'Agri (règles Catala) : « 30000.00/ (12 x 3.0) »',
      },
    ],
  },
  'entreprise-innovation': {
    situation: 'Entreprise industrielle au régime réel, 500 000 € de dépenses de recherche en métropole.',
    inputs: [
      { label: 'Nature de l\'activité', value: 'Industrielle (régime réel)' },
      { label: 'Dépenses de recherche éligibles', value: '500 000 € (métropole)' },
    ],
    result: { value: '150 000 €', label: 'Crédit d\'impôt recherche' },
    computedAt: '2026-07-07',
    explanation: [
      {
        label: 'Éligibilité au CIR',
        value: 'Oui',
        source: 'cir.publicodes : « cir . eligibilite » (activité commerciale, industrielle ou agricole au régime réel)',
      },
      {
        label: 'Barème métropole : 30 % jusqu\'à 100 M€',
        value: '500 000 € × 30 % = 150 000 €',
        source: 'cir.publicodes : « cir . creditMetropole » (barème 30 % / 5 %, CGI art. 244 quater B)',
      },
    ],
  },
}
