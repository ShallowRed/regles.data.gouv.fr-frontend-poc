<script setup lang="ts">
import type { JsonSchema } from '@jsonforms/core'
import { DsfrAlert, DsfrButton } from '@gouvminint/vue-dsfr'
import { JsonForms } from '@jsonforms/vue'
import { createAjv2020, dsfrI18n, dsfrRenderers } from '@shallowred/jsonforms-vue-dsfr'
import { computed, onMounted, ref } from 'vue'
import '@shallowred/jsonforms-vue-dsfr/styles'

interface PublicAlgorithm {
  input_schema: JsonSchema
  output_schema?: JsonSchema
}

const props = defineProps<{
  // identifier of the rule in the registry, also its identifier in the calculation service
  rule: string
  // base address of the calculation service
  service: string
}>()

const algorithm = ref<PublicAlgorithm | null>(null)
const unavailable = ref(false)

onMounted(async () => {
  try {
    const response = await fetch(`${props.service}/public/catalog/${props.rule}`)
    if (!response.ok) {
      throw new Error(String(response.status))
    }
    algorithm.value = await response.json()
  }
  catch {
    unavailable.value = true
  }
})

const ajv = createAjv2020()
const answers = ref<Record<string, unknown>>({})
const invalid = ref(false)
const validationMode = ref<'ValidateAndHide' | 'ValidateAndShow'>('ValidateAndHide')

function onChange(event: { data: Record<string, unknown>, errors?: unknown[] }) {
  answers.value = event.data
  invalid.value = (event.errors?.length ?? 0) > 0
}

const output = ref<Record<string, unknown> | null>(null)
const executionError = ref<string | null>(null)
const pending = ref(false)

async function execute() {
  validationMode.value = 'ValidateAndShow'
  if (invalid.value) {
    return
  }
  pending.value = true
  executionError.value = null
  try {
    const response = await fetch(`${props.service}/public/execute/${props.rule}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers.value),
    })
    const result: { status: string, output?: Record<string, unknown>, error?: string } = await response.json()
    if (result.status !== 'success' || !result.output) {
      throw new Error(result.error ?? 'Le calcul a échoué.')
    }
    output.value = result.output
  }
  catch (error) {
    output.value = null
    executionError.value = error instanceof Error ? error.message : String(error)
  }
  finally {
    pending.value = false
  }
}

// The output schema names the values worth showing and gives their labels
const results = computed(() => {
  const properties = algorithm.value?.output_schema?.properties ?? {}
  return Object.entries(properties)
    .filter(([name, schema]) => schema.title && output.value?.[name] !== undefined)
    .map(([name, schema]) => ({ label: schema.title!, value: formatValue(output.value![name]) }))
})

function formatValue(value: unknown): string {
  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non'
  }
  if (typeof value === 'number') {
    return value.toLocaleString('fr-FR')
  }
  return String(value)
}
</script>

<template>
  <div>
    <DsfrAlert
      v-if="unavailable"
      type="error"
      title="Service de calcul indisponible"
      description="Le service qui exécute cette règle ne répond pas. Réessayez plus tard."
    />
    <form
      v-else-if="algorithm"
      novalidate
      @submit.prevent="execute"
    >
      <JsonForms
        :data="answers"
        :schema="algorithm.input_schema"
        :renderers="dsfrRenderers"
        :ajv="ajv"
        :i18n="dsfrI18n"
        :validation-mode="validationMode"
        @change="onChange"
      />
      <div class="fr-mt-4w">
        <DsfrButton
          type="submit"
          label="Calculer"
          :disabled="pending"
        />
      </div>
    </form>
    <div
      v-if="output"
      class="fr-callout fr-mt-4w"
    >
      <h3 class="fr-callout__title">
        Résultat
      </h3>
      <dl class="fr-callout__text results">
        <template
          v-for="result in results"
          :key="result.label"
        >
          <dt>{{ result.label }}</dt>
          <dd class="fr-text--bold">
            {{ result.value }}
          </dd>
        </template>
      </dl>
    </div>
    <DsfrAlert
      v-if="executionError"
      class="fr-mt-4w"
      type="error"
      title="Le calcul n'a pas abouti"
      :description="executionError"
    />
  </div>
</template>

<style scoped>
.results dd {
  margin: 0 0 1rem;
}
</style>
