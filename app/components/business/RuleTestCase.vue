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

const sourceLabel = computed(() => {
  switch (props.test.source) {
    case 'administration':
      return 'Administration'
    case 'communaute':
      return 'Communauté'
    case 'jurisprudence':
      return 'Jurisprudence'
    case 'circulaire':
      return 'Circulaire'
    case 'cas-reel-anonymise':
      return 'Cas réel anonymisé'
    default:
      return 'Source inconnue'
  }
})

const nativeFormatLabel = computed(() => {
  switch (props.test.nativeFormat) {
    case 'openfisca-yaml':
      return 'YAML OpenFisca'
    case 'publicodes-yaml':
      return 'YAML Publicodes'
    case 'catala-assert':
      return 'Assertions Catala'
    case 'pytest':
      return 'pytest'
    default:
      return props.test.nativeFormat
  }
})

const hasFlatProjection = computed(() =>
  props.test.inputs !== undefined || props.test.expected !== undefined,
)

const expectedDisplay = computed(() => {
  const e = props.test.expected
  if (typeof e === 'boolean')
    return e ? 'éligible' : 'non éligible'
  if (e === null || e === undefined)
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
          <span
            v-if="nativeFormatLabel"
            class="fr-tag fr-tag--sm"
          >{{ nativeFormatLabel }}</span>
        </div>
        <h3 class="fr-card__title fr-h6 m-0">
          {{ test.label }}
        </h3>
        <p class="fr-card__desc text-sm text-gray-700 mt-2">
          {{ test.scenario }}
        </p>

        <div
          v-if="autoCheck"
          class="flex flex-wrap items-center gap-2 mt-3 rounded border p-2"
          :class="autoCheck.conforme ? 'border-[#18753c]/30 bg-[#dffee6]/40' : 'border-[#b34000]/30 bg-[#fff4ed]'"
        >
          <span
            class="fr-badge fr-badge--sm"
            :class="autoCheck.cls"
          >{{ autoCheck.label }}</span>
          <span class="fr-text--xs mb-0 text-gray-700">{{ autoCheck.detail }}</span>
        </div>

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

        <ul class="list-none p-0 mt-3 mb-0 space-y-1 fr-text--xs text-gray-600">
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
              Test natif qui fait foi (dépôt source)
            </NuxtLink>
          </li>
        </ul>

        <ul
          v-if="test.tags?.length"
          class="flex flex-wrap gap-1 list-none p-0 mt-2 mb-0"
        >
          <li
            v-for="tag in test.tags"
            :key="tag"
          >
            <span class="fr-tag fr-tag--sm">{{ tag }}</span>
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
