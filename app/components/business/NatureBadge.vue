<script setup lang="ts">
import type { RuleNature } from '~/types'
import { ruleNatureMeta } from '~/utils/rule-fiche'

const props = defineProps<{
  nature: RuleNature
  withMeaning?: boolean
}>()

const meta = computed(() => ruleNatureMeta(props.nature))
</script>

<template>
  <span
    class="fr-badge fr-badge--sm"
    :class="meta.badgeClass"
    :title="withMeaning ? meta.meaning : undefined"
  >
    {{ meta.label }}
  </span>
</template>
