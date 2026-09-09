<script setup lang="ts">
/**
 * Calcul de prime d'activité exécuté contre l'API publique OpenFisca France.
 *
 * Régime implémentation rendu exécutable : la fiche ne certifie pas « la règle » dans
 * l'abstrait mais son implémentation openfisca-france. Le calcul est délégué au moteur du
 * producteur (réutilisateur respectueux), et la situation est assemblée depuis le
 * `engineProfile` de la fiche (entités individu/famille/foyer_fiscal/menage, périodes),
 * pas depuis le socle commun de métadonnées.
 */
import { buildPrimeActiviteRequest } from '~/utils/openfisca/build-request'

defineProps<{
  sourceUrl?: string
}>()

const { formatMonthYear } = useLocaleDate()

/** Mois de référence figé (validé contre les paramètres OpenFisca France). */
const TARGET_MONTH = '2025-03'
const targetMonthLabel = computed(() => formatMonthYear(`${TARGET_MONTH}-01`))
/**
 * Instance OpenFisca visée. L'API publique convient au POC ; une instance dédiée
 * (ex. celle d'aides-simplifiées) donnerait davantage de garanties de disponibilité.
 */
const OPENFISCA_API = 'https://api.fr.openfisca.org/latest/calculate'

const salaireMensuel = ref(1000)
const pending = ref(false)
const requestError = ref<string | null>(null)
const ppa = ref<number | null>(null)

async function calculate() {
  pending.value = true
  requestError.value = null
  ppa.value = null
  const request = buildPrimeActiviteRequest(salaireMensuel.value, TARGET_MONTH)
  try {
    const response = await fetch(OPENFISCA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!response.ok)
      throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    ppa.value = data?.familles?.famille_1?.ppa?.[TARGET_MONTH] ?? null
  }
  catch (error) {
    requestError.value = error instanceof Error ? error.message : String(error)
  }
  finally {
    pending.value = false
  }
}

const { locale } = useI18n()
const formattedPpa = computed(() =>
  ppa.value === null
    ? null
    : ppa.value.toLocaleString(locale.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
)
</script>

<template>
  <div class="rounded-lg border border-[#000091]/30 bg-white p-4 md:p-5 space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <p class="fr-badge fr-badge--sm fr-badge--blue-cumulus m-0">
        {{ $t('openfiscaCalculation.badge') }}
      </p>
    </div>

    <div class="flex flex-wrap items-end gap-4">
      <div class="space-y-1">
        <label
          for="of-salaire"
          class="block fr-text--sm mb-0 font-medium text-gray-800"
        >
          {{ $t('openfiscaCalculation.salaryLabel') }}
        </label>
        <p class="fr-text--xs mb-0 text-gray-500 m-0">
          {{ $t('openfiscaCalculation.salaryHint') }}
        </p>
        <input
          id="of-salaire"
          v-model.number="salaireMensuel"
          type="number"
          class="w-48 border border-gray-300 rounded px-3 py-1.5 fr-text--sm"
        >
      </div>
      <button
        type="button"
        class="fr-btn fr-btn--sm"
        :disabled="pending"
        @click="calculate"
      >
        {{ pending ? $t('openfiscaCalculation.pending') : $t('openfiscaCalculation.submit') }}
      </button>
    </div>

    <div
      v-if="formattedPpa !== null"
      class="rounded border border-gray-200 bg-gray-50 p-4 space-y-2"
    >
      <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0">
        {{ $t('openfiscaCalculation.resultLabel', { month: targetMonthLabel }) }}
      </p>
      <p class="text-lg font-semibold text-blue-900 m-0">
        {{ formattedPpa }} €
      </p>
      <p class="fr-text--xs mb-0 text-gray-600 m-0">
        {{ $t('openfiscaCalculation.resultCaption') }}
      </p>
    </div>
    <p
      v-else-if="requestError"
      class="fr-text--sm mb-0 text-[#ce0500] m-0"
    >
      {{ $t('openfiscaCalculation.requestFailed', { error: requestError }) }}
    </p>

    <div
      v-if="sourceUrl"
      class="border-t border-gray-100 pt-3"
    >
      <p class="fr-text--xs mb-0 text-gray-500 m-0">
        {{ $t('openfiscaCalculation.source') }}
        <a
          :href="sourceUrl"
          target="_blank"
          rel="noopener"
          class="fr-link fr-text--xs"
        >openfisca-france</a>
      </p>
    </div>
  </div>
</template>
