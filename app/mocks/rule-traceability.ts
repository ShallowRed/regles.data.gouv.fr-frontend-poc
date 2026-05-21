import type { RuleEngine } from '~/types/rule'

/**
 * Correspondances texte légal ↔ code, par règle.
 *
 * Matérialise l'« objet-frontière » de la restitution : un extrait de texte
 * réglementaire mis en regard du fragment de code qui l'implémente. Aucune
 * analyse n'est faite ici, ce sont des appariements documentés (mockés).
 *
 * Seules les règles à moteur ouvert et traçabilité publiée en exposent.
 */
export interface TraceabilityMapping {
  /** Identifiant de la référence légale (clé de legalReferencesMock). */
  referenceId: string
  /** Désignation interne du fragment de texte (ex : « Art. 2, I »). */
  legalAnchor?: string
  /** Extrait du texte légal. */
  legalExcerpt: string
  /** Moteur du snippet. */
  engine: RuleEngine
  /** Chemin / variable dans le code. */
  codeAnchor?: string
  /** Fragment de code implémentant cet extrait. */
  codeSnippet: string
}

export const ruleTraceabilityMock: Record<string, TraceabilityMapping[]> = {
  'pass-culture-eligibilite': [
    {
      referenceId: 'decret-2021-628',
      legalAnchor: 'Art. 2',
      legalExcerpt:
        'Le pass Culture est ouvert aux personnes âgées de quinze à dix-huit ans résidant en France depuis au moins un an.',
      engine: 'publicodes',
      codeAnchor: 'pass culture . éligible',
      codeSnippet: `pass culture . éligible:
  toutes ces conditions:
    - âge >= 15 ans
    - âge <= 18 ans
    - résidence éligible`,
    },
    {
      referenceId: 'decret-2021-628',
      legalAnchor: 'Art. 2, II',
      legalExcerpt:
        'La condition de résidence est réputée remplie pour les personnes résidant dans un département d\'outre-mer.',
      engine: 'publicodes',
      codeAnchor: 'pass culture . résidence éligible',
      codeSnippet: `résidence éligible:
  une de ces conditions:
    - résidence = "métropole"
    - résidence . outre-mer`,
    },
  ],
  'rsa-eligibilite': [
    {
      referenceId: 'code-action-sociale-L262-2',
      legalAnchor: 'Art. L. 262-2',
      legalExcerpt:
        'Toute personne résidant en France de manière stable et effective a droit au revenu de solidarité active, dans les conditions définies au présent chapitre, dès lors que ses ressources n\'atteignent pas le montant forfaitaire mentionné au 2° de l\'article L. 262-3.',
      engine: 'openfisca',
      codeAnchor: 'rsa.eligibilite',
      codeSnippet: `class rsa_eligibilite(Variable):
    value_type = bool
    entity = Famille
    def formula(famille, period):
        residence = famille('residence_stable', period)
        ressources = famille('rsa_base_ressources', period)
        forfait = parameters(period).prestations.rsa.montant_de_base
        return residence * (ressources < forfait)`,
    },
  ],
  'allocation-chomage-are': [
    {
      referenceId: 'convention-unedic-2024',
      legalAnchor: 'Art. 14',
      legalExcerpt:
        'L\'allocation journalière est égale au montant le plus élevé entre une partie fixe et 40,4 % du salaire journalier de référence, sans pouvoir être inférieure à 57 % du salaire journalier de référence.',
      engine: 'publicodes',
      codeAnchor: 'ARE . allocation journalière',
      codeSnippet: `allocation journalière:
  le maximum de:
    - partie fixe + 40.4% * salaire journalier de référence
    - 57% * salaire journalier de référence`,
    },
  ],
  'apl-eligibilite': [
    {
      referenceId: 'ccffh-L823-1',
      legalAnchor: 'Art. L. 823-1',
      legalExcerpt:
        'Le montant de l\'aide est calculé en fonction d\'un loyer plafond déterminé selon la zone géographique et la composition du foyer, diminué d\'une participation personnelle du bénéficiaire.',
      engine: 'openfisca',
      codeAnchor: 'aide_logement.montant',
      codeSnippet: `class aide_logement(Variable):
    value_type = float
    entity = Famille
    def formula(famille, period, parameters):
        loyer_plafond = famille('loyer_plafonne', period)
        participation = famille('participation_personnelle', period)
        return max_(loyer_plafond - participation, 0)`,
    },
  ],
}
