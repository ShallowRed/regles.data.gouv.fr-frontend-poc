<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { formatLong } = useLocaleDate()
const { rules } = useCatalog()

useHead(() => ({ title: t('home.title') }))

/* --- Recherche du hero, renvoie vers le catalogue --- */
const searchQuery = ref('')
function submitSearch() {
  const q = searchQuery.value.trim()
  navigateTo({ path: localePath('/mvp/regles/'), query: q ? { q } : {} })
}

// Quick-entry themes: a policy area opens the registry on its facet; the two
// themes without a facet search the localized keyword.
const themes = [
  { labelKey: 'home.themes.solidarite', query: { domain: 'solidarite' } },
  { labelKey: 'home.themes.fiscalite', query: { domain: 'fiscalite' } },
  { labelKey: 'home.themes.emploi', query: { domain: 'emploi' } },
  { labelKey: 'home.themes.retraite', query: { domain: 'retraite' } },
  { labelKey: 'home.themes.famille', queryKey: 'home.themeQueries.famille' },
  { labelKey: 'home.themes.culture', query: { domain: 'culture' } },
  { labelKey: 'home.themes.jeunesse', queryKey: 'home.themeQueries.jeunesse' },
]
function themeQuery(theme: { query?: Record<string, string>, queryKey?: string }) {
  return theme.query ?? { q: t(theme.queryKey!) }
}

/* --- Chiffres clés dérivés des données du catalogue --- */
const stats = computed(() => {
  const domains = new Set(rules.value.map(r => r.domain))
  const producers = new Set(rules.value.map(r => r.organism.id))
  const executable = rules.value.filter(r => r.maturity === 'N3').length
  return [
    {
      value: rules.value.length,
      label: t('home.stats.rulesLabel'),
      caption: t('home.stats.rulesCaption'),
      icon: 'fr-icon-file-text-line',
    },
    {
      value: producers.size,
      label: t('home.stats.producersLabel'),
      caption: t('home.stats.producersCaption'),
      icon: 'fr-icon-bank-line',
    },
    {
      value: domains.size,
      label: t('home.stats.domainsLabel'),
      caption: t('home.stats.domainsCaption'),
      icon: 'fr-icon-compass-3-line',
    },
    {
      value: executable,
      label: t('home.stats.executableLabel'),
      caption: t('home.stats.executableCaption'),
      icon: 'fr-icon-flashlight-fill',
    },
  ]
})

/* --- Sélections éditoriales --- */
const featuredRules = computed(() => rules.value.slice(0, 3))

const latestUpdates = computed(() => [...rules.value]
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  .slice(0, 4))
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
                  {{ $t('home.hero.titleLead1') }} <span class="text-[#000091]">{{ $t('home.hero.titleAccent1') }}</span><br>
                  {{ $t('home.hero.titleLead2') }} <span class="text-[#000091]">{{ $t('home.hero.titleAccent2') }}</span>
                </h1>
                <p class="fr-text--lead text-gray-700 m-0">
                  {{ $t('home.hero.lead') }}
                </p>
              </hgroup>
              <div class="space-y-6">
                <form
                  role="search"
                  :aria-label="$t('home.hero.searchFormLabel')"
                  @submit.prevent="submitSearch"
                >
                  <label
                    class="fr-label fr-text--bold !mb-2"
                    for="hero-search"
                  >{{ $t('home.hero.searchLabel') }}</label>
                  <div
                    class="fr-search-bar fr-search-bar--lg"
                    role="presentation"
                  >
                    <input
                      id="hero-search"
                      v-model="searchQuery"
                      class="fr-input"
                      type="search"
                      :placeholder="$t('home.hero.searchPlaceholder')"
                    >
                    <button
                      type="submit"
                      class="fr-btn fr-btn--lg"
                    >
                      {{ $t('home.hero.searchSubmit') }}
                    </button>
                  </div>
                </form>

                <ul
                  class="flex flex-wrap gap-2 list-none p-0 m-0"
                  :aria-label="$t('home.hero.themesLabel')"
                >
                  <li
                    v-for="theme in themes"
                    :key="theme.labelKey"
                  >
                    <NuxtLink
                      :to="{ path: localePath('/mvp/regles/'), query: themeQuery(theme) }"
                      class="fr-tag"
                    >
                      {{ $t(theme.labelKey) }}
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
          :aria-label="$t('home.stats.sectionLabel')"
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
              {{ $t('home.value.title') }}
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              {{ $t('home.value.lead') }}
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="fr-tile fr-tile--vertical fr-enlarge-link">
              <div class="fr-tile__body">
                <div class="fr-tile__content">
                  <h3 class="fr-tile__title">
                    <NuxtLink :to="localePath('/mvp/regles/')">
                      {{ $t('home.value.discoverTitle') }}
                    </NuxtLink>
                  </h3>
                  <p class="fr-tile__desc">
                    {{ $t('home.value.discoverBody') }}
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
                    <NuxtLink :to="localePath('/mvp/comprendre/verifier-une-regle')">
                      {{ $t('home.value.verifyTitle') }}
                    </NuxtLink>
                  </h3>
                  <p class="fr-tile__desc">
                    {{ $t('home.value.verifyBody') }}
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
                    <NuxtLink :to="localePath('/mvp/comprendre/reutiliser-une-regle')">
                      {{ $t('home.value.reuseTitle') }}
                    </NuxtLink>
                  </h3>
                  <p class="fr-tile__desc">
                    {{ $t('home.value.reuseBody') }}
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
                  {{ $t('home.featured.title') }}
                </h2>
                <NuxtLink
                  :to="localePath('/mvp/regles/')"
                  class="fr-link"
                >
                  {{ $t('home.featured.seeAll') }}
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
                {{ $t('home.featured.updatesTitle') }}
              </h2>
              <ul class="list-none p-0 m-0 divide-y divide-gray-200">
                <li
                  v-for="rule in latestUpdates"
                  :key="rule.id"
                  class="py-4 first:pt-0"
                >
                  <p class="fr-text--xs text-gray-600 m-0 mb-1">
                    {{ formatLong(rule.updatedAt) }}
                  </p>
                  <NuxtLink
                    :to="localePath(`/mvp/regles/${rule.slug}`)"
                    class="fr-link fr-text--sm"
                  >
                    {{ rule.title }}
                  </NuxtLink>
                  <p class="fr-text--xs text-gray-600 m-0 mt-1">
                    {{ $t('home.featured.updateLine', { version: rule.version, organism: rule.organism.acronym ?? rule.organism.name }) }}
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
                {{ $t('home.administrations.title') }}
              </h2>
              <p class="fr-text--sm text-white/90 m-0">
                {{ $t('home.administrations.body') }}
              </p>
            </div>
          </div>
          <div class="fr-col-12 fr-col-lg-4">
            <ul class="fr-btns-group fr-btns-group--right">
              <li>
                <NuxtLink
                  :to="localePath('/mvp/comprendre/referencer-une-regle')"
                  class="fr-btn btn-on-dark--solid"
                >
                  {{ $t('home.administrations.primary') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  :to="localePath('/mvp/regles/')"
                  class="fr-btn fr-btn--secondary btn-on-dark--ghost"
                >
                  {{ $t('home.administrations.secondary') }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </BrandBackgroundContainer>
  </div>
</template>
