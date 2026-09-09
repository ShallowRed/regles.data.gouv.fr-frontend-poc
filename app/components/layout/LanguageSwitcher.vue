<script setup lang="ts">
/**
 * Sélecteur de langue de l'en-tête. Les liens pointent vers la route courante dans
 * l'autre langue (`switchLocalePath`), sans passer par un menu déroulant : le DSFR
 * JavaScript n'est pas chargé dans ce POC.
 */
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
</script>

<template>
  <nav
    class="fr-translate"
    :aria-label="$t('language.legend')"
  >
    <ul class="flex items-center list-none p-0 m-0 divide-x divide-gray-300">
      <li
        v-for="entry in locales"
        :key="entry.code"
      >
        <NuxtLink
          :to="switchLocalePath(entry.code)"
          class="block px-2 fr-text--sm mb-0 bg-none leading-tight"
          :class="entry.code === locale ? 'font-bold text-[#000091]' : 'font-normal text-gray-600 hover:text-[#000091]'"
          :lang="entry.code"
          :hreflang="entry.code"
          :aria-current="entry.code === locale ? 'true' : undefined"
        >
          <span aria-hidden="true">{{ entry.code.toUpperCase() }}</span>
          <span class="sr-only">{{ entry.name }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
