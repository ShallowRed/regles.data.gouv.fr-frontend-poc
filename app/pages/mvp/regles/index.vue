<script setup lang="ts">
import type { FacetCounts, RuleFiltersState } from '~/components/business/RuleFilters.vue'
import type { Rule, RuleDomain } from '~/types'

const { t, locale } = useI18n()
const route = useRoute()
const { rules } = useCatalog()

useHead(() => ({ title: t('catalogue.title') }))

const filters = ref<RuleFiltersState>({
  search: String(route.query.q ?? ''),
  domain: (typeof route.query.domain === 'string' ? route.query.domain as RuleDomain : null),
  organismId: null,
  maturity: null,
  engine: null,
  nature: null,
})

type SortKey = 'recent' | 'maturity' | 'alpha'
const sort = ref<SortKey>('recent')

/** Ouverture du panneau de filtres sur mobile (toujours visible en desktop). */
const mobileFiltersOpen = ref(false)

/** Applique tous les filtres sauf un (pour des décomptes de facette cohérents). */
function matches(rule: Rule, except?: keyof RuleFiltersState) {
  const f = filters.value
  if (except !== 'search' && f.search) {
    const q = f.search.trim().toLowerCase()
    const hay = `${rule.title} ${rule.shortDescription} ${rule.organism.name} ${rule.tags.join(' ')}`.toLowerCase()
    if (!hay.includes(q))
      return false
  }
  if (except !== 'domain' && f.domain && rule.domain !== f.domain)
    return false
  if (except !== 'organismId' && f.organismId && rule.organism.id !== f.organismId)
    return false
  if (except !== 'maturity' && f.maturity
    && maturityMeta(rule.maturity).rank < maturityMeta(f.maturity).rank) {
    return false
  }
  if (except !== 'engine' && f.engine && rule.engine !== f.engine)
    return false
  if (except !== 'nature' && f.nature && rule.nature !== f.nature)
    return false
  return true
}

const filtered = computed(() => {
  const list = rules.value.filter(r => matches(r))
  const sorted = [...list]
  if (sort.value === 'recent') {
    sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }
  else if (sort.value === 'alpha') {
    sorted.sort((a, b) => a.title.localeCompare(b.title, locale.value))
  }
  else {
    sorted.sort((a, b) => maturityMeta(b.maturity).rank - maturityMeta(a.maturity).rank)
  }
  return sorted
})

/** Décomptes par facette : chaque facette ignore son propre filtre. */
const facets = computed<FacetCounts>(() => {
  const result: FacetCounts = { domain: {}, organism: {}, maturity: {}, engine: {}, nature: {} }

  for (const rule of rules.value.filter(r => matches(r, 'domain'))) {
    result.domain[rule.domain] = (result.domain[rule.domain] ?? 0) + 1
  }
  for (const rule of rules.value.filter(r => matches(r, 'organismId'))) {
    const o = rule.organism
    const entry = result.organism[o.id] ?? { label: o.acronym ?? o.name, count: 0 }
    entry.count++
    result.organism[o.id] = entry
  }
  // Décompte cumulatif : une règle exécutable permet aussi tout ce que permettent les niveaux inférieurs.
  const maturityPool = rules.value.filter(r => matches(r, 'maturity'))
  for (const meta of maturityScale) {
    result.maturity[meta.level] = maturityPool
      .filter(r => maturityMeta(r.maturity).rank >= meta.rank)
      .length
  }
  for (const rule of rules.value.filter(r => matches(r, 'engine'))) {
    result.engine[rule.engine] = (result.engine[rule.engine] ?? 0) + 1
  }
  for (const rule of rules.value.filter(r => matches(r, 'nature'))) {
    result.nature[rule.nature] = (result.nature[rule.nature] ?? 0) + 1
  }
  return result
})

/** Chips résumant les filtres actifs, chacune retirable. */
const activeChips = computed(() => {
  const f = filters.value
  const chips: { key: keyof RuleFiltersState, label: string }[] = []
  if (f.search)
    chips.push({ key: 'search', label: t('catalogue.chipSearch', { query: f.search }) })
  if (f.domain)
    chips.push({ key: 'domain', label: t(domainMeta(f.domain).labelKey) })
  if (f.organismId)
    chips.push({ key: 'organismId', label: facets.value.organism[f.organismId]?.label ?? f.organismId })
  if (f.maturity)
    chips.push({ key: 'maturity', label: t(maturityMeta(f.maturity).actionKey) })
  if (f.nature)
    chips.push({ key: 'nature', label: t('catalogue.chipModel', { value: t(ruleNatureMeta(f.nature).labelKey).toLowerCase() }) })
  if (f.engine)
    chips.push({ key: 'engine', label: f.engine })
  return chips
})

function clearChip(key: keyof RuleFiltersState) {
  filters.value = { ...filters.value, [key]: key === 'search' ? '' : null }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Bandeau d'en-tête texturé -->
    <BrandBackgroundContainer
      variant="soft"
      class="full-bleed border-b border-[#e3e3fd] pt-1 pb-8"
    >
      <div class="fr-container">
        <Breadcrumbs
          :items="[
            { to: '/mvp', label: $t('breadcrumb.home') },
            { to: null, label: $t('breadcrumb.catalogue') },
          ]"
        />

        <header class="space-y-2 max-w-3xl">
          <h1 class="fr-h2 m-0">
            {{ $t('catalogue.title') }}
          </h1>
          <p class="fr-text--lead text-gray-700 m-0">
            {{ $t('catalogue.lead') }}
          </p>
        </header>
      </div>
    </BrandBackgroundContainer>

    <!-- Déclencheur des filtres sur mobile uniquement -->
    <button
      type="button"
      class="lg:hidden flex items-center gap-2 fr-btn fr-btn--secondary fr-icon-filter-line fr-btn--icon-left w-full justify-center"
      @click="mobileFiltersOpen = !mobileFiltersOpen"
    >
      {{ mobileFiltersOpen ? $t('catalogue.hideFilters') : $t('catalogue.showFilters') }}
      <span
        v-if="activeChips.length"
        class="fr-badge fr-badge--sm fr-badge--blue-cumulus"
      >
        {{ activeChips.length }}
      </span>
    </button>

    <BrandBackgroundContainer
      variant="subtle"
      class="full-bleed"
    >
      <div class="fr-container pb-24">
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_3fr] lg:gap-8 items-start">
          <!-- Colonne filtres : sticky + scroll indépendant en desktop -->
          <div
            class="catalogue-rail border-r border-grey-300"
            :class="{ 'hidden lg:block': !mobileFiltersOpen }"
          >
            <RuleFilters
              v-model="filters"
              :facets="facets"
            />
          </div>
          <!-- <div
            class="h-full w-[1px] bg-gray-200"
            aria-hidden="true"
          /> -->
          <div class="min-w-0 space-y-5">
            <!-- Barre de résultats : nombre + tri -->
            <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 pb-3">
              <p class="m-0">
                <strong class="text-lg">{{ filtered.length }}</strong>
                <span class="text-gray-700">&nbsp;{{ $t('catalogue.results', filtered.length) }}</span>
              </p>
              <div class="flex items-center gap-2">
                <label
                  for="sort"
                  class="fr-text--sm text-gray-600 m-0"
                >{{ $t('catalogue.sortLabel') }}</label>
                <select
                  id="sort"
                  v-model="sort"
                  class="fr-select !w-auto !mt-0 fr-select--sm"
                >
                  <option value="recent">
                    {{ $t('catalogue.sortRecent') }}
                  </option>
                  <option value="maturity">
                    {{ $t('catalogue.sortMaturity') }}
                  </option>
                  <option value="alpha">
                    {{ $t('catalogue.sortAlpha') }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Chips de filtres actifs -->
            <ul
              v-if="activeChips.length"
              class="flex flex-wrap gap-2 list-none p-0 m-0"
            >
              <li
                v-for="chip in activeChips"
                :key="chip.key"
              >
                <button
                  type="button"
                  class="fr-tag fr-tag--dismiss fr-tag--sm"
                  @click="clearChip(chip.key)"
                >
                  {{ chip.label }}
                </button>
              </li>
            </ul>

            <!-- Liste : une carte par ligne -->
            <ul
              v-if="filtered.length"
              class="space-y-4 list-none p-0 m-0"
            >
              <li
                v-for="rule in filtered"
                :key="rule.id"
              >
                <RuleCard :rule="rule" />
              </li>
            </ul>

            <div
              v-else
              class="fr-callout fr-callout--brown-caramel"
            >
              <p class="fr-callout__title">
                {{ $t('catalogue.emptyTitle') }}
              </p>
              <p class="fr-callout__text">
                {{ $t('catalogue.emptyBody') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </BrandBackgroundContainer>
  </div>
</template>

<style scoped>
/* En desktop, la colonne de filtres reste visible au scroll et défile
   indépendamment quand son contenu dépasse la hauteur du viewport. */
@media (min-width: 992px) {
  .catalogue-rail {
    position: sticky;
    top: 1.5rem;
    max-height: calc(100vh - 3rem);
    overflow-y: auto;
    overscroll-behavior: contain;
    /* gouttière discrète pour la scrollbar */
    padding-right: 0.5rem;
  }

  .catalogue-rail::-webkit-scrollbar {
    width: 6px;
  }

  .catalogue-rail::-webkit-scrollbar-thumb {
    background: #d1d1d1;
    border-radius: 3px;
  }
}
</style>
