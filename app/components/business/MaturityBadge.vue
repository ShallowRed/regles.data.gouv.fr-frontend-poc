<script setup lang="ts">
import type { MaturityLevel } from '~/types/rule'

const props = withDefaults(defineProps<{
  level: MaturityLevel
  /** Affiche le sens du niveau à côté du badge. */
  withMeaning?: boolean
}>(), {
  withMeaning: false,
})

const { t } = useI18n()
const meta = computed(() => maturityMeta(props.level))
const meaning = computed(() => t(meta.value.meaningKey))
</script>

<template>
  <span class="inline-flex items-center gap-2">
    <span
      class="fr-badge fr-badge--sm"
      :class="meta.badgeClass"
      :title="meaning"
    >
      {{ $t(meta.labelKey) }}
    </span>
    <span
      v-if="withMeaning"
      class="fr-text--xs text-gray-600"
    >{{ meaning }}</span>
  </span>
</template>
