<script setup lang="ts">
import type { RuleEngine } from '~/types/rule'

const props = defineProps<{
  engine: RuleEngine
}>()

const meta = computed(() => {
  switch (props.engine) {
    case 'publicodes':
      return { label: 'Publicodes', cls: 'fr-tag--blue-france' }
    case 'openfisca':
      return { label: 'OpenFisca', cls: 'fr-tag--green-bourgeon' }
    case 'catala':
      return { label: 'Catala', cls: 'fr-tag--brown-caramel' }
    case 'proprietaire':
      return { label: 'Moteur proprietaire', cls: 'fr-tag--pink-tuile' }
    case 'autre':
      return { label: 'Autre moteur', cls: 'fr-tag--grey' }
    default:
      return { label: 'Moteur inconnu', cls: 'fr-tag--grey' }
  }
})
</script>

<template>
  <span
    class="fr-tag fr-tag--sm"
    :class="meta.cls"
  >
    {{ meta.label }}
  </span>
</template>
