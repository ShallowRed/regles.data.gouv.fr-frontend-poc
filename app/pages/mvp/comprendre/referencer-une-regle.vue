<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { withBaseURL } = useBaseUrl()

useHead(() => ({ title: t('reference.title') }))

/* --- Le parcours de référencement, en quatre temps --- */
const steps = [1, 2, 3, 4].map(num => ({
  num: String(num),
  labelKey: `reference.step${num}Label`,
  descKey: `reference.step${num}Desc`,
}))

/* --- Ce que le producteur garde vs. ce que le catalogue ajoute --- */
const ownership = [
  { icon: 'fr-icon-lock-line', titleKey: 'reference.ownership1Title', bodyKey: 'reference.ownership1Body' },
  { icon: 'fr-icon-git-branch-line', titleKey: 'reference.ownership2Title', bodyKey: 'reference.ownership2Body' },
  { icon: 'fr-icon-eye-line', titleKey: 'reference.ownership3Title', bodyKey: 'reference.ownership3Body' },
]

/* --- Niveaux de référencement : du minimum à l'exécutable --- */
const levels = [1, 2, 3].map(num => ({
  tagKey: `reference.level${num}Tag`,
  titleKey: `reference.level${num}Title`,
  bodyKey: `reference.level${num}Body`,
  requirementKey: `reference.level${num}Requirement`,
}))

/* --- À qui s'adresse le référencement --- */
const audiences = [
  {
    pictogram: withBaseURL('/pictograms/city-hall.svg'),
    titleKey: 'reference.audience1Title',
    bodyKey: 'reference.audience1Body',
    exampleKeys: ['reference.audience1Example1', 'reference.audience1Example2', 'reference.audience1Example3'],
  },
  {
    pictogram: withBaseURL('/pictograms/justice.svg'),
    titleKey: 'reference.audience2Title',
    bodyKey: 'reference.audience2Body',
    exampleKeys: ['reference.audience2Example1', 'reference.audience2Example2', 'reference.audience2Example3'],
  },
  {
    pictogram: withBaseURL('/pictograms/contract.svg'),
    titleKey: 'reference.audience3Title',
    bodyKey: 'reference.audience3Body',
    exampleKeys: ['reference.audience3Example1', 'reference.audience3Example2', 'reference.audience3Example3'],
  },
]
</script>

<template>
  <div>
    <!-- ============ EN-TÊTE ============ -->
    <BrandBackgroundContainer
      variant="soft"
      class="full-bleed border-b border-[#e3e3fd]"
    >
      <div class="fr-container pt-1 space-y-8 pb-8">
        <div class="space-y-4">
          <Breadcrumbs
            :items="[
              { to: '/mvp', label: $t('breadcrumb.home') },
              { to: null, label: $t('breadcrumb.reference') },
            ]"
          />
          <header class="space-y-3 max-w-3xl">
            <h1 class="fr-h2 m-0">
              {{ $t('reference.heading') }}
            </h1>
            <p class="fr-text--lead text-gray-700 m-0">
              {{ $t('reference.lead') }}
            </p>
          </header>
        </div>
      </div>
    </BrandBackgroundContainer>

    <!-- ============ PARCOURS + NIVEAUX (bande rythmée) ============ -->
    <BrandBackgroundContainer
      variant="subtle"
      class="full-bleed border-b border-[#e3e3fd]"
    >
      <div class="fr-container py-12 md:py-16 space-y-12 md:space-y-16">
        <!-- Le parcours -->
        <section
          aria-labelledby="parcours"
          class="space-y-8"
        >
          <div class="max-w-3xl space-y-2">
            <h2
              id="parcours"
              class="fr-h3 m-0"
            >
              {{ $t('reference.processTitle') }}
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              {{ $t('reference.processLead') }}
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

        <!-- Niveaux de référencement -->
        <section
          aria-labelledby="niveaux"
          class="space-y-8"
        >
          <div class="max-w-3xl space-y-2">
            <h2
              id="niveaux"
              class="fr-h3 m-0"
            >
              {{ $t('reference.levelsTitle') }}
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              {{ $t('reference.levelsLead') }}
            </p>
          </div>

          <ol class="grid grid-cols-1 md:grid-cols-3 gap-6 list-none p-0 m-0">
            <li
              v-for="(level, i) in levels"
              :key="level.tagKey"
              class="flex flex-col rounded-lg border border-gray-200 bg-white p-6 space-y-3"
            >
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#f5f5fe] text-[#000091] fr-text--xs mb-0 font-bold tabular-nums">
                  {{ i + 1 }}
                </span>
                <span class="fr-badge fr-badge--sm fr-badge--blue-cumulus fr-badge--no-icon">{{ $t(level.tagKey) }}</span>
              </div>
              <h3 class="fr-h6 m-0">
                {{ $t(level.titleKey) }}
              </h3>
              <p class="fr-text--sm text-gray-700 m-0">
                {{ $t(level.bodyKey) }}
              </p>
              <p class="fr-text--xs text-gray-600 m-0 pt-2 mt-auto border-t border-gray-100 flex items-start gap-1.5">
                <span
                  class="fr-icon-information-line fr-icon--xs text-[#000091] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{{ $t(level.requirementKey) }}</span>
              </p>
            </li>
          </ol>
        </section>

        <!-- Propriété préservée -->
        <section
          aria-labelledby="propriete"
          class="space-y-8"
        >
          <div class="max-w-3xl space-y-2">
            <h2
              id="propriete"
              class="fr-h3 m-0"
            >
              {{ $t('reference.ownershipTitle') }}
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              {{ $t('reference.ownershipLead') }}
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              v-for="o in ownership"
              :key="o.titleKey"
              class="rounded-lg border border-gray-200 bg-white p-6 space-y-3"
            >
              <span
                :class="o.icon"
                class="fr-icon--lg text-[#000091]"
                aria-hidden="true"
              />
              <h3 class="fr-h6 m-0">
                {{ $t(o.titleKey) }}
              </h3>
              <p class="fr-text--sm text-gray-700 m-0">
                {{ $t(o.bodyKey) }}
              </p>
            </div>
          </div>
        </section>
      </div>
    </BrandBackgroundContainer>

    <!-- ============ À QUI ÇA S'ADRESSE (fond blanc) ============ -->
    <section
      aria-labelledby="audiences"
      class="fr-container py-12 md:py-16 space-y-8"
    >
      <div class="max-w-3xl space-y-2">
        <h2
          id="audiences"
          class="fr-h3 m-0"
        >
          {{ $t('reference.audiencesTitle') }}
        </h2>
        <p class="fr-text--lg text-gray-700 m-0">
          {{ $t('reference.audiencesLead') }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="a in audiences"
          :key="a.titleKey"
          class="rounded-lg border border-gray-200 bg-white p-6 space-y-3"
        >
          <img
            :src="a.pictogram"
            alt=""
            width="64"
            height="64"
          >
          <h3 class="fr-h6 m-0">
            {{ $t(a.titleKey) }}
          </h3>
          <p class="fr-text--sm text-gray-700 m-0">
            {{ $t(a.bodyKey) }}
          </p>
          <ul class="flex flex-wrap gap-1.5 list-none p-0 m-0 pt-1">
            <li
              v-for="ex in a.exampleKeys"
              :key="ex"
              class="fr-tag fr-tag--sm"
            >
              {{ $t(ex) }}
            </li>
          </ul>
        </div>
      </div>

      <p class="fr-text--sm text-gray-600 max-w-2xl m-0">
        {{ $t('reference.accompaniment') }}
      </p>
    </section>

    <!-- ============ APPEL À RÉFÉRENCER ============ -->
    <BrandBackgroundContainer
      variant="contrast"
      class="full-bleed"
    >
      <div class="fr-container py-12 md:py-14">
        <div class="max-w-2xl space-y-3">
          <h2 class="fr-h4 m-0 text-white">
            {{ $t('reference.ctaTitle') }}
          </h2>
          <p class="fr-text--sm mb-0 text-white/90 m-0">
            {{ $t('reference.ctaBody') }}
          </p>
          <div class="flex flex-wrap gap-3 pt-2">
            <a
              href="mailto:catalogue-regles@beta.gouv.fr"
              class="fr-btn btn-on-dark--solid"
            >
              {{ $t('reference.ctaPrimary') }}
            </a>
            <NuxtLink
              :to="localePath('/mvp/regles/')"
              class="fr-btn fr-btn--secondary btn-on-dark--ghost"
            >
              {{ $t('reference.ctaSecondary') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </BrandBackgroundContainer>
  </div>
</template>
