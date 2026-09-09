<script setup lang="ts">
import type { RuleEngine } from '~/types/rule'

const props = defineProps<{
  engine: RuleEngine
}>()

const meta = computed(() => {
  switch (props.engine) {
    case 'publicodes':
      return { key: 'engine.publicodes', cls: 'fr-tag--blue-france' }
    case 'openfisca':
      return { key: 'engine.openfisca', cls: 'fr-tag--green-bourgeon' }
    case 'catala':
      return { key: 'engine.catala', cls: 'fr-tag--brown-caramel' }
    case 'proprietaire':
      return { key: 'engine.proprietaire', cls: 'fr-tag--pink-tuile' }
    case 'autre':
      return { key: 'engine.autre', cls: 'fr-tag--grey' }
    default:
      return { key: 'engine.inconnu', cls: 'fr-tag--grey' }
  }
})
</script>

<template>
  <span
    class="fr-tag fr-tag--sm"
    :class="meta.cls"
  >
    {{ $t(meta.key) }}
  </span>
</template>
