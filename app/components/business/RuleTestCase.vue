<script setup lang="ts">
/**
 * Carte d'un cas de test attaché à une règle.
 *
 * Composition : titre + statut en tête, données (entrées / résultat attendu)
 * dans un panneau, provenance condensée en pied de carte sur une ligne.
 */
import type { RuleTest } from '~/types/rule-test'
import type { EarlAssertion } from '~/utils/verification'

const props = defineProps<{
  test: RuleTest
  /** Assertion EARL du registre pour ce cas (pnpm verify:rules), quand il l'a exécuté. */
  assertion?: EarlAssertion
}>()

const { t } = useI18n()
const { formatLong } = useLocaleDate()

const autoCheck = computed(() => {
  const a = props.assertion
  if (!a)
    return null
  const result = a['earl:result']
  return { conforme: result['earl:outcome'] === 'earl:passed', checkedAt: result['dct:date'], got: result['earl:info'] }
})

const badge = computed(() => {
  if (autoCheck.value) {
    return autoCheck.value.conforme
      ? { key: 'testCase.conform', cls: 'fr-badge--success' }
      : { key: 'testCase.gap', cls: 'fr-badge--error' }
  }
  switch (props.test.status) {
    case 'valid':
      return { key: 'testCase.valid', cls: 'fr-badge--success' }
    case 'pending':
      return { key: 'testCase.inReview', cls: 'fr-badge--new' }
    case 'failing':
      return { key: 'testCase.failed', cls: 'fr-badge--error' }
    default:
      return { key: 'testCase.unknown', cls: 'fr-badge--grey' }
  }
})

const hasFlatProjection = computed(() =>
  props.test.inputs !== undefined || props.test.expected !== undefined,
)

/** Valeur d'entrée scalaire ou structurée (forme native du moteur). */
function formatData(value: unknown): string {
  if (value !== null && typeof value === 'object')
    return JSON.stringify(value, null, 1).replace(/\n\s*/g, ' ')
  return String(value)
}

const expectedIsStructured = computed(() =>
  props.test.expected !== null && typeof props.test.expected === 'object',
)

const expectedDisplay = computed(() => {
  const e = props.test.expected
  if (typeof e === 'boolean')
    return t(e ? 'testCase.eligible' : 'testCase.notEligible')
  if (e === null || e === undefined)
    return '∅'
  if (typeof e === 'object')
    return JSON.stringify(e, null, 2)
  return props.test.expectedUnit ? `${e} ${props.test.expectedUnit}` : String(e)
})

/** Provenance condensée du pied de carte, séparée par « · ». */
const metaItems = computed(() => {
  const test = props.test
  const items: string[] = []
  if (autoCheck.value?.conforme)
    items.push(t('testCase.checkedOn', { date: formatLong(autoCheck.value.checkedAt) }))
  if (test.validatedBy) {
    items.push(test.validatedAt
      ? t('testCase.validatedByOn', { who: test.validatedBy, date: formatLong(test.validatedAt) })
      : t('testCase.validatedBy', { who: test.validatedBy }))
  }
  if (test.period)
    items.push(t('testCase.period', { period: test.period }))
  if (test.engineVersion)
    items.push(t('testCase.engineVersion', { version: test.engineVersion }))
  if (test.realCaseSource)
    items.push(t('testCase.realCase', { source: test.realCaseSource }))
  if (test.legalAnchor)
    items.push(t('testCase.legalAnchor', { anchor: test.legalAnchor }))
  return items
})
</script>

<template>
  <article class="rounded-lg border border-gray-200 bg-white p-5 md:p-6">
    <header class="flex items-start justify-between gap-4">
      <div class="min-w-0 space-y-1">
        <h3 class="fr-h6 m-0">
          {{ test.label }}
        </h3>
        <p
          v-if="test.scenario"
          class="fr-text--sm mb-0 text-gray-600 m-0"
        >
          {{ test.scenario }}
        </p>
      </div>
      <span
        class="fr-badge fr-badge--sm shrink-0"
        :class="badge.cls"
      >
        {{ $t(badge.key) }}
      </span>
    </header>

    <p
      v-if="autoCheck && !autoCheck.conforme"
      class="fr-text--sm mb-0 m-0 mt-3 text-[#b34000]"
    >
      {{ $t('testCase.gapDetail', { date: formatLong(autoCheck.checkedAt), got: autoCheck.got ?? '∅' }) }}
    </p>

    <div
      v-if="hasFlatProjection"
      class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 rounded border border-gray-100 bg-gray-50 p-4"
    >
      <div>
        <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0 mb-1">
          {{ $t('testCase.inputs') }}
        </p>
        <ul class="list-none p-0 m-0 text-sm space-y-0.5">
          <li
            v-for="(value, key) in test.inputs"
            :key="key"
          >
            <code class="font-mono">{{ key }}</code> : <span class="break-all">{{ formatData(value) }}</span>
          </li>
        </ul>
      </div>
      <div class="sm:border-l sm:border-gray-200 sm:pl-4">
        <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0 mb-1">
          {{ $t('testCase.expected') }}
        </p>
        <pre
          v-if="expectedIsStructured"
          class="fr-text--xs m-0 whitespace-pre-wrap break-all bg-white border border-gray-200 rounded p-2"
        >{{ expectedDisplay }}</pre>
        <p
          v-else
          class="text-lg font-semibold text-blue-900 m-0"
        >
          {{ expectedDisplay }}
        </p>
      </div>
    </div>

    <p
      v-if="test.notes"
      class="fr-text--xs mb-0 text-gray-500 m-0 mt-3 italic"
    >
      {{ test.notes }}
    </p>

    <footer
      v-if="metaItems.length || test.nativeRef"
      class="mt-4 pt-3 border-t border-gray-100 fr-text--xs text-gray-500 flex flex-wrap items-center gap-x-1.5 gap-y-1"
    >
      <template
        v-for="(item, index) in metaItems"
        :key="item"
      >
        <span
          v-if="index"
          aria-hidden="true"
        >·</span>
        <span>{{ item }}</span>
      </template>
      <template v-if="test.nativeRef">
        <span
          v-if="metaItems.length"
          aria-hidden="true"
        >·</span>
        <NuxtLink
          :to="test.nativeRef"
          :external="true"
          target="_blank"
          rel="noopener"
          class="fr-link fr-text--xs"
        >
          {{ $t('testCase.nativeTest') }}
        </NuxtLink>
      </template>
    </footer>
  </article>
</template>
