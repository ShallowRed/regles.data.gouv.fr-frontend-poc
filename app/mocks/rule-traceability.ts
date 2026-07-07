import type { RuleEngine } from '~/types/rule'

/**
 * Correspondances texte légal ↔ code, par règle.
 *
 * Matérialise l'« objet-frontière » de la restitution : un extrait de texte
 * réglementaire mis en regard du fragment de code qui l'implémente.
 *
 * Démo resserrée : les snippets sont extraits des dépôts publics réels
 * (betagouv/publicodes-entreprise-innovation, src/dispositifs/cir.publicodes).
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
  'entreprise-innovation': [
    {
      referenceId: 'cgi-244-quater-b',
      legalAnchor: 'Art. 244 quater B, I',
      legalExcerpt:
        'Les entreprises industrielles et commerciales ou agricoles imposées d\'après leur bénéfice réel ou exonérées '
        + 'en application [de certains régimes] peuvent bénéficier d\'un crédit d\'impôt au titre des dépenses de recherche '
        + 'qu\'elles exposent au cours de l\'année.',
      engine: 'publicodes',
      codeAnchor: 'cir . eligibilite',
      codeSnippet: `cir . eligibilite:
  titre: Éligibilité au Crédit d'Impôt Recherche
  variations:
    - si: natureActivite . commercialeIndustrielleAgricole
      alors: regimeFiscalReelOuConditionDExoneration
    - si: natureActivite . artisanale
      alors:
        toutes ces conditions:
          - regimeFiscalEstReel
          - typeDeRevenus = 'bic'
    - sinon: non`,
    },
    {
      referenceId: 'cgi-244-quater-b',
      legalAnchor: 'Art. 244 quater B, I (taux)',
      legalExcerpt:
        'Le taux du crédit d\'impôt est de 30 % pour la fraction des dépenses de recherche inférieure ou égale à '
        + '100 millions d\'euros et de 5 % pour la fraction des dépenses de recherche supérieure à ce montant. '
        + 'Le premier de ces deux taux est porté à 50 % pour les dépenses de recherche exposées dans des exploitations '
        + 'situées dans un département d\'outre-mer.',
      engine: 'publicodes',
      codeAnchor: 'cir . creditMetropole / cir . creditDom',
      codeSnippet: `cir . creditMetropole:
  barème:
    assiette: cir . depensesMetropole
    tranches:
      - taux: 30%
        plafond: 100000000
      - taux: 5%

cir . creditDom:
  barème:
    assiette: cir . depensesDom
    tranches:
      - taux: 50%`,
    },
  ],
}
