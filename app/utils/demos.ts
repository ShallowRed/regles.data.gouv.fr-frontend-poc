/**
 * Registre des écrans de démo, source unique de vérité pour la navigation du POC.
 * Titres et hypothèses vivent dans les fichiers de traduction, sous `demos.<slug>`.
 *
 * `status` :
 * - `done`  : écran implémenté et démontrable
 * - `stub`  : route existe mais pose un placeholder « pas encore branché »
 * - `todo`  : pas de route, listé pour contexte uniquement
 */

export type DemoHorizon = 'mvp'
export type DemoStatus = 'done' | 'stub' | 'todo'

export interface Demo {
  slug: string
  shortTitle: string
  horizon: DemoHorizon
  publicCible: string
  /** Chemin de route, non préfixé par la locale. `null` si pas encore de route prévue. */
  route: string | null
  status: DemoStatus
}

export const demos: Demo[] = [
  // ── MVP ──────────────────────────────────────────────────────────────────
  {
    slug: 'mvp-landing',
    shortTitle: 'Accueil',
    horizon: 'mvp',
    publicCible: 'Tous publics',
    route: '/mvp',
    status: 'done',
  },
  {
    slug: 'catalogue-regles',
    shortTitle: 'Catalogue',
    horizon: 'mvp',
    publicCible: 'Tous publics',
    route: '/mvp/regles/',
    status: 'done',
  },
  {
    slug: 'fiche-regle',
    shortTitle: 'Fiche',
    horizon: 'mvp',
    publicCible: 'Cercle 2 et 3',
    route: '/mvp/regles/prestagri',
    status: 'done',
  },
  {
    slug: 'fiche-regle-tracabilite',
    shortTitle: 'Trace',
    horizon: 'mvp',
    publicCible: 'Cercle 2',
    route: '/mvp/regles/entreprise-innovation?tab=traceability',
    status: 'done',
  },
  {
    slug: 'fiche-regle-simulation',
    shortTitle: 'Calcul',
    horizon: 'mvp',
    publicCible: 'Cercle 1 et 3',
    route: '/mvp/regles/prestagri?tab=simulation',
    status: 'done',
  },
  {
    slug: 'fiche-regle-api',
    shortTitle: 'API',
    horizon: 'mvp',
    publicCible: 'Cercle 1 (AMI)',
    route: '/mvp/regles/prestagri?tab=api',
    status: 'done',
  },
  {
    slug: 'referencer-une-regle',
    shortTitle: 'Publier',
    horizon: 'mvp',
    publicCible: 'Administrations productrices',
    route: '/mvp/comprendre/referencer-une-regle',
    status: 'done',
  },
  {
    slug: 'verifier-une-regle',
    shortTitle: 'Vérifier',
    horizon: 'mvp',
    publicCible: 'Tous publics',
    route: '/mvp/comprendre/verifier-une-regle',
    status: 'done',
  },
  {
    slug: 'reutiliser-une-regle',
    shortTitle: 'Intégrer',
    horizon: 'mvp',
    publicCible: 'Cercle 1 (intégrateurs)',
    route: '/mvp/comprendre/reutiliser-une-regle',
    status: 'done',
  },
]

export function demosByHorizon(horizon: DemoHorizon) {
  return demos.filter(d => d.horizon === horizon)
}

export function demoBySlug(slug: string): Demo | undefined {
  return demos.find(d => d.slug === slug)
}
