<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { withBaseURL } = useBaseUrl()
const { formatMonthYear } = useLocaleDate()
const { ruleVersions } = useCatalog()

useHead(() => ({ title: t('verify.title') }))

const steps = [1, 2, 3, 4].map(num => ({
  num: String(num),
  labelKey: `verify.step${num}Label`,
  descKey: `verify.step${num}Desc`,
}))

const guarantees = [
  {
    pictogram: withBaseURL('/pictograms/justice.svg'),
    titleKey: 'verify.guarantee1Title',
    bodyKey: 'verify.guarantee1Body',
  },
  {
    pictogram: withBaseURL('/pictograms/document-search.svg'),
    titleKey: 'verify.guarantee2Title',
    bodyKey: 'verify.guarantee2Body',
  },
  {
    pictogram: withBaseURL('/pictograms/contract.svg'),
    titleKey: 'verify.guarantee3Title',
    bodyKey: 'verify.guarantee3Body',
  },
]

/* --- Frise des versions de Prest'Agri, pour illustrer « l'état du droit à une date donnée » --- */
const kindMeta: Record<string, { labelKey: string, dot: string }> = {
  majeur: { labelKey: 'verify.kindMajeur', dot: 'bg-[#6e445a]' },
  mineur: { labelKey: 'verify.kindMineur', dot: 'bg-[#000091]' },
  correctif: { labelKey: 'verify.kindCorrectif', dot: 'bg-[#716043]' },
  editorial: { labelKey: 'verify.kindEditorial', dot: 'bg-gray-400' },
}
const exampleTimeline = computed(() =>
  ruleVersions.value
    .filter(v => v.ruleId === 'prestagri')
    .map(v => ({
      ...v,
      date: formatMonthYear(v.publishedAt),
      meta: kindMeta[v.kind] ?? kindMeta.editorial,
    })),
)
</script>

<template>
  <div>
    <!-- ============ EN-TÊTE + CHIFFRES CLÉS ============ -->
    <BrandBackgroundContainer
      variant="soft"
      class="full-bleed border-b border-[#e3e3fd]"
    >
      <div class="fr-container pt-1 space-y-8 pb-8">
        <div class="space-y-4">
          <Breadcrumbs
            :items="[
              { to: '/mvp', label: $t('breadcrumb.home') },
              { to: null, label: $t('breadcrumb.verify') },
            ]"
          />
          <header class="space-y-3 max-w-3xl">
            <h1 class="fr-h2 m-0">
              {{ $t('verify.heading') }}
            </h1>
            <p class="fr-text--lead text-gray-700 m-0">
              {{ $t('verify.lead') }}
            </p>
          </header>
        </div>
      </div>
    </BrandBackgroundContainer>

    <!-- ============ LA CHAÎNE + ARTEFACTS (bande rythmée) ============ -->
    <BrandBackgroundContainer
      variant="subtle"
      class="full-bleed border-b border-[#e3e3fd]"
    >
      <div class="fr-container py-12 md:py-16 space-y-12 md:space-y-16">
        <!-- La chaîne de traçabilité -->
        <section
          aria-labelledby="chaine"
          class="space-y-8"
        >
          <div class="max-w-3xl space-y-2">
            <h2
              id="chaine"
              class="fr-h3 m-0"
            >
              {{ $t('verify.chainTitle') }}
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              {{ $t('verify.chainLead') }}
            </p>
          </div>

          <ol class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 list-none p-0 m-0">
            <li
              v-for="(step, i) in steps"
              :key="step.num"
              class="relative rounded-lg border border-gray-200 bg-white p-5 marker:content-['']"
            >
              <span class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#000091] text-white font-bold">
                {{ step.num }}
              </span>
              <span
                v-if="i < steps.length - 1"
                class="hidden lg:block absolute top-7 -right-9 text-[#000091] fr-icon-arrow-right-line"
                aria-hidden="true"
              />
              <p class="fr-text--sm font-bold text-gray-900 mt-3 mb-1">
                {{ $t(step.labelKey) }}
              </p>
              <p class="fr-text--xs text-gray-600 m-0">
                {{ $t(step.descKey) }}
              </p>
            </li>
          </ol>
        </section>

        <!-- L'état du droit à une date donnée : frise de versions -->
        <section
          aria-labelledby="historique"
          class="space-y-8"
        >
          <div class="max-w-3xl space-y-2">
            <h2
              id="historique"
              class="fr-h3 m-0"
            >
              {{ $t('verify.historyTitle') }}
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              {{ $t('verify.historyLead') }}
            </p>
          </div>

          <div class="rounded-lg border border-gray-200 bg-white p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,145,0.04)]">
            <p class="fr-text--sm text-gray-700 m-0 mb-6">
              <span class="font-bold">{{ $t('verify.timelineRule') }}</span>
              <span class="text-gray-500">{{ $t('verify.timelineProducer') }}</span>
            </p>
            <ol class="relative list-none p-0 pl-6 m-0 ml-2 space-y-6">
              <li
                v-for="v in exampleTimeline"
                :key="v.id"
                class="relative pl-6"
              >
                <span
                  class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white"
                  :class="v.meta!.dot"
                  aria-hidden="true"
                />
                <div class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span class="fr-text--sm mb-0 font-bold text-gray-900 tabular-nums">{{ formatRuleVersion(v.version) }}</span>
                  <span class="fr-text--xs mb-0 text-gray-500">{{ v.date }}</span>
                  <span class="fr-text--xs mb-0 text-gray-400">·</span>
                  <span class="fr-text--xs mb-0 text-gray-500">{{ $t(v.meta!.labelKey) }}</span>
                </div>
                <p class="fr-text--sm mb-0 text-gray-700 m-0 mt-1">
                  {{ v.changelog }}
                </p>
              </li>
            </ol>
          </div>
        </section>
      </div>
    </BrandBackgroundContainer>

    <!-- ============ GARANTIES (fond blanc) ============ -->
    <section
      aria-labelledby="garanties"
      class="fr-container py-12 md:py-16 space-y-8"
    >
      <h2
        id="garanties"
        class="fr-h3 m-0 max-w-3xl"
      >
        {{ $t('verify.guaranteesTitle') }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="g in guarantees"
          :key="g.titleKey"
          class="rounded-lg border border-gray-200 bg-white p-6 space-y-3"
        >
          <img
            :src="g.pictogram"
            alt=""
            width="64"
            height="64"
          >
          <h3 class="fr-h6 m-0">
            {{ $t(g.titleKey) }}
          </h3>
          <p class="fr-text--sm mb-0 text-gray-700 m-0">
            {{ $t(g.bodyKey) }}
          </p>
        </div>
      </div>
    </section>

    <!-- ============ APPEL À EXPLORER ============ -->
    <BrandBackgroundContainer
      variant="contrast"
      class="full-bleed"
    >
      <div class="fr-container py-12 md:py-14">
        <div class="max-w-2xl space-y-3">
          <h2 class="fr-h4 m-0 text-white">
            {{ $t('verify.ctaTitle') }}
          </h2>
          <p class="fr-text--sm mb-0 text-white/90 m-0">
            {{ $t('verify.ctaBody') }}
          </p>
          <div class="flex flex-wrap gap-3 pt-2">
            <NuxtLink
              :to="localePath('/mvp/regles/prestagri?tab=legal')"
              class="fr-btn btn-on-dark--solid"
            >
              {{ $t('verify.ctaPrimary') }}
            </NuxtLink>
            <NuxtLink
              :to="localePath('/mvp/regles/')"
              class="fr-btn fr-btn--secondary btn-on-dark--ghost"
            >
              {{ $t('verify.ctaSecondary') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </BrandBackgroundContainer>
  </div>
</template>
