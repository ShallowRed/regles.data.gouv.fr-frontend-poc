import type { ExplanationNode } from '~/components/business/RuleSimulationPreview.vue'

/**
 * Aperçus de calcul pré-calculés, par règle exécutable.
 *
 * Conformément à la doctrine du POC, aucun calcul réel n'est effectué : on expose
 * un cas d'exemple représentatif avec son résultat indicatif et l'arbre
 * d'explicabilité (« comment ce résultat a été obtenu »), en langage courant.
 *
 * Les règles dont le moteur est fermé (propriétaire) n'ont pas d'aperçu intégré :
 * leur absence d'entrée ici est volontaire et gérée par la fiche.
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
  'rsa-eligibilite': {
    situation: 'Personne seule, sans activité, ressources nulles sur les 3 derniers mois.',
    inputs: [
      { label: 'Composition du foyer', value: '1 personne, sans enfant' },
      { label: 'Ressources des 3 derniers mois', value: '0 €' },
      { label: 'Situation', value: 'Sans emploi, résident en métropole' },
    ],
    result: { value: 'Éligible', label: 'Droit au RSA', unit: ': 635,71 €/mois estimés' },
    computedAt: '2026-05-02',
    explanation: [
      {
        label: 'Montant forfaitaire (personne seule)',
        value: '635,71 €',
        source: 'CASF art. L. 262-2 : barème 2026',
      },
      {
        label: 'Ressources prises en compte',
        value: '0 €',
        source: 'Moyenne des 3 derniers mois',
        children: [
          { label: 'Revenus d\'activité', value: '0 €' },
          { label: 'Autres prestations', value: '0 €' },
        ],
      },
      {
        label: 'RSA = forfait − ressources',
        value: '635,71 € − 0 € = 635,71 €',
        source: 'OpenFisca France : variable rsa',
      },
    ],
  },
  'impot-revenu-bareme': {
    situation: 'Couple marié, 2 parts, revenu net imposable de 45 000 €.',
    inputs: [
      { label: 'Foyer fiscal', value: '2 parts (couple sans personne à charge)' },
      { label: 'Revenu net imposable', value: '45 000 €' },
      { label: 'Année des revenus', value: '2025' },
    ],
    result: { value: '3 196', unit: '€', label: 'Impôt sur le revenu estimé' },
    computedAt: '2026-01-10',
    explanation: [
      {
        label: 'Quotient familial (revenu ÷ parts)',
        value: '45 000 € ÷ 2 = 22 500 €',
        source: 'CGI art. 197',
      },
      {
        label: 'Application du barème progressif par tranche',
        value: 'sur 22 500 €',
        children: [
          { label: 'Jusqu\'à 11 497 €', value: '0 %', source: '0 €' },
          { label: 'De 11 497 € à 22 500 €', value: '11 %', source: '1 210 €' },
        ],
      },
      {
        label: 'Impôt par part × nombre de parts',
        value: '1 598 € × 2 = 3 196 €',
        source: 'OpenFisca France : variable impot_revenu',
      },
    ],
  },
  'allocation-chomage-are': {
    situation: 'Fin de CDI après 24 mois, salaire journalier de référence de 64,50 €.',
    inputs: [
      { label: 'Durée d\'affiliation', value: '24 mois' },
      { label: 'Salaire journalier de référence', value: '64,50 €' },
      { label: 'Convention applicable', value: 'Unédic 2024' },
    ],
    result: { value: '40,20', unit: '€/jour', label: 'Allocation journalière estimée' },
    computedAt: '2026-03-22',
    explanation: [
      {
        label: 'Partie fixe + partie proportionnelle',
        value: '13,11 € + 40 % × 64,50 €',
        source: 'Convention Unédic 2024',
      },
      {
        label: 'Comparaison au plancher (57 % du SJR)',
        value: 'max(38,91 € ; 36,77 €) = 38,91 €',
        children: [
          { label: 'Formule fixe + proportionnelle', value: '38,91 €' },
          { label: 'Plancher 57 % du SJR', value: '36,77 €' },
        ],
      },
      {
        label: 'Allocation retenue (après plafonds)',
        value: '40,20 €/jour',
        source: 'Publicodes : règle allocation journalière',
      },
    ],
  },
  'apl-eligibilite': {
    situation: 'Étudiant locataire en zone 2, loyer de 480 €, ressources de 400 €/mois.',
    inputs: [
      { label: 'Statut', value: 'Locataire, logement conventionné' },
      { label: 'Zone géographique', value: 'Zone 2' },
      { label: 'Loyer mensuel', value: '480 €' },
      { label: 'Ressources mensuelles', value: '400 €' },
    ],
    result: { value: 'Éligible', label: 'Droit à l\'APL', unit: ': 196 €/mois estimés' },
    computedAt: '2026-05-18',
    explanation: [
      {
        label: 'Loyer retenu (plafonné selon la zone)',
        value: 'min(480 € ; 332 €) = 332 €',
        source: 'CCH art. L. 823-1 : plafonds zone 2',
      },
      {
        label: 'Participation personnelle (selon ressources)',
        value: '136 €',
        source: 'Barème CNAF 2026',
      },
      {
        label: 'APL = loyer plafonné − participation',
        value: '332 € − 136 € = 196 €',
        source: 'OpenFisca France : variable aide_logement',
      },
    ],
  },
  'aspa-minimum-vieillesse': {
    situation: 'Personne seule de 67 ans, pension de retraite de 700 €/mois.',
    inputs: [
      { label: 'Âge', value: '67 ans' },
      { label: 'Situation familiale', value: 'Personne seule' },
      { label: 'Ressources mensuelles', value: '700 € (pension)' },
    ],
    result: { value: '361,57', unit: '€/mois', label: 'Complément ASPA estimé' },
    computedAt: '2026-02-28',
    explanation: [
      {
        label: 'Plafond ASPA (personne seule)',
        value: '1 061,57 €/mois',
        source: 'CSS art. L. 815-1 : barème 2026',
      },
      {
        label: 'Ressources prises en compte',
        value: '700 €',
      },
      {
        label: 'ASPA = plafond − ressources (différentiel)',
        value: '1 061,57 € − 700 € = 361,57 €',
        source: 'OpenFisca France : variable aspa',
      },
    ],
  },
  'pass-culture-eligibilite': {
    situation: 'Lycéenne de 17 ans, résidant en métropole, première demande.',
    inputs: [
      { label: 'Âge', value: '17 ans' },
      { label: 'Résidence', value: 'Métropole' },
      { label: 'Date de la demande', value: '1er avril 2026' },
    ],
    result: { value: 'Éligible', label: 'Éligibilité au pass Culture' },
    computedAt: '2026-04-12',
    explanation: [
      {
        label: 'Condition d\'âge (15 à 18 ans)',
        value: '17 ans → remplie',
        source: 'Décret n° 2021-628, art. 2',
      },
      {
        label: 'Condition de résidence',
        value: 'Métropole → remplie',
        source: 'pass culture . résidence éligible',
      },
      {
        label: 'Éligibilité = âge ET résidence',
        value: 'vrai ET vrai = éligible',
        source: 'Publicodes : pass culture . éligible',
      },
    ],
  },
  'pass-culture-credit': {
    situation: 'Bénéficiaire activant son crédit à 18 ans.',
    inputs: [
      { label: 'Âge à l\'activation', value: '18 ans' },
    ],
    result: { value: '300', unit: '€', label: 'Crédit pass Culture initial' },
    computedAt: '2026-03-04',
    explanation: [
      {
        label: 'Palier applicable selon l\'âge',
        value: '18 ans → palier majeur',
        source: 'Décret n° 2021-628',
        children: [
          { label: '15 ans', value: '20 €' },
          { label: '16–17 ans', value: '30 €' },
          { label: '18 ans', value: '300 €' },
        ],
      },
      {
        label: 'Crédit attribué',
        value: '300 €',
        source: 'Publicodes : pass culture . crédit',
      },
    ],
  },
  'tarification-solidaire-eau-paris': {
    situation: 'Famille de 4 personnes, quotient familial de 700.',
    inputs: [
      { label: 'Composition', value: '2 adultes, 2 enfants' },
      { label: 'Quotient familial', value: '700' },
      { label: 'Commune', value: 'Paris' },
    ],
    result: { value: '96', unit: '€/an', label: 'Aide à l\'accès à l\'eau estimée' },
    computedAt: '2026-04-05',
    explanation: [
      {
        label: 'Tranche de quotient familial',
        value: 'QF 700 → tranche 2 (≤ 900)',
        source: 'Délibération 2025 DLH du Conseil de Paris',
      },
      {
        label: 'Montant par personne du foyer',
        value: '24 € × 4 = 96 €',
        source: 'Publicodes : tarif solidaire eau',
      },
    ],
  },
  'aide-achat-velo-grenoble': {
    situation: 'Achat d\'un vélo à assistance électrique, foyer non imposable.',
    inputs: [
      { label: 'Type de vélo', value: 'Vélo à assistance électrique' },
      { label: 'Imposition du foyer', value: 'Non imposable' },
      { label: 'Cumul bonus national', value: 'Oui' },
    ],
    result: { value: '400', unit: '€', label: 'Aide métropolitaine estimée' },
    computedAt: '2026-03-12',
    explanation: [
      {
        label: 'Taux selon le type de vélo',
        value: '50 % du prix, plafonné',
        source: 'Délibération métropolitaine du 7 février 2025',
      },
      {
        label: 'Majoration foyer non imposable',
        value: '+ 100 €',
      },
      {
        label: 'Aide attribuée (dans la limite du plafond)',
        value: '400 €',
        source: 'Publicodes : aide vélo',
      },
    ],
  },
  'prime-activite-eligibilite': {
    situation: 'Personne seule, salaire net de 1 200 €/mois.',
    inputs: [
      { label: 'Composition du foyer', value: '1 personne' },
      { label: 'Revenus professionnels', value: '1 200 €/mois' },
    ],
    result: { value: '186', unit: '€/mois', label: 'Prime d\'activité estimée' },
    computedAt: '2026-05-09',
    explanation: [
      {
        label: 'Montant forfaitaire + bonification individuelle',
        value: '622 € + 167 €',
        source: 'Barème prime d\'activité 2026',
      },
      {
        label: 'Prise en compte des revenus (61 %)',
        value: '− 732 €',
      },
      {
        label: 'Prime = forfait + bonif − ressources',
        value: '186 €/mois',
        source: 'OpenFisca France : variable ppa',
      },
    ],
  },
}
