<script setup lang="ts">
/**
 * « Essayer cette règle » : formulaire généré automatiquement depuis la fiche
 * metadata.jsonld (paramètres typés) et exécuté contre l'API réelle que la fiche
 * déclare (canal). Démonstration que le format d'échange génère des features :
 * aucun champ ni endpoint n'est codé en dur.
 */
import type { FicheForm } from '~/utils/fiche-form'

const props = defineProps<{
  form: FicheForm
  /** Chemin de la fiche source, affiché pour ancrer la démonstration. */
  sourcePath?: string
}>()

/** Vue caste les input type=number en nombre dans le v-model : le champ peut porter les trois types. */
type FieldValue = string | number | boolean

const values = reactive<Record<string, FieldValue>>({})
for (const param of props.form.params) {
  values[param.id] = param.xsdType === 'boolean'
    ? param.defaultValue === true
    : param.defaultValue !== undefined ? String(param.defaultValue) : ''
}

const pending = ref(false)
const requestError = ref<string | null>(null)
const driftDetected = ref(false)
const result = ref<{ value?: string, explanation?: string } | null>(null)
const calledUrl = ref<string | null>(null)

function inputType(xsdType: string): string {
  return xsdType === 'integer' || xsdType === 'decimal' ? 'number' : 'text'
}

async function run() {
  pending.value = true
  requestError.value = null
  driftDetected.value = false
  result.value = null
  const query = new URLSearchParams()
  for (const param of props.form.params) {
    const value = values[param.id]
    if (param.xsdType === 'boolean') {
      if (value === true)
        query.set(param.id, 'true')
    }
    else if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.set(param.id, String(value).trim())
    }
  }
  const url = `${props.form.endpoint}?${query.toString()}`
  calledUrl.value = url
  try {
    const response = await fetch(url)
    if (response.status === 422) {
      // FastAPI 422 = paramètres refusés : la fiche a dérivé de son API.
      driftDetected.value = true
      return
    }
    if (!response.ok)
      throw new Error(`HTTP ${response.status}`)
    result.value = await response.json()
  }
  catch (error) {
    requestError.value = error instanceof Error ? error.message : String(error)
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="rounded-lg border border-[#000091]/30 bg-white p-4 md:p-5 space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <p class="fr-badge fr-badge--sm fr-badge--green-emeraude m-0">
        Essayer avec vos valeurs
      </p>
      <span class="fr-text--xs mb-0 text-gray-600">
        Formulaire généré depuis la fiche de métadonnées · appel réel à l'API du producteur
      </span>
    </div>

    <form
      class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3"
      @submit.prevent="run"
    >
      <div
        v-for="param in form.params"
        :key="param.id"
        class="space-y-1"
        :class="param.xsdType === 'boolean' ? 'flex items-center gap-2 space-y-0' : ''"
      >
        <template v-if="param.xsdType === 'boolean'">
          <input
            :id="`tryit-${param.id}`"
            v-model="values[param.id]"
            type="checkbox"
            class="h-4 w-4"
          >
          <label
            :for="`tryit-${param.id}`"
            class="fr-text--sm mb-0 text-gray-800"
            :title="param.definition"
          >
            {{ param.label }}
          </label>
        </template>
        <template v-else>
          <label
            :for="`tryit-${param.id}`"
            class="block fr-text--sm mb-0 font-medium text-gray-800"
          >
            {{ param.label }}<span
              v-if="param.required"
              aria-hidden="true"
            > *</span>
          </label>
          <p
            v-if="param.definition"
            class="fr-text--xs mb-0 text-gray-500 m-0"
          >
            {{ param.definition }}
          </p>
          <input
            :id="`tryit-${param.id}`"
            v-model="values[param.id]"
            :type="inputType(param.xsdType)"
            :required="param.required"
            class="w-full border border-gray-300 rounded px-3 py-1.5 fr-text--sm"
          >
        </template>
      </div>

      <div class="sm:col-span-2">
        <button
          type="submit"
          class="fr-btn fr-btn--sm"
          :disabled="pending"
        >
          {{ pending ? 'Calcul en cours…' : 'Calculer via l\'API' }}
        </button>
      </div>
    </form>

    <div
      v-if="result"
      class="rounded border border-gray-200 bg-gray-50 p-4 space-y-2"
    >
      <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0">
        Résultat renvoyé par l'API
      </p>
      <p class="text-lg font-semibold text-blue-900 m-0">
        {{ result.value ?? '(pas de champ value)' }}
      </p>
      <p
        v-if="result.explanation"
        class="fr-text--sm mb-0 text-gray-700 m-0"
      >
        Trace d'explication : <code class="fr-text--xs">{{ result.explanation }}</code>
      </p>
      <p
        v-if="calledUrl"
        class="fr-text--xs mb-0 text-gray-500 m-0 break-all"
      >
        Appel : <code class="fr-text--xs">{{ calledUrl }}</code>
      </p>
    </div>
    <div
      v-else-if="driftDetected"
      class="rounded border border-[#b34000]/30 bg-[#fff4ed] p-4 space-y-1"
    >
      <p class="flex items-center gap-2 fr-text--sm mb-0 font-medium text-[#b34000] m-0">
        <span
          class="fr-icon-alert-line fr-icon--sm"
          aria-hidden="true"
        />
        Dérive détectée entre la fiche et l'API
      </p>
      <p class="fr-text--sm mb-0 text-gray-700 m-0">
        L'API du producteur a refusé les paramètres décrits par la fiche. Son schéma a changé
        depuis le référencement&nbsp;: la fiche doit être mise à jour. Ce formulaire, généré
        depuis la fiche, rend l'écart visible plutôt que de renvoyer un résultat faux.
      </p>
    </div>
    <p
      v-else-if="requestError"
      class="fr-text--sm mb-0 text-[#ce0500] m-0"
    >
      L'appel à l'API a échoué ({{ requestError }}). L'API du producteur est peut-être indisponible.
    </p>

    <p
      v-if="sourcePath"
      class="fr-text--xs mb-0 text-gray-500 m-0"
    >
      Champs, types et endpoint proviennent intégralement de <code class="fr-text--xs">{{ sourcePath }}</code>.
    </p>
  </div>
</template>
