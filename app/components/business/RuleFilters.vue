<script setup lang="ts">
import type { MaturityLevel, RuleDomain, RuleEngine, RuleNature } from '~/types/rule'

export interface RuleFiltersState {
  search: string
  domain: RuleDomain | null
  organismId: string | null
  maturity: MaturityLevel | null
  engine: RuleEngine | null
  nature: RuleNature | null
}

/** Décompte d'occurrences par valeur de facette, fourni par la page parente. */
export interface FacetCounts {
  domain: Partial<Record<RuleDomain, number>>
  organism: Record<string, { label: string, count: number }>
  maturity: Partial<Record<MaturityLevel, number>>
  engine: Partial<Record<RuleEngine, number>>
  nature: Partial<Record<RuleNature, number>>
}

const props = defineProps<{ facets: FacetCounts }>()

const state = defineModel<RuleFiltersState>({ required: true })

const engineLabel: Record<RuleEngine, string> = {
  publicodes: 'Publicodes',
  openfisca: 'OpenFisca',
  catala: 'Catala',
  proprietaire: 'Moteur propriétaire',
  autre: 'Autre moteur',
}

const natureLabel: Record<RuleNature, string> = {
  ouverte: 'Ouverte',
  hybride: 'Hybride',
  fermee: 'Fermée',
}

/** Organismes présents dans le catalogue, triés par volume décroissant. */
const organismOptions = computed(() =>
  Object.entries(props.facets.organism)
    .map(([id, v]) => ({ id, label: v.label, count: v.count }))
    .sort((a, b) => b.count - a.count),
)

function toggle<K extends keyof RuleFiltersState>(key: K, value: RuleFiltersState[K]) {
  state.value = {
    ...state.value,
    [key]: state.value[key] === value ? null : value,
  }
}

const activeCount = computed(() => {
  let n = 0
  if (state.value.search)
    n++
  if (state.value.domain)
    n++
  if (state.value.organismId)
    n++
  if (state.value.maturity)
    n++
  if (state.value.engine)
    n++
  if (state.value.nature)
    n++
  return n
})

function reset() {
  state.value = {
    search: '',
    domain: null,
    organismId: null,
    maturity: null,
    engine: null,
    nature: null,
  }
}
</script>

<template>
  <aside
    aria-label="Filtres de recherche"
    class="space-y-5 pl-1 pr-4"
  >
    <!-- Recherche -->
    <div role="search">
      <label
        class="fr-label fr-text--bold !mb-1.5"
        for="rule-search"
      >Rechercher</label>
      <div class="fr-search-bar">
        <input
          id="rule-search"
          v-model="state.search"
          class="fr-input"
          type="search"
          placeholder="Mot-clé, organisme…"
        >
        <button
          type="submit"
          class="fr-btn"
          title="Rechercher"
        >
          Rechercher
        </button>
      </div>
    </div>

    <!-- En-tête filtres + reset -->
    <div class="flex items-center justify-between border-b border-gray-200">
      <h2 class="fr-text--sm font-bold uppercase tracking-wide text-gray-700 m-0">
        Affiner
      </h2>
      <button
        v-if="activeCount > 0"
        type="button"
        class="fr-link fr-link--sm"
        @click="reset"
      >
        Tout effacer ({{ activeCount }})
      </button>
    </div>

    <div class="divide-y divide-gray-200 -mt-3">
      <!-- Domaine -->
      <div class="py-0">
        <FilterFacet
          legend="Domaine"
          :options="domainScale.map(d => ({ value: d.domain, label: d.label, icon: d.icon, count: facets.domain[d.domain] ?? 0 }))"
          :selected="state.domain"
          @toggle="(v) => toggle('domain', v as RuleDomain)"
        />
      </div>

      <!-- Ce que la règle permet (maturité) -->
      <div class="py-3">
        <FilterFacet
          legend="Ce que la règle permet"
          help="De la simple référence à l'exécution du calcul."
          :options="maturityScale.map(m => ({ value: m.level, label: m.label, count: facets.maturity[m.level] ?? 0, hint: m.meaning }))"
          :selected="state.maturity"
          @toggle="(v) => toggle('maturity', v as MaturityLevel)"
        />
      </div>

      <!-- Nature de publication -->
      <div class="py-3">
        <FilterFacet
          legend="Nature de publication"
          :options="(['ouverte', 'hybride', 'fermee'] as RuleNature[]).map(n => ({ value: n, label: natureLabel[n], count: facets.nature[n] ?? 0 }))"
          :selected="state.nature"
          @toggle="(v) => toggle('nature', v as RuleNature)"
        />
      </div>

      <!-- Organisme producteur -->
      <div class="py-3">
        <FilterFacet
          legend="Organisme producteur"
          :options="organismOptions.map(o => ({ value: o.id, label: o.label, count: o.count }))"
          :selected="state.organismId"
          :max-visible="6"
          @toggle="(v) => toggle('organismId', v as string)"
        />
      </div>

      <!-- Moteur de calcul : replié par défaut (info technique) -->
      <div class="py-3">
        <FilterFacet
          legend="Moteur de calcul"
          collapsed-by-default
          :options="(Object.keys(engineLabel) as RuleEngine[]).map(e => ({ value: e, label: engineLabel[e], count: facets.engine[e] ?? 0 }))"
          :selected="state.engine"
          @toggle="(v) => toggle('engine', v as RuleEngine)"
        />
      </div>
    </div>
  </aside>
</template>
