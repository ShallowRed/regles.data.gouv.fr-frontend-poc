<script setup lang="ts">
import type { Opposability } from '~/types/rule'

const props = withDefaults(defineProps<{
  opposability: Opposability
  /** Source officielle qui rend la règle opposable (ex: "arrêté du 12 mars 2024"). */
  source?: string
  /** Affichage compact en une ligne (badge + libellé court). */
  compact?: boolean
}>(), {
  source: undefined,
  compact: false,
})

const isOpposable = computed(() => props.opposability === 'opposable')

const alertClass = computed(() =>
  isOpposable.value ? 'fr-alert fr-alert--info' : 'fr-alert fr-alert--warning',
)

const title = computed(() =>
  isOpposable.value
    ? 'Règle opposable'
    : 'Règle indicative',
)

const description = computed(() =>
  isOpposable.value
    ? 'Cette modélisation fait foi : un agent ou un usager peut s\u2019en prévaloir.'
    : 'Aide à la lecture du droit. La décision reste prise par l\'administration.',
)
</script>

<template>
  <div
    v-if="compact"
    class="inline-flex items-center gap-2"
    :aria-label="title"
  >
    <span
      class="fr-badge fr-badge--sm"
      :class="isOpposable ? 'fr-badge--green-emeraude' : 'fr-badge--yellow-tournesol'"
    >
      {{ isOpposable ? 'Opposable' : 'Indicatif' }}
    </span>
    <span
      v-if="source"
      class="text-sm text-gray-600"
    >- {{ source }}</span>
  </div>

  <div
    v-else
    :class="alertClass"
    role="status"
  >
    <h3 class="fr-alert__title">
      {{ title }}
    </h3>
    <p>{{ description }}</p>
    <p
      v-if="source"
      class="text-sm"
    >
      <strong>Source :</strong> {{ source }}
    </p>
  </div>
</template>
