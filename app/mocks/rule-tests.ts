import type { RuleTest } from '~/types'

/**
 * Cas de tests publics publies par certaines administrations.
 * Leur absence sur une regle ne signifie pas absence de validation interne.
 */
export const ruleTestsMock: RuleTest[] = [
  // Règle éligibilité (N3) - 5 cas
  {
    id: 'test-eligibilite-1',
    ruleId: 'pass-culture-eligibilite',
    label: 'Jeune 17 ans, résident métropole',
    scenario: 'Lycéenne de 17 ans résidant en métropole, première activation.',
    inputs: { age: 17, residence: 'metropole', date_demande: '2026-04-01' },
    expected: true,
    source: 'administration',
    status: 'valide',
  },
  {
    id: 'test-eligibilite-2',
    ruleId: 'pass-culture-eligibilite',
    label: 'Jeune 14 ans (sous le seuil)',
    scenario: 'Adolescent de 14 ans, hors plage d\'éligibilité.',
    inputs: { age: 14, residence: 'metropole', date_demande: '2026-04-01' },
    expected: false,
    source: 'administration',
    status: 'valide',
  },
  {
    id: 'test-eligibilite-3',
    ruleId: 'pass-culture-eligibilite',
    label: 'Jeune 19 ans (au-dessus du seuil)',
    scenario: 'Jeune adulte de 19 ans, hors plage.',
    inputs: { age: 19, residence: 'metropole', date_demande: '2026-04-01' },
    expected: false,
    source: 'administration',
    status: 'valide',
  },
  {
    id: 'test-eligibilite-4',
    ruleId: 'pass-culture-eligibilite',
    label: 'Jeune 18 ans, résident Mayotte',
    scenario: 'Cas limite documenté par un aidant : 18 ans le jour de la demande, outre-mer.',
    inputs: { age: 18, residence: 'mayotte', date_demande: '2026-04-01' },
    expected: true,
    source: 'communaute',
    status: 'en_revue',
  },
  {
    id: 'test-eligibilite-5',
    ruleId: 'pass-culture-eligibilite',
    label: 'Jeune 17 ans, résident étranger',
    scenario: 'Résidence hors France, le jeune ne doit pas être éligible.',
    inputs: { age: 17, residence: 'etranger', date_demande: '2026-04-01' },
    expected: false,
    source: 'administration',
    status: 'valide',
  },
  // Règle crédit (N2) - 4 cas
  {
    id: 'test-credit-1',
    ruleId: 'pass-culture-credit',
    label: 'Activation à 15 ans',
    scenario: 'Premier crédit pour un bénéficiaire activant à 15 ans.',
    inputs: { age_activation: 15 },
    expected: 20,
    expectedUnit: 'EUR',
    source: 'administration',
    status: 'valide',
  },
  {
    id: 'test-credit-2',
    ruleId: 'pass-culture-credit',
    label: 'Activation à 16 ans',
    scenario: 'Palier intermédiaire à 16 ans.',
    inputs: { age_activation: 16 },
    expected: 30,
    expectedUnit: 'EUR',
    source: 'administration',
    status: 'valide',
  },
  {
    id: 'test-credit-3',
    ruleId: 'pass-culture-credit',
    label: 'Activation à 18 ans (montant majeur)',
    scenario: 'Activation au jour des 18 ans, crédit complet.',
    inputs: { age_activation: 18 },
    expected: 300,
    expectedUnit: 'EUR',
    source: 'administration',
    status: 'valide',
  },
  {
    id: 'test-credit-4',
    ruleId: 'pass-culture-credit',
    label: 'Activation tardive 17 ans 11 mois',
    scenario: 'Cas borderline signalé par un éducateur PJJ.',
    inputs: { age_activation: 17.92 },
    expected: 30,
    expectedUnit: 'EUR',
    source: 'communaute',
    status: 'echec',
  },
  // Règle bonification zonale (N1) - 2 cas
  {
    id: 'test-are-1',
    ruleId: 'allocation-chomage-are',
    label: 'ARE - ouverture de droits standard',
    scenario: 'Demandeur avec 24 mois d\'affiliation et salaire de reference stable.',
    inputs: { mois_affiliation: 24, sjr: 64.5 },
    expected: 40.2,
    expectedUnit: 'EUR',
    source: 'administration',
    status: 'valide',
  },
  {
    id: 'test-are-2',
    ruleId: 'allocation-chomage-are',
    label: 'ARE - plafond conventionnel',
    scenario: 'Controle du plafond journalier selon convention Unedic 2024.',
    inputs: { mois_affiliation: 36, sjr: 220 },
    expected: 165,
    expectedUnit: 'EUR',
    source: 'communaute',
    status: 'en_revue',
  },
  {
    id: 'test-bonification-1',
    ruleId: 'pass-culture-bonification-zone',
    label: 'Résident QPV (Aubervilliers)',
    scenario: 'Bénéficiaire résidant en quartier prioritaire de la politique de la ville.',
    inputs: { code_postal: '93300', zonage: 'QPV' },
    expected: 50,
    expectedUnit: 'EUR',
    source: 'administration',
    status: 'en_revue',
  },
  {
    id: 'test-bonification-2',
    ruleId: 'pass-culture-bonification-zone',
    label: 'Résident outre-mer (La Réunion)',
    scenario: 'Cas outre-mer documenté en atelier communautaire.',
    inputs: { code_postal: '97400', zonage: 'outre-mer' },
    expected: 80,
    expectedUnit: 'EUR',
    source: 'communaute',
    status: 'en_revue',
  },
]

export const ruleTestsByRule = ruleTestsMock.reduce<Record<string, RuleTest[]>>(
  (acc, test) => {
    if (!acc[test.ruleId]) {
      acc[test.ruleId] = []
    }
    acc[test.ruleId]!.push(test)
    return acc
  },
  {},
)
