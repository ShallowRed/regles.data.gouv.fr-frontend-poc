<script setup lang="ts">
/**
 * Aperçu de calcul exécuté en direct pour la règle entreprise-innovation :
 * le moteur Publicodes charge les fichiers de règles réels (vendorés à un
 * commit épinglé) et évalue « cir . montant » dans la page, sans serveur.
 *
 * Situation d'exemple : entreprise industrielle au régime réel. Les montants
 * de dépenses sont éditables et recalculés à chaque frappe. Les noms de
 * variables viennent des fichiers .publicodes eux-mêmes (aucune valeur
 * fabriquée) : natureActivite . industrielle, regimeFiscal, typeImposition,
 * cir . depensesMetropole, cir . depensesDom.
 */
import type { ExplanationNode } from '~/components/business/RuleSimulationPreview.vue'
import type { Opposability } from '~/types/rule'

defineProps<{
  opposability: Opposability
  source?: string
}>()

const { evaluate, rulesMeta } = usePublicodesEngine()

/** Dépenses de recherche éligibles, éditables (assiette du crédit d'impôt). */
const depensesMetropole = ref(500000)
const depensesDom = ref(0)

function sanitize(n: number): number {
  return Number.isFinite(n) && n >= 0 ? n : 0
}

/** Situation d'exemple : entreprise industrielle au régime réel (variables réelles du dépôt). */
const situation = computed(() => ({
  'natureActivite . industrielle': 'oui',
  'regimeFiscal': '\'reel-normal\'',
  'typeImposition': '\'is\'',
  'cir . depensesMetropole': sanitize(depensesMetropole.value),
  'cir . depensesDom': sanitize(depensesDom.value),
}))

const evaluation = computed(() => evaluate(situation.value, [
  'cir . eligibilite',
  'cir . creditMetropole',
  'cir . creditDom',
  'cir . montant',
]))

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

function formatEuros(value: unknown): string {
  return typeof value === 'number' ? euros.format(value) : '—'
}

const result = computed(() => ({
  value: formatEuros(evaluation.value?.['cir . montant']?.value),
  label: 'Crédit d\'impôt recherche',
}))

/** Arbre d'explicabilité construit depuis les valeurs réellement évaluées. */
const explanation = computed<ExplanationNode[]>(() => {
  const e = evaluation.value
  if (!e)
    return []
  const nodes: ExplanationNode[] = [
    {
      label: 'Éligibilité au CIR',
      value: e['cir . eligibilite']?.value === true ? 'Oui' : 'Non',
      source: 'cir.publicodes : « cir . eligibilite » (activité commerciale, industrielle ou agricole au régime réel)',
    },
    {
      label: 'Crédit métropole : barème 30 % jusqu\'à 100 M€, puis 5 %',
      value: formatEuros(e['cir . creditMetropole']?.value),
      source: 'cir.publicodes : « cir . creditMetropole » (CGI art. 244 quater B)',
    },
  ]
  if (sanitize(depensesDom.value) > 0) {
    nodes.push({
      label: 'Crédit outre-mer : barème 50 % jusqu\'à 100 M€, puis 5 %',
      value: formatEuros(e['cir . creditDom']?.value),
      source: 'cir.publicodes : « cir . creditDom » (CGI art. 244 quater B)',
    })
  }
  return nodes
})
</script>

<template>
  <div class="space-y-6">
    <!-- Provenance du calcul : moteur exécuté dans la page, règles épinglées -->
    <div class="flex flex-wrap items-center gap-2">
      <p class="fr-badge fr-badge--sm fr-badge--green-emeraude m-0">
        <span
          class="fr-icon-flashlight-line fr-icon--xs mr-1"
          aria-hidden="true"
        />
        Calculé dans votre navigateur
      </p>
      <p class="fr-text--xs mb-0 text-gray-600 m-0">
        Règles
        <a
          :href="`${rulesMeta.repoUrl}/tree/${rulesMeta.sha}`"
          target="_blank"
          rel="noopener"
          class="fr-link fr-text--xs"
        >{{ rulesMeta.repo }}</a>
        à la version <code class="fr-text--xs bg-gray-100 px-1 py-0.5 rounded">{{ rulesMeta.shortSha }}</code>
      </p>
    </div>

    <template v-if="evaluation">
      <!-- Situation d'exemple : champs de dépenses éditables, recalcul immédiat -->
      <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 md:p-5">
        <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0 mb-3">
          Situation d'exemple — modifiez les dépenses pour recalculer
        </p>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-24 gap-y-2 m-0 p-0 mb-4">
          <div class="flex justify-between gap-3 border-b border-gray-200 pb-1.5">
            <dt class="fr-text--sm mb-0 text-gray-600">
              Nature de l'activité
            </dt>
            <dd class="fr-text--sm mb-0 font-medium text-gray-900 m-0 text-right">
              Industrielle (régime réel)
            </dd>
          </div>
          <div class="flex justify-between gap-3 border-b border-gray-200 pb-1.5">
            <dt class="fr-text--sm mb-0 text-gray-600">
              Type d'imposition
            </dt>
            <dd class="fr-text--sm mb-0 font-medium text-gray-900 m-0 text-right">
              Impôt sur les sociétés
            </dd>
          </div>
        </dl>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="fr-input-group m-0">
            <label
              class="fr-label"
              for="live-depenses-metropole"
            >
              Dépenses de recherche éligibles (métropole)
              <span class="fr-hint-text">Variable « cir . depensesMetropole », en euros</span>
            </label>
            <input
              id="live-depenses-metropole"
              v-model.number="depensesMetropole"
              class="fr-input"
              type="number"
              min="0"
              step="10000"
            >
          </div>
          <div class="fr-input-group m-0">
            <label
              class="fr-label"
              for="live-depenses-dom"
            >
              Dépenses de recherche éligibles (outre-mer)
              <span class="fr-hint-text">Variable « cir . depensesDom », en euros</span>
            </label>
            <input
              id="live-depenses-dom"
              v-model.number="depensesDom"
              class="fr-input"
              type="number"
              min="0"
              step="10000"
            >
          </div>
        </div>
      </div>

      <!-- Résultat + explicabilité : même mise en page que les aperçus pré-calculés -->
      <RuleSimulationPreview
        :result="result"
        :opposability="opposability"
        :source="source"
        :explanation="explanation"
      />
    </template>

    <!-- Dégradation : le moteur n'a pas pu s'instancier ou évaluer -->
    <div
      v-else
      class="rounded-lg border border-gray-200 bg-white p-6 space-y-1.5"
    >
      <h3 class="fr-h6 m-0">
        Calcul indisponible
      </h3>
      <p class="fr-text--sm mb-0 text-gray-700 m-0 max-w-2xl">
        Le moteur Publicodes n'a pas pu évaluer la règle dans cette page.
        Le code source complet reste consultable sur
        <a
          :href="rulesMeta.repoUrl"
          target="_blank"
          rel="noopener"
          class="fr-link fr-text--sm"
        >{{ rulesMeta.repo }}</a>.
      </p>
    </div>
  </div>
</template>
