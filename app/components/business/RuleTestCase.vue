<script setup lang="ts">
/**
 * Carte d'un cas de test attaché à une règle.
 *
 * Le test natif (format du moteur, lié par `nativeRef`) fait foi ; la carte présente
 * l'enveloppe normée par le catalogue (intention, provenance, validateur, statut) et,
 * quand elle existe, la projection pédagogique plate (inputs / résultat attendu).
 */
import type { RuleTest } from '~/types/rule-test'

const props = defineProps<{
  test: RuleTest
  /** Résultat du dernier rejeu automatique (pnpm verify:rules), adossé à ce cas par testId. */
  verification?: { status: string, got: unknown, checkedAt: string }
}>()

/** Bandeau de vérification automatique, distinct du statut déclaré de l'enveloppe. */
const autoCheck = computed(() => {
  const v = props.verification
  if (!v)
    return null
  const conforme = v.status === 'conforme'
  return {
    conforme,
    label: conforme ? 'Rejoué conforme' : 'Rejeu en échec',
    cls: conforme ? 'fr-badge--success' : 'fr-badge--error',
    detail: conforme
      ? `Rejoué automatiquement le ${v.checkedAt}, résultat conforme au cas.`
      : `Rejoué automatiquement le ${v.checkedAt} : le moteur ne renvoie plus le résultat attendu (obtenu : ${v.got ?? '∅'}).`,
  }
})

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
    return e ? 'éligible' : 'non éligible'
  if (e === null || e === undefined)
    return '∅'
  if (typeof e === 'object')
    return JSON.stringify(e, null, 2)
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
            :class="autoCheck ? autoCheck.cls : statusBadge.cls"
          >
            {{ autoCheck ? autoCheck.label : statusBadge.label }}
          </span>
        </div>
        <h3 class="fr-card__title fr-h6 m-0">
          {{ test.label }}
        </h3>
        <p class="fr-card__desc text-sm text-gray-700 mt-2">
          {{ test.scenario }}
        </p>

        <div
          v-if="hasFlatProjection"
          class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3"
        >
          <div>
            <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0 mb-1">
              Entrées
            </p>
            <ul class="list-none p-0 m-0 text-sm">
              <li
                v-for="(value, key) in test.inputs"
                :key="key"
              >
                <code class="font-mono">{{ key }}</code> : <span class="break-all">{{ formatData(value) }}</span>
              </li>
            </ul>
          </div>
          <div>
            <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0 mb-1">
              Résultat attendu
            </p>
            <pre
              v-if="expectedIsStructured"
              class="fr-text--xs m-0 whitespace-pre-wrap break-all bg-gray-50 border border-gray-200 rounded p-2"
            >{{ expectedDisplay }}</pre>
            <p
              v-else
              class="text-lg font-semibold text-blue-900 m-0"
            >
              {{ expectedDisplay }}
            </p>
          </div>
        </div>

        <ul class="list-none p-0 mt-3 mb-0 space-y-1 fr-text--xs text-gray-600">
          <li v-if="autoCheck">
            {{ autoCheck.detail }}
          </li>
          <li v-if="test.validatedBy">
            Validé par : {{ test.validatedBy }}<template v-if="test.validatedAt">
              ({{ test.validatedAt }})
            </template>
          </li>
          <li v-if="test.period || test.engineVersion">
            <template v-if="test.period">
              Période législative : {{ test.period }}
            </template>
            <template v-if="test.period && test.engineVersion">
              ·
            </template>
            <template v-if="test.engineVersion">
              Moteur : {{ test.engineVersion }}
            </template>
          </li>
          <li v-if="test.realCaseSource">
            Dossier réel anonymisé : {{ test.realCaseSource }}
          </li>
          <li v-if="test.legalAnchor">
            Texte visé : {{ test.legalAnchor }}
          </li>
          <li v-if="test.nativeRef">
            <NuxtLink
              :to="test.nativeRef"
              :external="true"
              target="_blank"
              rel="noopener"
              class="fr-link fr-text--xs"
            >
              Test natif (dépôt source)
            </NuxtLink>
          </li>
        </ul>

        <p
          v-if="test.notes"
          class="fr-text--xs mb-0 text-gray-500 m-0 mt-2 italic"
        >
          {{ test.notes }}
        </p>
      </div>
    </div>
  </article>
</template>
