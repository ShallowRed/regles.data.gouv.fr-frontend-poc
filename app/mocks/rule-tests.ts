import type { RuleTest } from '~/types'
import type { Multilingual } from '~/utils/localized-text'

/**
 * Cas de tests de la démo resserrée - l'enveloppe de confiance.
 *
 * Format aligné sur `shared-test-cases` d'aides-simplifiées (period + version de moteur +
 * provenance + validateur). Le test natif (`nativeRef`) fait foi ; le catalogue norme
 * l'enveloppe. Les `inputs`/`expected` plats sont une projection pédagogique.
 *
 * Anti-fabrication : les valeurs attendues sont des calculs réels (API Prest'Agri le
 * 2026-07-07 ; API OpenFisca France le 2026-07-08 ; suite pytest regalgo au SHA pinné).
 * Champs omis quand l'information n'est pas connue (pas de dossier réel inventé).
 */
/**
 * Ce module est aussi chargé par `scripts/verify-rules.mjs` sous node : il ne porte que
 * des données et des imports de types, la résolution de langue vit dans `useCatalog`.
 */
export const ruleTestsSource: Multilingual<RuleTest>[] = [
  /**
   * Cas contribué par le producteur (branche prestagri-tests) : exemple de ce qui est
   * attendu pour le test 4 de la suite Catala. Entrées et sortie dans la forme native
   * du moteur (structures Catala) : non rejouable contre l'API plate, le test natif
   * fait foi.
   */
  {
    id: 'prestagri-aide-scolarite4',
    ruleId: 'prestagri',
    label: {
      fr: 'Cas N°4 : logement separe, l\'adresse des parents est moins avantageuse',
      en: 'Case no. 4: separate housing, the parents\' address is less favourable',
    },
    scenario: '',
    inputs: { montant_matériel_spécifique: 0.0, trajet_depuis_domicile_agent: { distance_km: 60, durée_minutes: 50 }, trajet_depuis_domicile_étudiant: { Présent: { distance_km: 32, durée_minutes: 20 } }, valeur_point: 10.0, étudiant_en_filière_post_bac: false },
    expected: { critères_applicables: [
      { C2_domiciliation_séparée: '2' },
      { C3_éloignement_étudiant: '2' },
    ], nb_points: '4' },
    expectedUnit: '',
    source: 'administration',
    status: 'valide',
    validatedBy: 'API Prest\'Agri',
    validatedAt: '2026-07-31',
    engineVersion: 'catala',
    tags: ['aide-scolarite'],
    nativeFormat: 'catala-assert',
    nativeRef: 'https://github.com/betagouv/prestagri/tree/478b3cc2ab28299c73b94fdd192b0559ae5873b8/catala',
    notes: {
      fr: 'Les champs vides seront demandés à l\'utilisateur.',
      en: 'The empty fields will be asked of the user.',
    },
  },
  {
    id: 'prestagri-qf-couple-2-enfants',
    ruleId: 'prestagri',
    label: {
      fr: 'Agent seul, 30 000 € de revenu, 2 enfants',
      en: 'Single civil servant, 30 000 € income, 2 children',
    },
    scenario: {
      fr: 'Quotient familial d\'un agent au revenu fiscal de référence de 30 000 € avec 2 enfants à charge.',
      en: 'Family quotient of a civil servant with a reference tax income of 30 000 € and 2 dependent children.',
    },
    inputs: { foyer_fiscal_agent_revenu: 30000, foyer_fiscal_agent_membres: 3 },
    expected: '833.33',
    expectedUnit: 'EUR',
    source: 'administration',
    status: 'valide',
    validatedBy: 'API Prest\'Agri',
    validatedAt: '2026-08-13',
    engineVersion: 'prestagri 0.1.0',
    tags: ['quotient-familial', 'agent-public'],
    nativeFormat: 'catala-assert',
    nativeRef: 'https://github.com/betagouv/prestagri/tree/478b3cc2ab28299c73b94fdd192b0559ae5873b8/catala',
    notes: {
      fr: 'foyer_fiscal_agent_membres compte l\'agent et les enfants à charge.',
      en: 'foyer_fiscal_agent_membres counts the civil servant and the dependent children.',
    },
  },
  {
    id: 'prestagri-qf-parent-isole',
    ruleId: 'prestagri',
    label: {
      fr: 'Même situation, parent isolé',
      en: 'Same situation, single parent',
    },
    scenario: {
      fr: 'La majoration parent isolé ajoute une unité au foyer : le quotient familial baisse de 833,33 € à 625 €.',
      en: 'The single parent increase adds one unit to the household: the family quotient falls from 833.33 € to 625 €.',
    },
    inputs: { foyer_fiscal_agent_revenu: 30000, foyer_fiscal_agent_membres: 3, parent_isole: true },
    expected: '625.0',
    expectedUnit: 'EUR',
    source: 'administration',
    status: 'valide',
    validatedBy: 'API Prest\'Agri',
    validatedAt: '2026-08-13',
    engineVersion: 'prestagri 0.1.0',
    tags: ['quotient-familial', 'parent-isole'],
    nativeFormat: 'catala-assert',
    nativeRef: 'https://github.com/betagouv/prestagri/tree/478b3cc2ab28299c73b94fdd192b0559ae5873b8/catala',
    notes: {
      fr: 'La majoration parent isolé (case T) est portée par le paramètre parent_isole.',
      en: 'The single parent increase (box T) is carried by the parent_isole parameter.',
    },
  },
  {
    id: 'droit-vote-cas-nominal',
    ruleId: 'droits-civiques-elections',
    label: {
      fr: 'Française de 25 ans, inscrite, capacité civique',
      en: 'French national aged 25, registered, civic capacity',
    },
    scenario: {
      fr: 'Cas nominal documenté dans la fiche : nationalité française, 25 ans, capacité civique, inscrite sur les listes.',
      en: 'Nominal case documented in the record: French nationality, 25 years old, civic capacity, registered on the electoral roll.',
    },
    inputs: { nationalite_francaise: true, age: 25, capacite_civique: true, inscrit_listes_electorales: true },
    expected: true,
    source: 'communaute',
    status: 'valide',
    validatedBy: {
      fr: 'Suite pytest du dépôt source (commit pinné)',
      en: 'pytest suite of the source repository (pinned commit)',
    },
    engineVersion: 'regalgo-civique-droit-vote 1.0.4',
    legalAnchor: {
      fr: 'Code électoral, art. L. 2, L. 3, L. 5 à L. 7',
      en: 'Code électoral, art. L. 2, L. 3, L. 5 to L. 7',
    },
    tags: ['droit-de-vote', 'cas-nominal'],
    nativeFormat: 'pytest',
    nativeRef: 'https://github.com/qloridant/regalgo-civique-droit-vote/blob/13d9f80ca21d47f55aef9710e6288e94ea10ccc6/tests/test_algorithm.py',
  },
  {
    id: 'droit-vote-ue-municipales',
    ruleId: 'droits-civiques-elections',
    label: {
      fr: 'Citoyenne UE domiciliée en France, élections municipales',
      en: 'EU citizen residing in France, municipal elections',
    },
    scenario: {
      fr: 'La citoyenneté UE combinée au domicile en France ouvre le droit de vote aux municipales (Constitution, art. 88-3).',
      en: 'EU citizenship combined with residence in France opens the right to vote in municipal elections (Constitution, art. 88-3).',
    },
    inputs: { citoyennete_ue: true, domicile_france: true, age: 30, capacite_civique: true, inscrit_listes_electorales: true, type_election: 'municipale' },
    expected: true,
    source: 'communaute',
    status: 'en_revue',
    engineVersion: 'regalgo-civique-droit-vote 1.0.4',
    legalAnchor: {
      fr: 'Constitution, art. 88-3 ; Code électoral, art. L.O. 227-1',
      en: 'Constitution, art. 88-3; Code électoral, art. L.O. 227-1',
    },
    tags: ['droit-de-vote', 'citoyennete-ue', 'municipales'],
    nativeFormat: 'pytest',
    nativeRef: 'https://github.com/qloridant/regalgo-civique-droit-vote/blob/13d9f80ca21d47f55aef9710e6288e94ea10ccc6/tests/test_algorithm.py',
  },
  {
    id: 'prime-activite-celibataire-1000',
    ruleId: 'prime-activite-openfisca',
    label: {
      fr: 'Célibataire, 1 000 € net/mois',
      en: 'Single person, 1 000 € net per month',
    },
    scenario: {
      fr: 'Prime d\'activité d\'un célibataire sans enfant, salaire de 1 000 € par mois sur le trimestre de référence.',
      en: 'In-work benefit for a single person without children, earning 1 000 € per month over the reference quarter.',
    },
    inputs: { salaire_de_base: 1000 },
    expected: '224.39',
    expectedUnit: 'EUR',
    source: 'communaute',
    status: 'valide',
    validatedBy: 'API OpenFisca France',
    validatedAt: '2026-07-08',
    period: '2025-03',
    engineVersion: 'france-169.15.0',
    tags: ['prime-activite', 'celibataire'],
    nativeFormat: 'openfisca-yaml',
    nativeRef: 'https://github.com/openfisca/openfisca-france/tree/master/tests',
  },
  {
    id: 'prime-activite-suite-native',
    ruleId: 'prime-activite-openfisca',
    label: {
      fr: 'Suite de tests native openfisca-france',
      en: 'Native openfisca-france test suite',
    },
    scenario: {
      fr: 'Suite de tests maintenue dans le dépôt openfisca-france, dans son format natif '
        + '(YAML, entités et périodes).',
      en: 'Test suite maintained in the openfisca-france repository, in its native format '
        + '(YAML, entities and periods).',
    },
    source: 'communaute',
    status: 'valide',
    validatedBy: {
      fr: 'Intégration continue openfisca-france',
      en: 'openfisca-france continuous integration',
    },
    engineVersion: 'france-169.15.0',
    tags: ['prime-activite', 'suite-native'],
    nativeFormat: 'openfisca-yaml',
    nativeRef: 'https://github.com/openfisca/openfisca-france/tree/master/tests',
  },

  // Aides fiscales à l'innovation (Publicodes, règles DGE vendorées au SHA fc8e9a8).
  // Valeurs attendues calculées avec le moteur embarqué (publicodes 1.10.1) le 2026-07-09.
  {
    id: 'cir-bareme-metropole-100k',
    ruleId: 'entreprise-innovation',
    label: {
      fr: 'Industrielle au réel, 100 000 € de dépenses',
      en: 'Industrial company at actual profit, 100 000 € of expenditure',
    },
    scenario: {
      fr: 'Entreprise industrielle au régime réel : 100 000 € de dépenses de recherche en métropole ouvrent un crédit de 30 % (première tranche du barème).',
      en: 'Industrial company under the actual profit regime: 100 000 € of research expenditure in mainland France opens a credit of 30% (first band of the scale).',
    },
    inputs: {
      'natureActivite . industrielle': 'oui',
      'regimeFiscal': '\'reel-normal\'',
      'typeImposition': '\'is\'',
      'cir . depensesMetropole': 100000,
      'cir . depensesDom': 0,
    },
    targetVariable: 'cir . montant',
    expected: 30000,
    expectedUnit: 'EUR',
    source: 'communaute',
    status: 'valide',
    validatedBy: {
      fr: 'Moteur Publicodes embarqué (règles DGE au SHA fc8e9a8)',
      en: 'Embedded Publicodes engine (DGE rules at SHA fc8e9a8)',
    },
    validatedAt: '2026-07-09',
    engineVersion: 'publicodes 1.10.1 + règles fc8e9a8',
    legalAnchor: 'CGI, art. 244 quater B',
    tags: ['cir', 'bareme'],
    nativeFormat: 'publicodes-yaml',
    nativeRef: 'https://github.com/betagouv/publicodes-entreprise-innovation/blob/fc8e9a8ac572b03d75504a2aba39d5633c0b25ea/src/dispositifs/cir.publicodes',
  },
  {
    id: 'cir-bareme-metropole-150m',
    ruleId: 'entreprise-innovation',
    label: {
      fr: 'Industrielle au réel, 150 M€ de dépenses',
      en: 'Industrial company at actual profit, 150 M€ of expenditure',
    },
    scenario: {
      fr: 'Au-delà de 100 M€ de dépenses, le taux passe de 30 % à 5 % : 150 M€ ouvrent 30 M€ + 2,5 M€. Le cas éprouve la seconde tranche du barème.',
      en: 'Above 100 M€ of expenditure the rate falls from 30% to 5%: 150 M€ open 30 M€ + 2.5 M€. The case exercises the second band of the scale.',
    },
    inputs: {
      'natureActivite . industrielle': 'oui',
      'regimeFiscal': '\'reel-normal\'',
      'typeImposition': '\'is\'',
      'cir . depensesMetropole': 150000000,
      'cir . depensesDom': 0,
    },
    targetVariable: 'cir . montant',
    expected: 32500000,
    expectedUnit: 'EUR',
    source: 'communaute',
    status: 'valide',
    validatedBy: {
      fr: 'Moteur Publicodes embarqué (règles DGE au SHA fc8e9a8)',
      en: 'Embedded Publicodes engine (DGE rules at SHA fc8e9a8)',
    },
    validatedAt: '2026-07-09',
    engineVersion: 'publicodes 1.10.1 + règles fc8e9a8',
    legalAnchor: 'CGI, art. 244 quater B',
    tags: ['cir', 'bareme', 'plafond'],
    nativeFormat: 'publicodes-yaml',
    nativeRef: 'https://github.com/betagouv/publicodes-entreprise-innovation/blob/fc8e9a8ac572b03d75504a2aba39d5633c0b25ea/src/dispositifs/cir.publicodes',
  },
  {
    id: 'cir-non-eligible-artisanale-bnc',
    ruleId: 'entreprise-innovation',
    label: {
      fr: 'Artisanale, revenus BNC : non éligible',
      en: 'Craft company, BNC income: not eligible',
    },
    scenario: {
      fr: 'Une entreprise artisanale n\'est éligible au CIR qu\'au régime réel avec des revenus BIC ; en BNC, l\'éligibilité tombe.',
      en: 'A craft company qualifies for the research tax credit only under the actual profit regime with BIC income; with BNC income, eligibility falls away.',
    },
    inputs: {
      'natureActivite . artisanale': 'oui',
      'natureActivite . commerciale': 'non',
      'natureActivite . industrielle': 'non',
      'natureActivite . agricole': 'non',
      'regimeFiscal': '\'reel-normal\'',
      'typeImposition': '\'is\'',
      'typeDeRevenus': '\'bnc\'',
    },
    targetVariable: 'cir . eligibilite',
    expected: false,
    source: 'communaute',
    status: 'valide',
    validatedBy: {
      fr: 'Moteur Publicodes embarqué (règles DGE au SHA fc8e9a8)',
      en: 'Embedded Publicodes engine (DGE rules at SHA fc8e9a8)',
    },
    validatedAt: '2026-07-09',
    engineVersion: 'publicodes 1.10.1 + règles fc8e9a8',
    legalAnchor: 'CGI, art. 244 quater B',
    tags: ['cir', 'eligibilite'],
    nativeFormat: 'publicodes-yaml',
    nativeRef: 'https://github.com/betagouv/publicodes-entreprise-innovation/blob/fc8e9a8ac572b03d75504a2aba39d5633c0b25ea/src/dispositifs/cir.publicodes',
    notes: {
      fr: '« cir . montant » renvoie un montant y compris hors éligibilité ; écart signalé au producteur.',
      en: '"cir . montant" returns an amount even outside eligibility; the discrepancy was reported to the producer.',
    },
  },
  {
    id: 'cico-contrat-ordc-non',
    ruleId: 'entreprise-innovation',
    label: {
      fr: 'CICo sans contrat ORDC : non éligible',
      en: 'CICo without an ORDC contract: not eligible',
    },
    scenario: {
      fr: 'Situation native du dépôt DGE : sans contrat de recherche collaborative (ORDC), le crédit d\'impôt collaboration tombe.',
      en: 'Native situation from the DGE repository: without a collaborative research contract (ORDC), the collaboration tax credit falls away.',
    },
    inputs: {
      'contratOrdc': 'non',
      'natureActivite . industrielle': 'oui',
      'regimeFiscalEstReel': 'oui',
    },
    targetVariable: 'cico . eligibilite',
    expected: false,
    source: 'administration',
    status: 'valide',
    validatedBy: {
      fr: 'Situation publiée par le producteur (dépôt DGE, situations/cico.publicodes)',
      en: 'Situation published by the producer (DGE repository, situations/cico.publicodes)',
    },
    validatedAt: '2026-07-09',
    engineVersion: 'publicodes 1.10.1 + règles fc8e9a8',
    tags: ['cico', 'eligibilite'],
    nativeFormat: 'publicodes-yaml',
    nativeRef: 'https://github.com/betagouv/publicodes-entreprise-innovation/blob/main/situations/cico.publicodes',
  },
]
