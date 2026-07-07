<script setup lang="ts">
useHead({ title: 'Réutiliser les règles | Catalogue des règles publiques' })

const { withBaseURL } = useBaseUrl()

const audiences = [
  {
    pictogram: withBaseURL('pictograms/city-hall.svg'),
    title: 'Portails et services publics',
    body: 'Branchez un calcul d\'éligibilité ou de montant directement dans votre démarche en ligne, pour informer l\'usager au bon moment.',
    examples: ['Application Mobile Interministérielle', 'Service-Public.fr', 'portails de collectivités'],
  },
  {
    pictogram: withBaseURL('pictograms/contract.svg'),
    title: 'Aidants et travailleurs sociaux',
    body: 'Appuyez-vous sur des règles à jour et explicables pour accompagner une personne et comprendre pourquoi un droit est ouvert ou refusé.',
    examples: ['France Services', 'CCAS', 'associations'],
  },
  {
    pictogram: withBaseURL('pictograms/coding.svg'),
    title: 'Éditeurs, chercheurs, journalistes',
    body: 'Consommez les règles officielles plutôt que de les réinterpréter, ou auditez les politiques publiques à partir du code en vigueur.',
    examples: ['logiciels de paie', 'simulateurs tiers', 'travaux d\'évaluation'],
  },
]

const modes = [
  {
    icon: 'fr-icon-terminal-box-line',
    title: 'API de calcul',
    body: 'Pour les règles exécutables, une API documentée renvoie un résultat à partir d\'une situation décrite. Contrats d\'entrée et de sortie stables.',
    availability: 'Disponible dès qu\'une règle expose un moteur de calcul (OpenFisca, Publicodes, Catala ou moteur propriétaire ouvert).',
  },
  {
    icon: 'fr-icon-window-line',
    title: 'Widget intégrable',
    body: 'Un module de simulation prêt à embarquer (iframe ou web component) à poser sur un site, sans développement lourd.',
    availability: 'Réservé aux moteurs légers exécutables côté navigateur (Publicodes, Catala).',
  },
  {
    icon: 'fr-icon-download-line',
    title: 'Paquet exécutable',
    body: 'Pour les moteurs légers, la règle peut s\'exécuter côté client - adaptée aux usages mobiles et respectueux de la vie privée.',
    availability: 'Distribué sous forme de paquet npm / package pour les règles dont la modélisation est publiée.',
  },
]
</script>

<template>
  <div>
    <!-- ============ EN-TÊTE + CHIFFRES CLÉS ============ -->
    <BrandBackgroundContainer
      variant="soft"
      class="full-bleed border-b border-[#e3e3fd]"
    >
      <div class="fr-container pt-1 pb-8 space-y-8">
        <div class="space-y-4">
          <Breadcrumbs
            :items="[
              { to: '/mvp', label: 'Accueil' },
              { to: null, label: 'Réutiliser les règles' },
            ]"
          />
          <header class="space-y-3 max-w-3xl">
            <h1 class="fr-h2 m-0">
              Une règle modélisée une fois, réutilisée partout
            </h1>
            <p class="fr-text--lead text-gray-700 m-0">
              Plutôt que de recoder dans chaque service les mêmes règles d'éligibilité ou
              de calcul, le catalogue les expose comme des briques communes, prêtes à être
              intégrées et toujours à jour avec le droit en vigueur.
            </p>
          </header>
        </div>
      </div>
    </BrandBackgroundContainer>

    <!-- ============ POUR QUI (fond blanc) ============ -->
    <section
      aria-labelledby="audiences"
      class="fr-container py-12 md:py-16 space-y-8"
    >
      <div class="max-w-3xl space-y-2">
        <h2
          id="audiences"
          class="fr-h3 m-0"
        >
          À qui ça sert
        </h2>
        <p class="fr-text--lg text-gray-700 m-0">
          Réutiliser une règle officielle, c'est gagner en fiabilité et en conformité,
          sans réécrire ni maintenir le calcul de son côté.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="a in audiences"
          :key="a.title"
          class="rounded-lg border border-gray-200 bg-white p-6 space-y-3"
        >
          <img
            :src="a.pictogram"
            alt=""
            width="64"
            height="64"
          >
          <h3 class="fr-h6 m-0">
            {{ a.title }}
          </h3>
          <p class="fr-text--sm text-gray-700 m-0">
            {{ a.body }}
          </p>
          <ul class="flex flex-wrap gap-1.5 list-none p-0 m-0 pt-1">
            <li
              v-for="ex in a.examples"
              :key="ex"
              class="fr-tag fr-tag--sm"
            >
              {{ ex }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ============ MODES + EXEMPLE D'APPEL (bande rythmée) ============ -->
    <BrandBackgroundContainer
      variant="subtle"
      class="full-bleed border-y border-[#e3e3fd]"
    >
      <div class="fr-container py-12 md:py-16 space-y-12 md:space-y-16">
        <!-- Modes d'intégration -->
        <section
          aria-labelledby="modes"
          class="space-y-8"
        >
          <div class="max-w-3xl space-y-2">
            <h2
              id="modes"
              class="fr-h3 m-0"
            >
              Trois façons d'intégrer une règle
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              Le mode d'intégration dépend du moteur de la règle et de son niveau de publication.
              Chaque fiche indique précisément lesquels sont disponibles.
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              v-for="m in modes"
              :key="m.title"
              class="flex flex-col rounded-lg border border-gray-200 bg-white p-6 space-y-3"
            >
              <span
                :class="m.icon"
                class="fr-icon--lg text-[#000091]"
                aria-hidden="true"
              />
              <h3 class="fr-h6 m-0">
                {{ m.title }}
              </h3>
              <p class="fr-text--sm text-gray-700 m-0">
                {{ m.body }}
              </p>
              <p class="fr-text--xs text-gray-600 m-0 pt-2 mt-auto border-t border-gray-100 flex items-start gap-1.5">
                <span
                  class="fr-icon-information-line fr-icon--xs text-[#000091] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{{ m.availability }}</span>
              </p>
            </div>
          </div>
          <p class="fr-text--sm text-gray-600 max-w-2xl m-0">
            Toutes les règles ne sont pas exécutables&nbsp;: certaines restent opérées en interne
            par l'administration productrice et ne sont pas réutilisables hors de ses systèmes.
          </p>
        </section>
      </div>
    </BrandBackgroundContainer>

    <!-- ============ APPEL À EXPLORER ============ -->
    <BrandBackgroundContainer
      variant="contrast"
      class="full-bleed"
    >
      <div class="fr-container py-12 md:py-14">
        <div class="max-w-2xl space-y-3">
          <h2 class="fr-h4 m-0 text-white">
            Voir une API de règle
          </h2>
          <p class="fr-text--sm text-white/90 m-0">
            Ouvrez une fiche de règle exécutable et consultez l'onglet « API » : endpoint,
            format d'entrée et exemple de réponse y sont documentés.
          </p>
          <div class="flex flex-wrap gap-3 pt-2">
            <NuxtLink
              to="/mvp/regles/prestagri?tab=api"
              class="fr-btn btn-on-dark--solid"
            >
              Exemple : l'API Prest'Agri
            </NuxtLink>
            <NuxtLink
              to="/mvp/regles/"
              class="fr-btn fr-btn--secondary btn-on-dark--ghost"
            >
              Parcourir le catalogue
            </NuxtLink>
          </div>
        </div>
      </div>
    </BrandBackgroundContainer>
  </div>
</template>
