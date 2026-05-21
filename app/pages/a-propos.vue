<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'À propos de cette préfiguration' })

const mvpDemos = demosByHorizon('mvp')
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="fr-container fr-py-6w max-w-4xl space-y-12">
      <p class="fr-text--sm">
        <NuxtLink
          to="/mvp"
          class="fr-link fr-link--icon-left fr-icon-arrow-left-line"
        >
          Ouvrir le catalogue
        </NuxtLink>
      </p>

      <header class="space-y-3">
        <h1 class="fr-h2 m-0">
          À propos de cette préfiguration
        </h1>
        <p class="fr-text--lead m-0">
          Cette interface préfigure, écran par écran, à quoi pourrait ressembler le
          catalogue des règles publiques. Les écrans se présentent comme si le produit
          existait ; cette page hors-parcours en explicite le cadre.
        </p>
      </header>

      <section class="space-y-4">
        <h2 class="fr-h4 m-0">
          Les écrans préfigurés
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
