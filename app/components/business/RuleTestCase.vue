<script setup lang="ts">
/**
 * Carte d'un cas de test attaché à une règle (traçabilité juridique).
 * Présente inputs, résultat attendu, source (administration / communauté),
 * statut (validé / en revue / échec).
 */
import type { RuleTest } from '~/types/rule-test'

const props = defineProps<{ test: RuleTest }>()

const statusBadge = computed(() => {
  switch (props.test.status) {
    case 'valide':
      return { label: 'Validé', cls: 'fr-badge--success' }
    case 'en_revue':
      return { label: 'En revue', cls: 'fr-badge--new' }
    case 'echec':
      return { label: 'En échec', cls: 'fr-badge--error' }
    default:
      return { label: 'Statut inconnu', cls: 'fr-badge--grey' }
  }
})

const sourceLabel = computed(() => {
  switch (props.test.source) {
    case 'administration':
      return 'Administration'
    case 'communaute':
      return 'Communauté'
    case 'jurisprudence':
      return 'Jurisprudence'
    default:
      return 'Source inconnue'
  }
})

const expectedDisplay = computed(() => {
  const e = props.test.expected
  if (typeof e === 'boolean')
    return e ? 'éligible' : 'non éligible'
  if (e === null)
    return '∅'
  return props.test.expectedUnit ? `${e} ${props.test.expectedUnit}` : String(e)
})
</script>

<template>
  <article class="fr-card">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <div class="flex flex-wrap items-center gap-2 mb-2">
          <span
            class="fr-badge fr-badge--sm"
            :class="statusBadge.cls"
          >
            {{ statusBadge.label }}
          </span>
          <span class="fr-tag fr-tag--sm">{{ sourceLabel }}</span>
        </div>
        <h3 class="fr-card__title fr-h6 m-0">
          {{ test.label }}
        </h3>
        <p class="fr-card__desc text-sm text-gray-700 mt-2">
          {{ test.scenario }}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0 mb-1">
              Entrées
            </p>
            <ul class="list-none p-0 m-0 text-sm">
              <li
                v-for="(value, key) in test.inputs"
                :key="key"
              >
                <code class="font-mono">{{ key }}</code> : {{ value }}
              </li>
            </ul>
          </div>
          <div>
            <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0 mb-1">
              Résultat attendu
            </p>
            <p class="text-lg font-semibold text-blue-900 m-0">
              {{ expectedDisplay }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
