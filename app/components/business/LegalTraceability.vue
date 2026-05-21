<script setup lang="ts">
/**
 * Bloc de traçabilité bidirectionnelle : un extrait de texte légal en face
 * d'un snippet de code (Publicodes / OpenFisca / autre). Composant clé de la vue de traçabilité juridique.
 *
 * Le composant n'effectue aucune analyse : il met côte à côte deux contenus
 * fournis par l'appelant, en signalant clairement leur correspondance.
 */
import type { LegalReference } from '~/types/legal-reference'
import type { RuleEngine } from '~/types/rule'

defineProps<{
  /** Référence légale source (lien ELI affiché si présent). */
  reference: LegalReference
  /** Extrait textuel de l'article (peut être tronqué avec ...). */
  legalExcerpt: string
  /** Numéro / désignation interne (ex : « Art. 2 »). */
  legalAnchor?: string
  /** Code source mappé sur cet article. */
  codeSnippet: string
  /** Moteur du snippet (pour choisir la coloration / lecture). */
  engine: RuleEngine
  /** Étiquette du chemin / variable dans le code (ex : `pass culture . âge éligible`). */
  codeAnchor?: string
}>()

const engineLabel: Record<RuleEngine, string> = {
  publicodes: 'Publicodes',
  openfisca: 'OpenFisca',
  catala: 'Catala',
  proprietaire: 'Moteur proprietaire',
  autre: 'Code',
}
</script>

<template>
  <article class="border border-gray-200 rounded overflow-hidden">
    <header class="bg-gray-50 border-b border-gray-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
      <p class="m-0 fr-text--sm font-semibold">
        {{ reference.label }}<span v-if="legalAnchor"> - {{ legalAnchor }}</span>
      </p>
      <a
        v-if="reference.eli"
        :href="reference.eli"
        target="_blank"
        rel="noopener"
        class="fr-link fr-link--sm"
      >
        Lire sur Légifrance
      </a>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-200">
      <!-- Colonne légale -->
      <div class="p-4 bg-white">
        <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0 mb-2">
          Texte légal
        </p>
        <blockquote class="m-0 italic text-gray-800 border-l-4 border-blue-300 pl-3">
          {{ legalExcerpt }}
        </blockquote>
      </div>

      <!-- Colonne code -->
      <div class="p-4 bg-gray-50">
        <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0 mb-2 flex items-center justify-between">
          <span>{{ engineLabel[engine] }}</span>
          <span
            v-if="codeAnchor"
            class="font-mono text-gray-700 normal-case"
          >
            {{ codeAnchor }}
          </span>
        </p>
        <pre class="m-0 p-3 bg-white border border-gray-200 rounded text-sm overflow-auto"><code>{{ codeSnippet }}</code></pre>
      </div>
    </div>
  </article>
</template>
