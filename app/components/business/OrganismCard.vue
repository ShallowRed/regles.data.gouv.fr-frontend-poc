<script setup lang="ts">
import type { Organism } from '~/types/organism'

withDefaults(defineProps<{
  organism: Organism
  /** Nombre de règles publiées (optionnel, sera typiquement calculé par la vue parente). */
  ruleCount?: number
  /** Variante visuelle : carte complète (par défaut) ou ligne dense. */
  variant?: 'card' | 'inline'
}>(), {
  ruleCount: undefined,
  variant: 'card',
})
</script>

<template>
  <article
    v-if="variant === 'card'"
    class="fr-card fr-enlarge-link border border-gray-200 hover:border-blue-700"
    :aria-labelledby="`organism-${organism.id}-title`"
  >
    <div class="fr-card__body">
      <div class="fr-card__content">
        <div class="flex items-center gap-2 mb-2">
          <span
            class="fr-icon-bank-line"
            aria-hidden="true"
          />
          <span
            v-if="organism.acronym"
            class="fr-badge fr-badge--sm fr-badge--blue-cumulus"
          >
            {{ organism.acronym }}
          </span>
        </div>

        <h3
          :id="`organism-${organism.id}-title`"
          class="fr-card__title"
        >
          <a
            v-if="organism.url"
            :href="organism.url"
            target="_blank"
            rel="noopener"
          >
            {{ organism.name }}
          </a>
          <span v-else>{{ organism.name }}</span>
        </h3>

        <p
          v-if="ruleCount !== undefined"
          class="fr-card__desc"
        >
          {{ ruleCount }} règle{{ ruleCount > 1 ? 's' : '' }} publiée{{ ruleCount > 1 ? 's' : '' }}
        </p>
      </div>
    </div>
  </article>

  <span
    v-else
    class="inline-flex items-center gap-2 text-sm"
  >
    <span
      class="fr-icon-bank-line"
      aria-hidden="true"
    />
    <a
      v-if="organism.url"
      :href="organism.url"
      target="_blank"
      rel="noopener"
      class="fr-link"
    >
      {{ organism.acronym ?? organism.name }}
    </a>
    <span v-else>{{ organism.acronym ?? organism.name }}</span>
  </span>
</template>
