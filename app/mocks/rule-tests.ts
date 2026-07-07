import type { RuleTest } from '~/types'

/**
 * Cas de tests de la démo resserrée.
 *
 * Doctrine : le test natif (dans le format du moteur, lié par `nativeRef`) fait foi ;
 * le catalogue norme l'enveloppe (intention, provenance, validateur, statut). Les
 * `inputs`/`expected` plats sont une projection pédagogique, pas le test lui-même.
 *
 * Les deux cas Prest'Agri sont des appels réels à l'API de production
 * (api.prest-agri.beta.gouv.fr), exécutés le 2026-07-07.
 */
export const ruleTestsMock: RuleTest[] = [
  {
    id: 'prestagri-qf-couple-2-enfants',
    ruleId: 'prestagri',
    label: 'Agent seul, 30 000 € de revenu, 2 enfants',
    scenario: 'Quotient familial d\'un agent au revenu fiscal de référence de 30 000 € avec 2 enfants à charge.',
    inputs: { agent_revenu: 30000, agent_enfants: 2 },
    expected: '833.33',
    expectedUnit: 'EUR',
    source: 'administration',
    status: 'valide',
    validatedBy: 'API Prest\'Agri (calcul réel)',
    validatedAt: '2026-07-07',
    nativeFormat: 'catala-assert',
    nativeRef: 'https://github.com/betagouv/prestagri/tree/478b3cc2ab28299c73b94fdd192b0559ae5873b8/catala',
  },
  {
    id: 'prestagri-qf-parent-isole',
    ruleId: 'prestagri',
    label: 'Même situation, parent isolé',
    scenario: 'La majoration parent isolé ajoute une unité au foyer : le quotient familial baisse de 833,33 € à 625 €.',
    inputs: { agent_revenu: 30000, agent_enfants: 2, parent_isole: true },
    expected: '625.0',
    expectedUnit: 'EUR',
    source: 'administration',
    status: 'valide',
    validatedBy: 'API Prest\'Agri (calcul réel)',
    validatedAt: '2026-07-07',
    nativeFormat: 'catala-assert',
    nativeRef: 'https://github.com/betagouv/prestagri/tree/478b3cc2ab28299c73b94fdd192b0559ae5873b8/catala',
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
    legalAnchor: 'Code électoral, art. L. 2, L. 3, L. 5 à L. 7',
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
    legalAnchor: 'Constitution, art. 88-3 ; Code électoral, art. L.O. 227-1',
    nativeFormat: 'pytest',
    nativeRef: 'https://github.com/qloridant/regalgo-civique-droit-vote/blob/13d9f80ca21d47f55aef9710e6288e94ea10ccc6/tests/test_algorithm.py',
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
    nativeFormat: 'openfisca-yaml',
    nativeRef: 'https://github.com/openfisca/openfisca-france/tree/master/tests',
  },
]
