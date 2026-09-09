<script setup lang="ts">
import type { RuleNature } from '~/types'
import { ruleNatureMeta } from '~/utils/rule-fiche'

const props = defineProps<{
  nature: RuleNature
  withMeaning?: boolean
}>()

const { t } = useI18n()
const meta = computed(() => ruleNatureMeta(props.nature))
</script>

<template>
  <span
    class="fr-badge fr-badge--sm"
    :class="meta.badgeClass"
    :title="withMeaning ? t(meta.meaningKey) : undefined"
  >
    {{ $t(meta.labelKey) }}
  </span>
</template>
