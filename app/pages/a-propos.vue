<script setup lang="ts">
definePageMeta({ layout: false })

const { t } = useI18n()
const localePath = useLocalePath()

useHead(() => ({ title: t('about.title') }))

const mvpDemos = demosByHorizon('mvp')
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="fr-container fr-py-6w max-w-4xl space-y-12">
      <p class="fr-text--sm">
        <NuxtLink
          :to="localePath('/mvp')"
          class="fr-link fr-link--icon-left fr-icon-arrow-left-line"
        >
          {{ $t('about.openCatalogue') }}
        </NuxtLink>
      </p>

      <header class="space-y-3">
        <h1 class="fr-h2 m-0">
          {{ $t('about.title') }}
        </h1>
        <p class="fr-text--lead m-0">
          {{ $t('about.lead') }}
        </p>
      </header>

      <section class="space-y-4">
        <h2 class="fr-h4 m-0">
          {{ $t('about.screensTitle') }}
        </h2>
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
          <li
            v-for="demo in mvpDemos"
            :key="demo.slug"
          >
            <DemoCard :demo="demo" />
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
