import type { RuleVersion } from '~/types'

/**
 * Historique des versions des règles.
 * Chaque entrée relie, quand c'est pertinent, le changement à la référence
 * réglementaire qui l'a déclenché (`triggeredBy`), pour matérialiser
 * « l'état du droit applicable à une date donnée ».
 */
export const ruleVersionsMock: RuleVersion[] = [
  // --- Pass Culture éligibilité ---
  {
    id: 'pass-culture-eligibilite-v2-4-0',
    ruleId: 'pass-culture-eligibilite',
    version: '2.4.0',
    publishedAt: '2026-04-12',
    changelog:
      'Élargissement de l\'éligibilité aux résidents de Mayotte (intégration de l\'arrêté de février).',
    kind: 'mineur',
    author: 'Pass Culture',
    triggeredBy: 'arrete-2022-pass-bonifie',
  },
  {
    id: 'pass-culture-eligibilite-v2-3-0',
    ruleId: 'pass-culture-eligibilite',
    version: '2.3.0',
    publishedAt: '2025-11-08',
    changelog: 'Refonte du formalisme Publicodes pour intégrer un cas dérogatoire QPV.',
    kind: 'mineur',
    author: 'Pass Culture',
  },
  {
    id: 'pass-culture-eligibilite-v2-0-0',
    ruleId: 'pass-culture-eligibilite',
    version: '2.0.0',
    publishedAt: '2021-05-21',
    changelog: 'Première modélisation publiée des conditions d\'éligibilité au pass Culture.',
    kind: 'majeur',
    author: 'Pass Culture',
    triggeredBy: 'decret-2021-628',
  },
  // --- Pass Culture crédit ---
  {
    id: 'pass-culture-credit-v1-6-0',
    ruleId: 'pass-culture-credit',
    version: '1.6.0',
    publishedAt: '2026-03-04',
    changelog: 'Ajout du palier 16 ans suite à la révision du décret de mai 2021.',
    kind: 'mineur',
    author: 'Pass Culture',
    triggeredBy: 'decret-2021-628',
  },
  // --- RSA éligibilité ---
  {
    id: 'rsa-eligibilite-v4-1-0',
    ruleId: 'rsa-eligibilite',
    version: '4.1.0',
    publishedAt: '2026-05-02',
    changelog: 'Revalorisation du montant forfaitaire au 1er avril 2026.',
    kind: 'mineur',
    author: 'CNAF',
    triggeredBy: 'code-action-sociale-L262-2',
  },
  {
    id: 'rsa-eligibilite-v4-0-0',
    ruleId: 'rsa-eligibilite',
    version: '4.0.0',
    publishedAt: '2025-01-15',
    changelog: 'Réforme du calcul de la base ressources sur les trois derniers mois.',
    kind: 'majeur',
    author: 'CNAF',
    triggeredBy: 'code-action-sociale-L262-2',
  },
  {
    id: 'rsa-eligibilite-v3-2-1',
    ruleId: 'rsa-eligibilite',
    version: '3.2.1',
    publishedAt: '2024-07-03',
    changelog: 'Correction d\'un arrondi sur la prise en compte des revenus d\'activité.',
    kind: 'correctif',
    author: 'CNAF',
  },
  // --- Impôt sur le revenu ---
  {
    id: 'impot-revenu-bareme-v2026-1-0',
    ruleId: 'impot-revenu-bareme',
    version: '2026.1.0',
    publishedAt: '2026-01-10',
    changelog: 'Mise à jour du barème et des tranches pour les revenus 2025 (loi de finances 2026).',
    kind: 'majeur',
    author: 'DGFiP',
    triggeredBy: 'cgi-art-197',
  },
  {
    id: 'impot-revenu-bareme-v2025-1-0',
    ruleId: 'impot-revenu-bareme',
    version: '2025.1.0',
    publishedAt: '2025-01-12',
    changelog: 'Barème applicable aux revenus 2024.',
    kind: 'majeur',
    author: 'DGFiP',
    triggeredBy: 'cgi-art-197',
  },
  // --- Allocation chômage ARE ---
  {
    id: 'allocation-chomage-are-v1-2-0',
    ruleId: 'allocation-chomage-are',
    version: '1.2.0',
    publishedAt: '2026-03-22',
    changelog: 'Alignement sur la convention d\'assurance chômage du 15 novembre 2024.',
    kind: 'majeur',
    author: 'France Travail',
    triggeredBy: 'convention-unedic-2024',
  },
  {
    id: 'allocation-chomage-are-v1-1-0',
    ruleId: 'allocation-chomage-are',
    version: '1.1.0',
    publishedAt: '2025-09-01',
    changelog: 'Ajout des cas de test communautaires sur le plafonnement journalier.',
    kind: 'editorial',
    author: 'France Travail',
  },
  // --- APL ---
  {
    id: 'apl-eligibilite-v3-5-0',
    ruleId: 'apl-eligibilite',
    version: '3.5.0',
    publishedAt: '2026-05-18',
    changelog: 'Mise à jour des loyers plafonds par zone géographique.',
    kind: 'mineur',
    author: 'CNAF',
    triggeredBy: 'ccffh-L823-1',
  },
  {
    id: 'apl-eligibilite-v3-4-0',
    ruleId: 'apl-eligibilite',
    version: '3.4.0',
    publishedAt: '2025-10-01',
    changelog: 'Révision du calcul de la participation personnelle.',
    kind: 'mineur',
    author: 'CNAF',
    triggeredBy: 'ccffh-L823-1',
  },
]
