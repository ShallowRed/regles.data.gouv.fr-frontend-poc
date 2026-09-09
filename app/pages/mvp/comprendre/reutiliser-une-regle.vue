<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { withBaseURL } = useBaseUrl()

useHead(() => ({ title: t('reuse.title') }))

const audiences = [
  {
    pictogram: withBaseURL('pictograms/city-hall.svg'),
    titleKey: 'reuse.audience1Title',
    bodyKey: 'reuse.audience1Body',
    exampleKeys: ['reuse.audience1Example1', 'reuse.audience1Example2', 'reuse.audience1Example3'],
  },
  {
    pictogram: withBaseURL('pictograms/contract.svg'),
    titleKey: 'reuse.audience2Title',
    bodyKey: 'reuse.audience2Body',
    exampleKeys: ['reuse.audience2Example1', 'reuse.audience2Example2', 'reuse.audience2Example3'],
  },
  {
    pictogram: withBaseURL('pictograms/coding.svg'),
    titleKey: 'reuse.audience3Title',
    bodyKey: 'reuse.audience3Body',
    exampleKeys: ['reuse.audience3Example1', 'reuse.audience3Example2', 'reuse.audience3Example3'],
  },
]

const modes = [
  {
    icon: 'fr-icon-terminal-box-line',
    titleKey: 'reuse.mode1Title',
    bodyKey: 'reuse.mode1Body',
    availabilityKey: 'reuse.mode1Availability',
  },
  {
    icon: 'fr-icon-window-line',
    titleKey: 'reuse.mode2Title',
    bodyKey: 'reuse.mode2Body',
    availabilityKey: 'reuse.mode2Availability',
  },
  {
    icon: 'fr-icon-download-line',
    titleKey: 'reuse.mode3Title',
    bodyKey: 'reuse.mode3Body',
    availabilityKey: 'reuse.mode3Availability',
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
              { to: '/mvp', label: $t('breadcrumb.home') },
              { to: null, label: $t('breadcrumb.reuse') },
            ]"
          />
          <header class="space-y-3 max-w-3xl">
            <h1 class="fr-h2 m-0">
              {{ $t('reuse.heading') }}
            </h1>
            <p class="fr-text--lead text-gray-700 m-0">
              {{ $t('reuse.lead') }}
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
          {{ $t('reuse.audiencesTitle') }}
        </h2>
        <p class="fr-text--lg text-gray-700 m-0">
          {{ $t('reuse.audiencesLead') }}
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
              {{ $t('reuse.modesTitle') }}
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              {{ $t('reuse.modesLead') }}
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              v-for="m in modes"
              :key="m.titleKey"
              class="flex flex-col rounded-lg border border-gray-200 bg-white p-6 space-y-3"
            >
              <span
                :class="m.icon"
                class="fr-icon--lg text-[#000091]"
                aria-hidden="true"
              />
              <h3 class="fr-h6 m-0">
                {{ $t(m.titleKey) }}
              </h3>
              <p class="fr-text--sm text-gray-700 m-0">
                {{ $t(m.bodyKey) }}
              </p>
              <p class="fr-text--xs text-gray-600 m-0 pt-2 mt-auto border-t border-gray-100 flex items-start gap-1.5">
                <span
                  class="fr-icon-information-line fr-icon--xs text-[#000091] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{{ $t(m.availabilityKey) }}</span>
              </p>
            </div>
          </div>
          <p class="fr-text--sm text-gray-600 max-w-2xl m-0">
            {{ $t('reuse.modesNote') }}
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
            {{ $t('reuse.ctaTitle') }}
          </h2>
          <p class="fr-text--sm text-white/90 m-0">
            {{ $t('reuse.ctaBody') }}
          </p>
          <div class="flex flex-wrap gap-3 pt-2">
            <NuxtLink
              :to="localePath('/mvp/regles/prestagri?tab=api')"
              class="fr-btn btn-on-dark--solid"
            >
              {{ $t('reuse.ctaPrimary') }}
            </NuxtLink>
            <NuxtLink
              :to="localePath('/mvp/regles/')"
              class="fr-btn fr-btn--secondary btn-on-dark--ghost"
            >
              {{ $t('reuse.ctaSecondary') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </BrandBackgroundContainer>
  </div>
</template>
