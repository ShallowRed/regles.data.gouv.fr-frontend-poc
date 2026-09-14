/**
 * Cas de test attaché à une règle - l'ENVELOPPE de confiance.
 *
 * Doctrine (ontologie localisée) : le catalogue ne définit pas de format de situation
 * universel - décrire une situation exigerait les entités et périodes du moteur, donc son
 * ontologie. Chaque règle publie ses tests dans le format natif de son moteur, et le
 * catalogue norme l'ENVELOPPE du test (`rdgf:TestCase`, ADR-0006) : ce qu'il vérifie, origine,
 * validateur, statut, période législative et version du moteur.
 *
 * Format aligné sur `shared-test-cases` d'aides-simplifiées (branche `tests-personas` :
 * `shared-test-cases/schema.json`) : source de vérité unique, non-régression CI, snapshots
 * datés par période et version de moteur. C'est le versant « cas de test comme preuve » du
 * catalogue - pas un simulateur : on montre la preuve validée, on ne fait pas saisir un
 * usager pour lui rendre un droit.
 */

/** Valeur scalaire pouvant être passée en entrée d'une règle. */
export type RuleTestValue = string | number | boolean | null

/**
 * Donnée de cas de test, scalaire ou structurée. Les moteurs à entités composées
 * (structures Catala, entités OpenFisca) publient leurs cas dans leur forme native ;
 * seuls les cas entièrement scalaires sont rejouables contre une API plate.
 */
export type RuleTestData = RuleTestValue | RuleTestData[] | { [key: string]: RuleTestData }

/** Format natif du cas de test, dans l'espace de noms du moteur. */
export type RuleTestNativeFormat
  = | 'openfisca-yaml'
    | 'publicodes-yaml'
    | 'catala-assert'
    | 'pytest'
    | 'autre'

export interface RuleTest {
  id: string
  /** Identifiant de la règle parente */
  ruleId: string
  /** Libellé court du cas (par exemple « Lycéen 17 ans, premier achat ») */
  label: string
  /** Intention du test en langage naturel (l'hypothèse testée). */
  scenario: string
  /**
   * Entrées clés-valeurs à visée pédagogique (affichage). Optionnelles : la référence
   * qui fait foi est le test natif (`nativeRef`), pas cette projection. Les valeurs
   * peuvent être structurées (forme native du moteur) ; seuls les cas entièrement
   * scalaires sont rejouables automatiquement.
   */
  inputs?: Record<string, RuleTestData>
  /** Résultat attendu affiché (montant, booléen, statut, ou structure native). */
  expected?: RuleTestData
  /**
   * À false, le cas est exclu du rejeu automatique (entrées plus acceptées par l'API,
   * sémantique non exprimable...) ; le constat se documente dans `notes`.
   */
  replayable?: boolean
  /** Unité du résultat attendu si numérique (par exemple `EUR`, `mois`) */
  expectedUnit?: string
  /** Origine du cas (`rdgf:origin`). */
  origin: 'administration' | 'case-law' | 'circular' | 'anonymised-case' | 'community'
  /** Statut de validation du cas (`adms:status`). */
  status: 'valid' | 'pending' | 'failing'
  /** Qui a validé ce cas (`prov:wasAttributedTo`) : administration compétente, CI du dépôt source... */
  validatedBy?: string
  /** Date de validation (`dct:date`, ISO 8601). */
  validatedAt?: string
  /** Ancre légale visée par le cas (version du texte). */
  legalAnchor?: string
  /** Tolérance d'écart acceptée sur le résultat, si numérique. */
  tolerance?: string
  /** Format natif du test (`dct:format`). */
  nativeFormat?: RuleTestNativeFormat
  /** Test natif de référence (`dct:source`), au commit désigné. */
  nativeRef?: string
  /**
   * Variable cible du rejeu automatique, dans l'espace de noms du moteur
   * (ex. `cir . montant` pour Publicodes). Comme `inputs`, elle reste
   * moteur-namespacée : le catalogue ne norme pas les noms de variables.
   */
  targetVariable?: string
  /** Période législative visée (YYYY-MM) : l'état du droit à une date donnée. */
  period?: string
  /** Version du moteur ayant produit le résultat attendu (ex. `france-169.15.0`, `prestagri 0.1.0`). */
  engineVersion?: string
  /** Référence du dossier réel anonymisé, si le cas en dérive (provenance forte). */
  realCaseSource?: string
  /** Tags de catégorisation du cas. */
  tags?: string[]
  /** Note ou contexte additionnel. */
  notes?: string
}
