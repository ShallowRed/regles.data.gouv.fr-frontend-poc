/**
 * Registre des écrans de démo, source unique de vérité pour la navigation du POC.
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
  title: string
  publicCible: string
  hypothesis: string
  /** Chemin de route. `null` si pas encore de route prévue. */
  route: string | null
  status: DemoStatus
}

export const demos: Demo[] = [
  // ── MVP ──────────────────────────────────────────────────────────────────
  {
    slug: 'mvp-landing',
    shortTitle: 'Accueil',
    horizon: 'mvp',
    title: 'Landing institutionnelle du catalogue',
    publicCible: 'Tous publics',
    hypothesis: 'Le service se comprend en moins de 30 secondes',
    route: '/mvp',
    status: 'done',
  },
  {
    slug: 'catalogue-regles',
    shortTitle: 'Catalogue',
    horizon: 'mvp',
    title: 'Recherche et listing du catalogue',
    publicCible: 'Tous publics',
    hypothesis: 'La page d\'accueil du catalogue se lit comme une page d\'accueil data.gouv.fr',
    route: '/mvp/regles/',
    status: 'done',
  },
  {
    slug: 'fiche-regle',
    shortTitle: 'Fiche',
    horizon: 'mvp',
    title: 'Fiche règle canonique',
    publicCible: 'Cercle 2 et 3',
    hypothesis: 'Une meme fiche couvre description, API, traceabilite et tests selon la regle',
    route: '/mvp/regles/rsa-eligibilite',
    status: 'done',
  },
  {
    slug: 'fiche-regle-tracabilite',
    shortTitle: 'Trace',
    horizon: 'mvp',
    title: 'Fiche règle - onglet tracabilite',
    publicCible: 'Cercle 2',
    hypothesis: 'La traçabilité texte légal vers code est immédiatement compréhensible',
    route: '/mvp/regles/pass-culture-eligibilite?tab=traceability',
    status: 'done',
  },
  {
    slug: 'fiche-regle-simulation',
    shortTitle: 'Calcul',
    horizon: 'mvp',
    title: 'Fiche règle - onglet simulation',
    publicCible: 'Cercle 1 et 3',
    hypothesis: 'Le bandeau d\'opposabilité distingue clairement aperçu indicatif et résultat opposable',
    route: '/mvp/regles/pass-culture-credit?tab=simulation',
    status: 'done',
  },
  {
    slug: 'fiche-regle-api',
    shortTitle: 'API',
    horizon: 'mvp',
    title: 'Fiche règle - onglet API',
    publicCible: 'Cercle 1 (AMI)',
    hypothesis: 'L\'integration API est lisible sans sortir de la fiche',
    route: '/mvp/regles/rsa-eligibilite?tab=api',
    status: 'done',
  },
  {
    slug: 'referencer-une-regle',
    shortTitle: 'Publier',
    horizon: 'mvp',
    title: 'Comprendre - « Référencer ses règles »',
    publicCible: 'Administrations productrices',
    hypothesis: 'Une administration comprend ce que référencer implique et qu\'elle garde la maîtrise',
    route: '/mvp/comprendre/referencer-une-regle',
    status: 'done',
  },
  {
    slug: 'verifier-une-regle',
    shortTitle: 'Vérifier',
    horizon: 'mvp',
    title: 'Comprendre - « Vérifier une règle »',
    publicCible: 'Tous publics',
    hypothesis: 'La chaîne texte légal vers code vers résultat se comprend hors d\'une fiche',
    route: '/mvp/comprendre/verifier-une-regle',
    status: 'done',
  },
  {
    slug: 'reutiliser-une-regle',
    shortTitle: 'Intégrer',
    horizon: 'mvp',
    title: 'Comprendre - « Réutiliser une règle »',
    publicCible: 'Cercle 1 (intégrateurs)',
    hypothesis: 'Les modes d\'intégration et un appel d\'API type se comprennent sans documentation externe',
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
