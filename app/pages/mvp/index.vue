<script setup lang="ts">
useHead({ title: 'Catalogue des règles publiques' })

/* --- Recherche du hero, renvoie vers le catalogue --- */
const searchQuery = ref('')
function submitSearch() {
  const q = searchQuery.value.trim()
  navigateTo({ path: '/mvp/regles/', query: q ? { q } : {} })
}

/* --- Thématiques de parcours rapide (les requêtes matchent les mocks) --- */
const themes = [
  { label: 'Solidarité', q: 'solidarité' },
  { label: 'Fiscalité', q: 'impôt' },
  { label: 'Emploi', q: 'chômage' },
  { label: 'Retraite', q: 'retraite' },
  { label: 'Famille', q: 'famille' },
  { label: 'Culture', q: 'culture' },
  { label: 'Jeunesse', q: 'jeune' },
]

/* --- Chiffres clés dérivés des données du catalogue --- */
const stats = computed(() => {
  const domains = new Set(rulesMock.map(r => r.domain))
  const executable = rulesMock.filter(r => r.maturity === 'N3').length
  return [
    {
      value: rulesMock.length,
      label: 'règles référencées',
      caption: 'aides, prestations et impôts modélisés',
      icon: 'fr-icon-file-text-line',
    },
    {
      value: Object.keys(organismsMock).length,
      label: 'administrations productrices',
      caption: 'de l\'État aux collectivités territoriales',
      icon: 'fr-icon-bank-line',
    },
    {
      value: domains.size,
      label: 'domaines couverts',
      caption: 'solidarité, emploi, logement, santé…',
      icon: 'fr-icon-compass-3-line',
    },
    {
      value: executable,
      label: 'règles exécutables en ligne',
      caption: 'calcul disponible via API ou simulateur',
      icon: 'fr-icon-flashlight-fill',
    },
  ]
})

/* --- Sélections éditoriales --- */
const featuredRules = rulesMock.slice(0, 3)

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso))
}

const latestUpdates = [...rulesMock]
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  .slice(0, 4)
</script>

<template>
  <div>
    <!-- ============ HERO ============ -->
    <BrandBackgroundContainer
      variant="colored"
      class="full-bleed border-b border-[#e3e3fd]"
    >
      <div class="fr-container py-10 md:py-16">
        <div class="fr-grid-row fr-grid-row--gutters">
          <div class="fr-col-12 fr-col-md-10 fr-col-lg-8">
            <div class="bg-white rounded-sm p-7 md:p-12 shadow-[0_8px_32px_rgba(0,0,145,0.08)] space-y-10">
              <hgroup class="space-y-4">
                <h1 class="m-0 text-[2rem] md:text-[2.75rem] leading-[1.15] font-bold text-gray-900">
                  Explorez les <span class="text-[#000091]">règles</span><br>
                  des droits et services <span class="text-[#000091]">publics</span>
                </h1>
                <p class="fr-text--lead text-gray-700 m-0">
                  Aides, impôts, prestations&nbsp;: comprenez comment l'administration
                  calcule vos droits, et réutilisez ces règles dans vos propres services.
                </p>
              </hgroup>
              <div class="space-y-6">
                <form
                  role="search"
                  aria-label="Rechercher une règle"
                  @submit.prevent="submitSearch"
                >
                  <label
                    class="fr-label fr-text--bold !mb-2"
                    for="hero-search"
                  >Recherchez une règle</label>
                  <div
                    class="fr-search-bar fr-search-bar--lg"
                    role="presentation"
                  >
                    <input
                      id="hero-search"
                      v-model="searchQuery"
                      class="fr-input"
                      type="search"
                      placeholder="Ex. quotient familial, crédit d'impôt recherche, droit de vote"
                    >
                    <button
                      type="submit"
                      class="fr-btn fr-btn--lg"
                    >
                      Rechercher
                    </button>
                  </div>
                </form>

                <ul
                  class="flex flex-wrap gap-2 list-none p-0 m-0"
                  aria-label="Parcourir par thématique"
                >
                  <li
                    v-for="theme in themes"
                    :key="theme.label"
                  >
                    <NuxtLink
                      :to="{ path: '/mvp/regles/', query: { q: theme.q } }"
                      class="fr-tag"
                    >
                      {{ theme.label }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </BrandBackgroundContainer>

    <BrandBackgroundContainer
      variant="subtle"
      class="full-bleed border-b border-[#e3e3fd]"
    >
      <div class="fr-container">
        <!-- ============ CHIFFRES CLÉS ============ -->
        <section
          aria-label="Le catalogue en chiffres"
          class="pt-12 md:pt-16 pb-8"
        >
          <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 m-0">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="group relative overflow-hidden rounded-lg border border-[#e3e3fd] bg-gradient-to-br from-[#f5f5fe] to-white p-5 md:p-6"
            >
              <span
                :class="stat.icon"
                class="absolute right-4 top-4 text-[#000091]/[0.1] scale-150"
                aria-hidden="true"
              />
              <dd class="relative text-[2.75rem] leading-none font-bold text-[#000091] m-0 tabular-nums">
                {{ stat.value }}
              </dd>
              <dt class="relative mt-2">
                <span class="block fr-text--sm font-semibold text-gray-900">{{ stat.label }}</span>
                <span class="block fr-text--xs mb-0 text-gray-600 mt-0.5">{{ stat.caption }}</span>
              </dt>
            </div>
          </dl>
        </section>

        <!-- ============ PROPOSITION DE VALEUR ============ -->
        <section
          aria-labelledby="valeur"
          class="py-12 md:py-16 space-y-8"
        >
          <div class="max-w-3xl space-y-3">
            <h2
              id="valeur"
              class="fr-h2 m-0"
            >
              Une référence commune, des règles vérifiables
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              Chaque règle référencée est documentée, reliée aux textes officiels qui la
              fondent et versionnée. L'administration qui la produit en garde l'entière
              maîtrise&nbsp;: le catalogue la rend visible et réutilisable.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="fr-tile fr-tile--vertical fr-enlarge-link">
              <div class="fr-tile__body">
                <div class="fr-tile__content">
                  <h3 class="fr-tile__title">
                    <NuxtLink to="/mvp/regles/">
                      Découvrir les règles
                    </NuxtLink>
                  </h3>
                  <p class="fr-tile__desc">
                    Recherchez une règle par prestation, administration ou thématique,
                    et consultez sa fiche complète.
                  </p>
                </div>
              </div>
              <div class="fr-tile__header">
                <div class="fr-tile__pictogram">
                  <img
                    src="/pictograms/document-search.svg"
                    alt=""
                    width="80"
                    height="80"
                  >
                </div>
              </div>
            </div>

            <div class="fr-tile fr-tile--vertical fr-enlarge-link">
              <div class="fr-tile__body">
                <div class="fr-tile__content">
                  <h3 class="fr-tile__title">
                    <NuxtLink to="/mvp/comprendre/verifier-une-regle">
                      Vérifier la base légale
                    </NuxtLink>
                  </h3>
                  <p class="fr-tile__desc">
                    Chaque règle est reliée aux articles de loi, décrets et conventions
                    qui la fondent, version par version.
                  </p>
                </div>
              </div>
              <div class="fr-tile__header">
                <div class="fr-tile__pictogram">
                  <img
                    src="/pictograms/justice.svg"
                    alt=""
                    width="80"
                    height="80"
                  >
                </div>
              </div>
            </div>

            <div class="fr-tile fr-tile--vertical fr-enlarge-link">
              <div class="fr-tile__body">
                <div class="fr-tile__content">
                  <h3 class="fr-tile__title">
                    <NuxtLink to="/mvp/comprendre/reutiliser-une-regle">
                      Réutiliser dans vos services
                    </NuxtLink>
                  </h3>
                  <p class="fr-tile__desc">
                    Intégrez une règle via son API documentée pour informer un usager
                    ou préremplir un dossier.
                  </p>
                </div>
              </div>
              <div class="fr-tile__header">
                <div class="fr-tile__pictogram">
                  <img
                    src="/pictograms/coding.svg"
                    alt=""
                    width="80"
                    height="80"
                  >
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ============ À LA UNE + DERNIÈRES MISES À JOUR ============ -->
        <section
          aria-labelledby="alaune"
          class="py-12 md:py-16 border-t border-gray-200"
        >
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
            <div class="lg:col-span-2 space-y-6">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <h2
                  id="alaune"
                  class="fr-h3 m-0"
                >
                  Règles à la une
                </h2>
                <NuxtLink
                  to="/mvp/regles/"
                  class="fr-link"
                >
                  Voir toutes les règles
                </NuxtLink>
              </div>

              <ul class="space-y-4 list-none p-0 m-0">
                <li
                  v-for="rule in featuredRules"
                  :key="rule.id"
                >
                  <RuleCard :rule="rule" />
                </li>
              </ul>
            </div>

            <aside
              aria-labelledby="maj"
              class="space-y-5"
            >
              <h2
                id="maj"
                class="fr-h5 m-0"
              >
                Dernières mises à jour
              </h2>
              <ul class="list-none p-0 m-0 divide-y divide-gray-200">
                <li
                  v-for="rule in latestUpdates"
                  :key="rule.id"
                  class="py-4 first:pt-0"
                >
                  <p class="fr-text--xs text-gray-600 m-0 mb-1">
                    {{ formatDate(rule.updatedAt) }}
                  </p>
                  <NuxtLink
                    :to="`/mvp/regles/${rule.slug}`"
                    class="fr-link fr-text--sm"
                  >
                    {{ rule.title }}
                  </NuxtLink>
                  <p class="fr-text--xs text-gray-600 m-0 mt-1">
                    Version {{ rule.version }} - {{ rule.organism.acronym ?? rule.organism.name }}
                  </p>
                </li>
              </ul>
            </aside>
          </div>
        </section>
      </div>
    </BrandBackgroundContainer>
    <!-- ============ BANDEAU ADMINISTRATIONS ============ -->
    <BrandBackgroundContainer
      variant="contrast"
      aria-labelledby="administrations"
      class="full-bleed"
    >
      <div class="fr-container py-14 md:py-16">
        <div class="fr-grid-row fr-grid-row--gutters">
          <div class="fr-col-12 fr-col-lg-8 flex items-center gap-8 fr-mb-2w fr-mb-md-0">
            <img
              src="/pictograms/city-hall.svg"
              alt=""
              width="96"
              height="96"
              class="hidden md:block brightness-0 invert opacity-90"
            >
            <div class="space-y-2">
              <h2
                id="administrations"
                class="fr-h4 m-0 text-white"
              >
                Vous êtes une administration&nbsp;?
              </h2>
              <p class="fr-text--sm text-white/90 m-0">
                Référencez les règles que vous appliquez&nbsp;: vous restez responsable de
                leur contenu et de leur publication, le catalogue les rend découvrables,
                traçables et réutilisables par les autres services publics.
              </p>
            </div>
          </div>
          <div class="fr-col-12 fr-col-lg-4">
            <ul class="fr-btns-group fr-btns-group--right">
              <li>
                <NuxtLink
                  to="/mvp/comprendre/referencer-une-regle"
                  class="fr-btn btn-on-dark--solid"
                >
                  Référencer vos règles
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/mvp/regles/"
                  class="fr-btn fr-btn--secondary btn-on-dark--ghost"
                >
                  Voir les règles référencées
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </BrandBackgroundContainer>
  </div>
</template>
