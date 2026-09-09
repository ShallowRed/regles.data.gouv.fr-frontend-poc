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

const { t } = useI18n()

const isOpposable = computed(() => props.opposability === 'opposable')

const alertClass = computed(() =>
  isOpposable.value ? 'fr-alert fr-alert--info' : 'fr-alert fr-alert--warning',
)

const title = computed(() =>
  t(isOpposable.value ? 'opposability.bindingTitle' : 'opposability.indicativeTitle'),
)

const description = computed(() =>
  t(isOpposable.value ? 'opposability.bindingText' : 'opposability.indicativeText'),
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
      {{ isOpposable ? $t('opposability.bindingBadge') : $t('opposability.indicativeBadge') }}
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
      <strong>{{ $t('opposability.source') }}</strong> {{ source }}
    </p>
  </div>
</template>
