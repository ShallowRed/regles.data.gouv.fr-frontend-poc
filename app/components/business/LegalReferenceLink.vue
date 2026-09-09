<script setup lang="ts">
import type { LegalReference } from '~/types/legal-reference'

const props = withDefaults(defineProps<{
  reference: LegalReference
  /** Affiche la nature (loi, décret...) sous forme de tag DSFR à gauche du libellé. */
  showKind?: boolean
}>(), {
  showKind: true,
})

const kindKey = computed(() => {
  switch (props.reference.kind) {
    case 'loi': return 'legalKind.loi'
    case 'decret': return 'legalKind.decret'
    case 'arrete': return 'legalKind.arrete'
    case 'circulaire': return 'legalKind.circulaire'
    case 'code': return 'legalKind.code'
    default: return null
  }
})

const href = computed(() => {
  if (props.reference.eli)
    return props.reference.eli
  return null
})
</script>

<template>
  <span class="inline-flex flex-wrap items-baseline gap-2 pb-2">
    <span
      v-if="showKind && kindKey"
      class="fr-tag fr-tag--sm"
    >
      {{ $t(kindKey) }}
    </span>

    <a
      v-if="href"
      :href="href"
      target="_blank"
      rel="noopener"
      class="fr-link fr-icon-external-link-line fr-link--sm fr-link--icon-right "
    >
      {{ reference.label }}
    </a>
    <span
      v-else
      class="text-gray-700"
    >{{ reference.label }}</span>
  </span>
</template>
