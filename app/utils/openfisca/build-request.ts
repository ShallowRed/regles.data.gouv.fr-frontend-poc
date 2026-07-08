/**
 * Constructeur de requête OpenFisca minimal (situation -> 4 entités périodisées).
 *
 * Fondé sur le modèle de situation public d'OpenFisca
 * (https://openfisca.org/doc/openfisca-web-api/input-output-data.html) : une requête
 * assemble les entités individu / famille / foyer_fiscal / menage, chaque variable portant
 * ses valeurs par période, et une variable ciblée à `null` pour demander son calcul.
 *
 * Version volontairement réduite au besoin du POC (la fiche parle déjà en variables
 * OpenFisca, donc pas de couche form -> variable). Le request-builder complet d'aides-simplifiées
 * (`inertia/services/openfisca/request-builder` : managers d'entités, étalement de période,
 * dispatchers form -> variable) est le candidat idéal à extraire en package autonome avant la
 * mise en sommeil de l'app - et c'est précisément l'artefact que la fiche prime-activité
 * référence dans son `rdgf:operationalMapping`. Voir la note d'extraction dans le garden.
 *
 * Le socle commun de métadonnées ne porte ni entités ni périodes : ce fichier vit dans le
 * bloc moteur (l'ontologie localisée d'OpenFisca), piloté par le `rdgf:engineProfile` de la
 * fiche. C'est le régime implémentation rendu exécutable.
 */

export type OpenFiscaValue = boolean | number | string
export interface PeriodValues { [period: string]: OpenFiscaValue | null }
export interface OpenFiscaRequest {
  individus: Record<string, Record<string, PeriodValues>>
  familles: Record<string, { parents: string[], enfants: string[], [v: string]: PeriodValues | string[] }>
  foyers_fiscaux: Record<string, { declarants: string[], personnes_a_charge: string[], [v: string]: PeriodValues | string[] }>
  menages: Record<string, { personne_de_reference: string[], conjoint: string[], enfants: string[], [v: string]: PeriodValues | string[] }>
}

const INDIVIDU = 'demandeur'

/** Les trois mois du trimestre de référence se terminant au mois cible (inclus). */
export function referenceQuarter(targetMonth: string): string[] {
  const [year, month] = targetMonth.split('-').map(Number)
  return [2, 1, 0].map((back) => {
    const d = new Date(Date.UTC(year, month - 1 - back, 1))
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
  })
}

/**
 * Requête de prime d'activité pour un demandeur seul : le salaire mensuel est étalé sur le
 * trimestre de référence (les ressources prises en compte pour la PPA), et `ppa` est demandée
 * sur le mois cible. Reproduit la situation validée contre l'API publique OpenFisca France.
 */
export function buildPrimeActiviteRequest(salaireMensuel: number, targetMonth: string): OpenFiscaRequest {
  const salaireParMois: PeriodValues = {}
  for (const month of referenceQuarter(targetMonth))
    salaireParMois[month] = salaireMensuel

  return {
    individus: {
      [INDIVIDU]: { salaire_de_base: salaireParMois },
    },
    familles: {
      famille_1: { parents: [INDIVIDU], enfants: [], ppa: { [targetMonth]: null } },
    },
    foyers_fiscaux: {
      foyer_1: { declarants: [INDIVIDU], personnes_a_charge: [] },
    },
    menages: {
      menage_1: { personne_de_reference: [INDIVIDU], conjoint: [], enfants: [] },
    },
  }
}
