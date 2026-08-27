<script setup lang="ts">
/**
 * Tag qualifié « clé : valeur » pour expliciter ce que chaque badge décrit.
 * Rend la lecture pédagogique : on dit l'axe (règle, modèle, valeur, moteur)
 * avant la valeur, plutôt que d'empiler des libellés muets.
 * Avec `hint`, le tag ouvre un panneau explicatif au survol ou au clic.
 */
withDefaults(defineProps<{
  /** Axe qualifié, affiché en préfixe atténué (ex. « règle », « modèle »). */
  axis: string
  /** Valeur de l'axe (ex. « exécutable », « ouvert »). */
  value: string
  /** Classe de couleur de fond (tokens DSFR ou utilitaires). */
  tone?: 'neutral' | 'green' | 'blue' | 'purple' | 'yellow' | 'grey'
  /** Explication affichée dans un panneau contextuel. */
  hint?: string
}>(), {
  tone: 'neutral',
  hint: undefined,
})

const toneClass: Record<string, string> = {
  neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  green: 'bg-[#e3fce5] text-[#18753c] border-[#c4f5cc]',
  blue: 'bg-[#e8edff] text-[#0063cb] border-[#cad8ff]',
  purple: 'bg-[#f3e8ff] text-[#6e2caf] border-[#e9d4ff]',
  yellow: 'bg-[#fef3d8] text-[#716043] border-[#fbe2a8]',
  grey: 'bg-gray-100 text-gray-600 border-gray-200',
}
</script>

<template>
  <HintPopover
    v-if="hint"
    :text="hint"
    :label="`${axis} ${value} : plus d’information`"
    align="right"
  >
    <span
      class="inline-flex items-baseline gap-1 rounded border px-2 py-0.5 fr-text--xs leading-tight whitespace-nowrap"
      :class="toneClass[tone]"
    >
      <span class="opacity-60 font-normal">{{ axis }}</span>
      <span class="font-semibold border-b border-dotted border-current">{{ value }}</span>
    </span>
  </HintPopover>
  <span
    v-else
    class="inline-flex items-baseline gap-1 rounded border px-2 py-0.5 fr-text--xs leading-tight whitespace-nowrap"
    :class="toneClass[tone]"
  >
    <span class="opacity-60 font-normal">{{ axis }}</span>
    <span class="font-semibold">{{ value }}</span>
  </span>
</template>

<style scoped>
/* Neutralise le margin vertical des classes typographiques DSFR. */
span :deep([class*='fr-text--']),
span[class*='fr-text--'] {
  margin: 0;
}
</style>
