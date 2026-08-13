import type { RuleTest } from '~/types'

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
export const ruleTestsMock: RuleTest[] = [
  /**
   * Cas contribué par le producteur (branche prestagri-tests) : exemple de ce qui est
   * attendu pour le test 4 de la suite Catala. Entrées et sortie dans la forme native
   * du moteur (structures Catala) : non rejouable contre l'API plate, le test natif
   * fait foi.
   */
  {
    id: 'prestagri-aide-scolarite4',
    ruleId: 'prestagri',
    label: 'Cas N°4 : logement separe, l\'adresse des parents est moins avantageuse',
    scenario: '',
    inputs: {'montant_matériel_spécifique': 0.0,
             'trajet_depuis_domicile_agent': {'distance_km': 60, 'durée_minutes': 50},
             'trajet_depuis_domicile_étudiant': {'Présent': {'distance_km': 32,
                                                 'durée_minutes': 20}},
             'valeur_point': 10.0,
             'étudiant_en_filière_post_bac': false},
    expected: {"critères_applicables": [
                        {"C2_domiciliation_séparée": "2"},
                        {"C3_éloignement_étudiant": "2"}],
               "nb_points": "4"},
    expectedUnit: '',
    source: 'administration',
    status: 'valide',
    validatedBy: 'API Prest\'Agri (calcul réel)',
    validatedAt: '2026-07-31',
    engineVersion: 'catala',
    tags: ['aide-scolarite'],
    nativeFormat: 'catala-assert',
    nativeRef: 'https://github.com/betagouv/prestagri/tree/478b3cc2ab28299c73b94fdd192b0559ae5873b8/catala',
    notes: 'Validé contre l\'API le 2026-07-31. Les champs vides seront demandés à l\'utilisateur.',
  },
  {
    id: 'prestagri-qf-couple-2-enfants',
    ruleId: 'prestagri',
    label: 'Agent seul, 30 000 € de revenu, 2 enfants',
    scenario: 'Quotient familial d\'un agent au revenu fiscal de référence de 30 000 € avec 2 enfants à charge.',
    inputs: { foyer_fiscal_agent_revenu: 30000, foyer_fiscal_agent_membres: 3 },
    expected: '833.33',
    expectedUnit: 'EUR',
    source: 'administration',
    status: 'valide',
    validatedBy: 'API Prest\'Agri (calcul réel)',
    validatedAt: '2026-08-13',
    engineVersion: 'prestagri 0.1.0',
    tags: ['quotient-familial', 'agent-public'],
    nativeFormat: 'catala-assert',
    nativeRef: 'https://github.com/betagouv/prestagri/tree/478b3cc2ab28299c73b94fdd192b0559ae5873b8/catala',
    notes: 'Migré vers le schéma composite de l\'API (dérive détectée le 2026-07-08) : foyer_fiscal_agent_membres = agent + enfants à charge. Revalidé le 2026-08-13, même résultat.',
  },
  {
    id: 'prestagri-qf-parent-isole',
    ruleId: 'prestagri',
    label: 'Même situation, parent isolé',
    scenario: 'La majoration parent isolé ajoute une unité au foyer : le quotient familial baisse de 833,33 € à 625 €.',
    inputs: { foyer_fiscal_agent_revenu: 30000, foyer_fiscal_agent_membres: 3, parent_isole: true },
    expected: '625.0',
    expectedUnit: 'EUR',
    source: 'administration',
    status: 'valide',
    validatedBy: 'API Prest\'Agri (calcul réel)',
    validatedAt: '2026-08-13',
    engineVersion: 'prestagri 0.1.0',
    tags: ['quotient-familial', 'parent-isole'],
    nativeFormat: 'catala-assert',
    nativeRef: 'https://github.com/betagouv/prestagri/tree/478b3cc2ab28299c73b94fdd192b0559ae5873b8/catala',
    notes: 'Migré vers le schéma composite de l\'API et revalidé le 2026-08-13 : le critère parent isolé (+1 part, case T) est porté par le paramètre parent_isole. Même résultat que la validation du 2026-07-07.',
  },
  {
    id: 'droit-vote-cas-nominal',
    ruleId: 'droits-civiques-elections',
    label: 'Française de 25 ans, inscrite, capacité civique',
    scenario: 'Cas nominal documenté dans la fiche : nationalité française, 25 ans, capacité civique, inscrite sur les listes.',
    inputs: { nationalite_francaise: true, age: 25, capacite_civique: true, inscrit_listes_electorales: true },
    expected: true,
    source: 'communaute',
    status: 'valide',
    validatedBy: 'Suite pytest du dépôt source (commit pinné)',
    engineVersion: 'regalgo-civique-droit-vote 1.0.4',
    legalAnchor: 'Code électoral, art. L. 2, L. 3, L. 5 à L. 7',
    tags: ['droit-de-vote', 'cas-nominal'],
    nativeFormat: 'pytest',
    nativeRef: 'https://github.com/qloridant/regalgo-civique-droit-vote/blob/13d9f80ca21d47f55aef9710e6288e94ea10ccc6/tests/test_algorithm.py',
  },
  {
    id: 'droit-vote-ue-municipales',
    ruleId: 'droits-civiques-elections',
    label: 'Citoyenne UE domiciliée en France, élections municipales',
    scenario: 'La citoyenneté UE combinée au domicile en France ouvre le droit de vote aux municipales (Constitution, art. 88-3).',
    inputs: { citoyennete_ue: true, domicile_france: true, age: 30, capacite_civique: true, inscrit_listes_electorales: true, type_election: 'municipale' },
    expected: true,
    source: 'communaute',
    status: 'en_revue',
    engineVersion: 'regalgo-civique-droit-vote 1.0.4',
    legalAnchor: 'Constitution, art. 88-3 ; Code électoral, art. L.O. 227-1',
    tags: ['droit-de-vote', 'citoyennete-ue', 'municipales'],
    nativeFormat: 'pytest',
    nativeRef: 'https://github.com/qloridant/regalgo-civique-droit-vote/blob/13d9f80ca21d47f55aef9710e6288e94ea10ccc6/tests/test_algorithm.py',
  },
  {
    id: 'prime-activite-celibataire-1000',
    ruleId: 'prime-activite-openfisca',
    label: 'Célibataire, 1 000 € net/mois',
    scenario: 'Prime d\'activité d\'un célibataire sans enfant, salaire de 1 000 € par mois sur le trimestre de référence.',
    inputs: { salaire_de_base: 1000 },
    expected: '224.39',
    expectedUnit: 'EUR',
    source: 'communaute',
    status: 'valide',
    validatedBy: 'API OpenFisca France (calcul réel)',
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
    label: 'Suite de tests native openfisca-france',
    scenario:
      'Les cas de tests vivent dans le format YAML d\'openfisca-france (variables périodisées, entités '
      + 'composées) : les transposer dans un format plat leur ferait perdre leur sens. Le catalogue référence '
      + 'la suite native et son statut d\'exécution.',
    source: 'communaute',
    status: 'valide',
    validatedBy: 'Intégration continue openfisca-france',
    engineVersion: 'france-169.15.0',
    tags: ['prime-activite', 'suite-native'],
    nativeFormat: 'openfisca-yaml',
    nativeRef: 'https://github.com/openfisca/openfisca-france/tree/master/tests',
  },
]
