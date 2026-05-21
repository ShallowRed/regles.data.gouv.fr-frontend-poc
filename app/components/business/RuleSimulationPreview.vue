<script setup lang="ts">
/**
 * Aperçu de calcul d'une règle exécutable (N3).
 * Affiche le résultat, l'unité, le bandeau d'opposabilité doctrinal,
 * et une arborescence d'explicabilité (mockée : nœuds prédéfinis).
 */
import type { Opposability } from '~/types/rule'

export interface ExplanationNode {
  label: string
  value: string
  /** Référence légale ou clé Publicodes éclairant le calcul. */
  source?: string
  children?: ExplanationNode[]
}

defineProps<{
  result: { value: string | number, unit?: string, label: string }
  opposability: Opposability
  source?: string
  explanation?: ExplanationNode[]
  computedAt?: string
}>()
</script>

<template>
  <div class="space-y-12">
    <!-- Résultat principal -->
    <div class="fr-card border-2 border-blue-700">
      <div class="fr-card__body">
        <div class="fr-card__content p-5">
          <p class="fr-text--sm mb-0 text-gray-600 uppercase tracking-wide">
            {{ result.label }}
          </p>
          <p class="text-2xl font-bold text-blue-900 m-0">
            {{ result.value }}<span
              v-if="result.unit"
              class="text-2xl ml-1"
            >{{ result.unit }}</span>
          </p>
          <p
            v-if="computedAt"
            class="fr-text--sm mb-0 text-gray-500 mt-2"
          >
            Calcul effectué le {{ computedAt }}
          </p>
        </div>
      </div>
    </div>

    <!-- Arborescence d'explicabilité -->
    <section
      v-if="explanation?.length"
      aria-labelledby="explanation-title"
    >
      <h3
        id="explanation-title"
        class="fr-h5"
      >
        Comment ce résultat a été calculé
      </h3>
      <ul class="list-none p-0 space-y-4">
        <li
          v-for="(node, i) in explanation"
          :key="i"
          class="border-l-2 ml-4 pl-4 py-1"
        >
          <p class="m-0">
            <strong>{{ node.label }}</strong> :
            <span class="text-blue-900">{{ node.value }}</span>
          </p>
          <p
            v-if="node.source"
            class="fr-text--sm mb-0 text-gray-600 m-0"
          >
            <em>Source : {{ node.source }}</em>
          </p>
          <ul
            v-if="node.children?.length"
            class="list-none p-0 ml-4 mt-1 space-y-1"
          >
            <li
              v-for="(child, j) in node.children"
              :key="j"
              class="border-l-2 border-gray-200 pl-3"
            >
              <p class="m-0 text-sm">
                {{ child.label }} : <span class="text-blue-900">{{ child.value }}</span>
                <span
                  v-if="child.source"
                  class="text-gray-500"
                > - {{ child.source }}</span>
              </p>
            </li>
          </ul>
        </li>
      </ul>
    </section>

    <!-- Bandeau d'opposabilité (doctrinal) -->
    <OpposabilityBanner
      :opposability="opposability"
      :source="source"
    />
  </div>
</template>
