<script setup lang="ts">
const { t, locale, locales } = useI18n()

/** Étiquette BCP 47 de la locale active (fr-FR, en-GB) pour l'attribut `lang`. */
const language = computed(() =>
  locales.value.find(entry => entry.code === locale.value)?.language ?? locale.value,
)

useHead(() => ({
  htmlAttrs: { lang: language.value },
  title: t('site.title'),
  bodyAttrs: {
    class: 'fr-display-md',
  },
}))
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
