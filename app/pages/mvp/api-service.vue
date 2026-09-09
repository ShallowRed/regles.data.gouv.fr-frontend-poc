<script setup lang="ts">
/**
 * Exécution d'une règle dans le registre : l'administration publie son code et un
 * manifeste, le registre l'exécute et expose une API. Contenu statique (extraits de
 * manifeste et d'appels), sans dépendance à un service d'exécution en ligne.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

useHead(() => ({ title: t('apiService.title') }))

const qualifiedTags = [
  {
    axisKey: 'apiService.tagExecutionAxis',
    valueKey: 'apiService.tagExecutionValue',
    tone: 'blue',
    hintKey: 'apiService.tagExecutionHint',
  },
  {
    axisKey: 'apiService.tagLanguagesAxis',
    valueKey: 'apiService.tagLanguagesValue',
    tone: 'neutral',
    hintKey: 'apiService.tagLanguagesHint',
  },
  {
    axisKey: 'apiService.tagAccessAxis',
    valueKey: 'apiService.tagAccessValue',
    tone: 'grey',
    hintKey: 'apiService.tagAccessHint',
  },
] as const

/* --- Les trois lieux d'exécution d'une règle, chacun énoncé sur la fiche --- */
const places = [
  {
    icon: 'fr-icon-bank-line',
    titleKey: 'apiService.place1Title',
    bodyKey: 'apiService.place1Body',
    exampleKey: 'apiService.place1Example',
    to: '/mvp/regles/prestagri?tab=api',
    linkLabelKey: 'apiService.place1Link',
    current: false,
  },
  {
    icon: 'fr-icon-smartphone-line',
    titleKey: 'apiService.place2Title',
    bodyKey: 'apiService.place2Body',
    exampleKey: 'apiService.place2Example',
    to: '/mvp/regles/entreprise-innovation?tab=simulation',
    linkLabelKey: 'apiService.place2Link',
    current: false,
  },
  {
    icon: 'fr-icon-server-line',
    titleKey: 'apiService.place3Title',
    bodyKey: 'apiService.place3Body',
    exampleKey: 'apiService.place3Example',
    to: null,
    linkLabelKey: null,
    current: true,
  },
]

/* --- Le parcours, en quatre temps --- */
const steps = [1, 2, 3, 4].map(num => ({
  num: String(num),
  labelKey: `apiService.step${num}Label`,
  descKey: `apiService.step${num}Desc`,
}))

/* --- Onglets : manifeste, enregistrement, exécution, adaptateurs --- */
type TabKey = 'manifeste' | 'enregistrement' | 'execution' | 'adaptateurs'

const tabs: { key: TabKey, labelKey: string, icon: string }[] = [
  { key: 'manifeste', labelKey: 'apiService.tabManifest', icon: 'fr-icon-file-text-line' },
  { key: 'enregistrement', labelKey: 'apiService.tabRegister', icon: 'fr-icon-upload-2-line' },
  { key: 'execution', labelKey: 'apiService.tabExecute', icon: 'fr-icon-play-line' },
  { key: 'adaptateurs', labelKey: 'apiService.tabAdapters', icon: 'fr-icon-stack-line' },
]

const activeTab = computed<TabKey>(() => {
  const requested = String(route.query.tab ?? 'manifeste')
  return tabs.some(t => t.key === requested) ? requested as TabKey : 'manifeste'
})

const manifestFields = [
  { name: 'id', roleKey: 'apiService.manifestFieldId' },
  { name: 'runtime.language', roleKey: 'apiService.manifestFieldLanguage' },
  { name: 'entrypoint', roleKey: 'apiService.manifestFieldEntrypoint' },
  { name: 'input_schema', roleKey: 'apiService.manifestFieldInputSchema' },
  { name: 'output_schema', roleKey: 'apiService.manifestFieldOutputSchema' },
  { name: 'resources.timeout_seconds', roleKey: 'apiService.manifestFieldTimeout' },
  { name: 'source', roleKey: 'apiService.manifestFieldSource' },
  { name: 'sample_inputs', roleKey: 'apiService.manifestFieldSampleInputs' },
]

const manifestExample = `{
  "id": "examples.sample.quotient_familial_catala",
  "name": "Example Quotient Familial (Catala)",
  "org": "local.examples",
  "runtime": { "language": "catala", "version": "dev", "primary": true },
  "entrypoint": {
    "type": "catala:scope",
    "target": "examples.catala.generated.Quotient_familial:quotient_familial"
  },
  "input_schema": {
    "type": "object",
    "required": ["agent_revenu", "agent_enfants", "conjoint_revenu"],
    "properties": {
      "agent_revenu": { "type": "number" },
      "agent_enfants": { "type": "integer" },
      "conjoint_revenu": { "type": "number" }
    },
    "additionalProperties": false
  },
  "output_schema": {
    "type": "object",
    "required": ["valeur", "nombre_parts"],
    "properties": {
      "valeur": { "type": "number" },
      "nombre_parts": { "type": "integer" }
    }
  },
  "resources": { "timeout_seconds": 10 },
  "source": ["examples/catala/src/quotient_familial.catala_fr"],
  "sample_inputs": { "agent_revenu": 32000, "agent_enfants": 2, "conjoint_revenu": 0 }
}`

const registerRequest = `POST /catalog/register
Authorization: Bearer <jeton>
Content-Type: application/json

{
  "id": "examples.sample.quotient_familial_catala",
  "runtime": { "language": "catala", "version": "dev", "primary": true },
  "entrypoint": {
    "type": "catala:scope",
    "target": "examples.catala.generated.Quotient_familial:quotient_familial"
  },
  "input_schema": { "...": "..." },
  "output_schema": { "...": "..." }
}`

const registerResponse = `HTTP 200

{
  "status": "registered",
  "id": "examples.sample.quotient_familial_catala"
}`

const catalogRoutes = [
  { method: 'POST', path: '/catalog/register', roleKey: 'apiService.routeRegister' },
  { method: 'GET', path: '/catalog', roleKey: 'apiService.routeList' },
  { method: 'GET', path: '/catalog/{id}', roleKey: 'apiService.routeGet' },
  { method: 'POST', path: '/catalog/infer-schema', roleKey: 'apiService.routeInferSchema' },
]

const executeRequest = `POST /execute/examples.sample.quotient_familial_catala
Authorization: Bearer <jeton>
Content-Type: application/json

{
  "agent_revenu": 32000,
  "agent_enfants": 2,
  "conjoint_revenu": 0
}`

const executeResponse = `HTTP 200

{
  "status": "success",
  "output": {
    "valeur": 10666.67,
    "nombre_parts": 3
  },
  "metrics": { "runtime_seconds": 0.002 },
  "provenance": {
    "adapter": "catala_adapter_v0.1",
    "module": "examples.catala.generated.Quotient_familial",
    "scope": "quotient_familial"
  }
}`

const outcomes = [
  { code: '200', statusKey: 'apiService.outcomeSuccessStatus', tone: 'green', textKey: 'apiService.outcomeSuccessText' },
  { code: '200', statusKey: 'apiService.outcomeFailedStatus', tone: 'yellow', textKey: 'apiService.outcomeFailedText' },
  { code: '200', statusKey: 'apiService.outcomeErrorStatus', tone: 'grey', textKey: 'apiService.outcomeErrorText' },
  { code: '400', statusKey: 'apiService.outcomeRejectedStatus', tone: 'grey', textKey: 'apiService.outcomeRejectedText' },
  { code: '401 / 403', statusKey: 'apiService.outcomeTokenStatus', tone: 'grey', textKey: 'apiService.outcomeTokenText' },
] as const

const adapters = [
  {
    title: 'Python',
    entrypoints: ['python:function', 'python:class', 'python:regalgo_class'],
    bodyKey: 'apiService.adapterPythonBody',
    detailKey: 'apiService.adapterPythonDetail',
  },
  {
    title: 'Catala',
    entrypoints: ['catala:scope'],
    bodyKey: 'apiService.adapterCatalaBody',
    detailKey: 'apiService.adapterCatalaDetail',
  },
]

const catalaSource = `déclaration champ d'application QuotientFamilial:
  entrée agent_revenu contenu argent
  entrée agent_enfants contenu entier
  entrée conjoint_revenu contenu argent
  résultat valeur contenu argent
  résultat nombre_parts contenu entier

champ d'application QuotientFamilial:
  définition nombre_parts égal à
    agent_enfants + 1

  définition valeur égal à
    (agent_revenu + conjoint_revenu) / nombre_parts`

const catalaChain = [
  { icon: 'fr-icon-file-text-line', labelKey: 'apiService.chain1Label', file: 'src/quotient_familial.catala_fr', descKey: 'apiService.chain1Desc' },
  { icon: 'fr-icon-settings-5-line', labelKey: 'apiService.chain2Label', file: 'clerk build', descKey: 'apiService.chain2Desc' },
  { icon: 'fr-icon-code-s-slash-line', labelKey: 'apiService.chain3Label', file: 'generated/Quotient_familial.py', descKey: 'apiService.chain3Desc' },
  { icon: 'fr-icon-play-line', labelKey: 'apiService.chain4Label', file: 'quotient_familial(entrée)', descKey: 'apiService.chain4Desc' },
]
</script>

<template>
  <div>
    <!-- ============ EN-TÊTE ============ -->
    <BrandBackgroundContainer
      variant="soft"
      class="full-bleed border-b border-[#e3e3fd]"
    >
      <div class="fr-container pt-1 space-y-8 pb-8">
        <div class="space-y-4">
          <Breadcrumbs
            :items="[
              { to: '/mvp', label: $t('breadcrumb.home') },
              { to: '/mvp/comprendre/reutiliser-une-regle', label: $t('breadcrumb.reuseRule') },
              { to: null, label: $t('breadcrumb.apiService') },
            ]"
          />
          <header class="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
            <div class="space-y-3 max-w-3xl">
              <h1 class="fr-h2 m-0">
                {{ $t('apiService.heading') }}
              </h1>
              <p class="fr-text--lead text-gray-700 m-0">
                {{ $t('apiService.lead') }}
              </p>
            </div>
            <ul class="flex-1 flex flex-wrap md:justify-end items-end gap-2 list-none p-0 m-0">
              <li
                v-for="tag in qualifiedTags"
                :key="tag.axisKey"
              >
                <QualifiedTag
                  :axis="$t(tag.axisKey)"
                  :value="$t(tag.valueKey)"
                  :tone="tag.tone"
                  :hint="$t(tag.hintKey)"
                />
              </li>
            </ul>
          </header>
        </div>
      </div>
    </BrandBackgroundContainer>

    <!-- ============ TROIS LIEUX + PARCOURS (bande rythmée) ============ -->
    <BrandBackgroundContainer
      variant="subtle"
      class="full-bleed border-b border-[#e3e3fd]"
    >
      <div class="fr-container py-12 md:py-16 space-y-12 md:space-y-16">
        <!-- Où s'exécute une règle -->
        <section
          aria-labelledby="lieux"
          class="space-y-8"
        >
          <div class="max-w-3xl space-y-2">
            <h2
              id="lieux"
              class="fr-h3 m-0"
            >
              {{ $t('apiService.placesTitle') }}
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              {{ $t('apiService.placesLead') }}
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              v-for="p in places"
              :key="p.titleKey"
              class="flex flex-col rounded-lg border bg-white p-6 space-y-3"
              :class="p.current ? 'border-[#000091] shadow-[0_4px_24px_rgba(0,0,145,0.08)]' : 'border-gray-200'"
            >
              <div class="flex items-center justify-between gap-2">
                <span
                  :class="p.icon"
                  class="fr-icon--lg text-[#000091]"
                  aria-hidden="true"
                />
                <span
                  v-if="p.current"
                  class="fr-badge fr-badge--sm fr-badge--blue-cumulus fr-badge--no-icon"
                >{{ $t('apiService.thisPage') }}</span>
              </div>
              <h3 class="fr-h6 m-0">
                {{ $t(p.titleKey) }}
              </h3>
              <p class="fr-text--sm text-gray-700 m-0">
                {{ $t(p.bodyKey) }}
              </p>
              <div class="fr-text--xs text-gray-600 m-0 pt-2 mt-auto border-t border-gray-100 space-y-1">
                <p class="m-0 flex items-start gap-1.5">
                  <span
                    class="fr-icon-information-line fr-icon--xs text-[#000091] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{{ $t(p.exampleKey) }}</span>
                </p>
                <NuxtLink
                  v-if="p.to"
                  :to="localePath(p.to)"
                  class="fr-link fr-text--xs fr-icon-arrow-right-line fr-link--icon-right"
                >
                  {{ p.linkLabelKey ? $t(p.linkLabelKey) : '' }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </section>

        <!-- Le parcours -->
        <section
          aria-labelledby="parcours"
          class="space-y-8"
        >
          <div class="max-w-3xl space-y-2">
            <h2
              id="parcours"
              class="fr-h3 m-0"
            >
              {{ $t('apiService.stepsTitle') }}
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              {{ $t('apiService.stepsLead') }}
            </p>
          </div>

          <ol class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 list-none p-0 m-0">
            <li
              v-for="(step, i) in steps"
              :key="step.num"
              class="relative rounded-lg border border-gray-200 bg-white p-5 marker:content-['']"
            >
              <span class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#000091] text-white font-bold">
                {{ step.num }}
              </span>
              <span
                v-if="i < steps.length - 1"
                class="hidden lg:block absolute top-7 -right-9 text-[#000091] fr-icon-arrow-right-line"
                aria-hidden="true"
              />
              <p class="fr-text--sm font-bold text-gray-900 mt-3 mb-1">
                {{ $t(step.labelKey) }}
              </p>
              <p class="fr-text--xs text-gray-600 m-0">
                {{ $t(step.descKey) }}
              </p>
            </li>
          </ol>
        </section>
      </div>
    </BrandBackgroundContainer>

    <!-- ============ MANIFESTE, ENREGISTREMENT, EXÉCUTION (onglets) ============ -->
    <section
      aria-labelledby="service"
      class="fr-container py-12 md:py-16 space-y-8"
    >
      <div class="max-w-3xl space-y-2">
        <h2
          id="service"
          class="fr-h3 m-0"
        >
          {{ $t('apiService.serviceTitle') }}
        </h2>
        <p class="fr-text--lg text-gray-700 m-0">
          {{ $t('apiService.serviceLead') }}
        </p>
      </div>

      <div class="bg-white rounded-sm shadow-[0_4px_24px_rgba(0,0,145,0.08)] border border-gray-200/60">
        <nav
          :aria-label="$t('apiService.tabsLabel')"
          class="border-b border-gray-200 overflow-x-auto px-5 md:px-8"
        >
          <ul class="flex gap-1 list-none p-0 m-0 min-w-max">
            <li
              v-for="tab in tabs"
              :key="tab.key"
              class="pb-[1px]"
            >
              <NuxtLink
                :to="localePath(`/mvp/api-service?tab=${tab.key}`)"
                class="inline-flex items-center gap-2 px-4 py-3 -mb-px border-b-2 font-medium transition-colors bg-none whitespace-nowrap"
                :class="activeTab === tab.key
                  ? 'border-[#000091] text-[#000091]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
              >
                <span
                  :class="tab.icon"
                  class="fr-icon--sm"
                  aria-hidden="true"
                />
                {{ $t(tab.labelKey) }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="min-w-0 p-5 md:px-12 md:py-10">
          <!-- MANIFESTE -->
          <div
            v-if="activeTab === 'manifeste'"
            class="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-8 lg:gap-10 items-start"
          >
            <div class="space-y-4 min-w-0">
              <h3 class="fr-h5 m-0">
                {{ $t('apiService.manifestTitle') }}
              </h3>
              <p class="fr-text--sm text-gray-700 m-0">
                {{ $t('apiService.manifestLead') }}
              </p>
              <ul class="list-none p-0 m-0 divide-y divide-gray-100 border-y border-gray-100">
                <li
                  v-for="field in manifestFields"
                  :key="field.name"
                  class="py-2.5 grid grid-cols-[minmax(0,11rem)_1fr] gap-3"
                >
                  <code class="fr-text--xs mb-0 text-[#000091] break-all">{{ field.name }}</code>
                  <span class="fr-text--xs mb-0 text-gray-700">{{ $t(field.roleKey) }}</span>
                </li>
              </ul>
            </div>
            <div class="space-y-2 min-w-0">
              <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0">
                {{ $t('apiService.manifestExampleLabel') }}
              </p>
              <pre class="m-0 bg-[#1b1b35] text-gray-100 rounded-lg p-4 text-xs overflow-auto"><code>{{ manifestExample }}</code></pre>
            </div>
          </div>

          <!-- ENREGISTREMENT -->
          <div
            v-else-if="activeTab === 'enregistrement'"
            class="space-y-8"
          >
            <div class="max-w-2xl space-y-3">
              <h3 class="fr-h5 m-0">
                {{ $t('apiService.registerTitle') }}
              </h3>
              <p class="fr-text--sm text-gray-700 m-0">
                {{ $t('apiService.registerLead') }}
              </p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-2 min-w-0">
                <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0">
                  {{ $t('apiService.request') }}
                </p>
                <pre class="m-0 bg-[#1b1b35] text-gray-100 rounded-lg p-4 text-xs overflow-auto"><code>{{ registerRequest }}</code></pre>
              </div>
              <div class="space-y-2 min-w-0">
                <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0">
                  {{ $t('apiService.response') }}
                </p>
                <pre class="m-0 bg-[#1b1b35] text-gray-100 rounded-lg p-4 text-xs overflow-auto"><code>{{ registerResponse }}</code></pre>
              </div>
            </div>
            <div class="space-y-3">
              <h4 class="fr-h6 m-0">
                {{ $t('apiService.routesTitle') }}
              </h4>
              <ul class="list-none p-0 m-0 divide-y divide-gray-100 border-y border-gray-100">
                <li
                  v-for="r in catalogRoutes"
                  :key="r.path"
                  class="py-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1"
                >
                  <span class="fr-badge fr-badge--sm fr-badge--blue-cumulus fr-badge--no-icon">{{ r.method }}</span>
                  <code class="fr-text--xs mb-0 text-gray-800">{{ r.path }}</code>
                  <span class="fr-text--xs mb-0 text-gray-600 basis-full sm:basis-auto">{{ $t(r.roleKey) }}</span>
                </li>
              </ul>
              <p class="fr-text--xs text-gray-600 m-0 flex items-start gap-1.5">
                <span
                  class="fr-icon-lock-line fr-icon--xs text-[#000091] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{{ $t('apiService.routesToken') }} <code class="fr-text--xs">Authorization: Bearer</code>{{ $t('apiService.routesTokenAfter') }}</span>
              </p>
            </div>
          </div>

          <!-- EXÉCUTION -->
          <div
            v-else-if="activeTab === 'execution'"
            class="space-y-8"
          >
            <div class="max-w-2xl space-y-3">
              <h3 class="fr-h5 m-0">
                {{ $t('apiService.executeTitle') }}
              </h3>
              <p class="fr-text--sm text-gray-700 m-0">
                {{ $t('apiService.executeLead') }}
              </p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-2 min-w-0">
                <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0">
                  {{ $t('apiService.request') }}
                </p>
                <pre class="m-0 bg-[#1b1b35] text-gray-100 rounded-lg p-4 text-xs overflow-auto"><code>{{ executeRequest }}</code></pre>
              </div>
              <div class="space-y-2 min-w-0">
                <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0">
                  {{ $t('apiService.response') }}
                </p>
                <pre class="m-0 bg-[#1b1b35] text-gray-100 rounded-lg p-4 text-xs overflow-auto"><code>{{ executeResponse }}</code></pre>
              </div>
            </div>
            <div class="space-y-3">
              <h4 class="fr-h6 m-0">
                {{ $t('apiService.outcomesTitle') }}
              </h4>
              <ul class="list-none p-0 m-0 divide-y divide-gray-100 border-y border-gray-100">
                <li
                  v-for="o in outcomes"
                  :key="`${o.code}-${o.statusKey}`"
                  class="py-2.5 grid grid-cols-1 sm:grid-cols-[minmax(0,14rem)_1fr] gap-x-4 gap-y-1 items-baseline"
                >
                  <span class="flex flex-wrap items-baseline gap-2">
                    <code class="fr-text--xs mb-0 text-gray-800 tabular-nums">{{ o.code }}</code>
                    <QualifiedTag
                      :axis="$t('apiService.outcomeAxis')"
                      :value="$t(o.statusKey)"
                      :tone="o.tone"
                    />
                  </span>
                  <span class="fr-text--xs mb-0 text-gray-700">{{ $t(o.textKey) }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- ADAPTATEURS -->
          <div
            v-else
            class="space-y-8"
          >
            <div class="max-w-2xl space-y-3">
              <h3 class="fr-h5 m-0">
                {{ $t('apiService.adaptersTitle') }}
              </h3>
              <p class="fr-text--sm text-gray-700 m-0">
                {{ $t('apiService.adaptersLeadBefore') }} <code class="fr-text--xs">runtime.language</code>
                {{ $t('apiService.adaptersLeadAfter') }}
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="a in adapters"
                :key="a.title"
                class="flex flex-col rounded-lg border border-gray-200 bg-white p-6 space-y-3"
              >
                <div class="flex items-center gap-2">
                  <h4 class="fr-h6 m-0">
                    {{ a.title }}
                  </h4>
                  <EngineTag
                    v-if="a.title === 'Catala'"
                    engine="catala"
                  />
                </div>
                <ul class="flex flex-wrap gap-1.5 list-none p-0 m-0">
                  <li
                    v-for="e in a.entrypoints"
                    :key="e"
                  >
                    <code class="fr-text--xs mb-0 bg-gray-100 px-1.5 py-0.5 rounded">{{ e }}</code>
                  </li>
                </ul>
                <p class="fr-text--sm text-gray-700 m-0">
                  {{ $t(a.bodyKey) }}
                </p>
                <p class="fr-text--xs text-gray-600 m-0 pt-2 mt-auto border-t border-gray-100 flex items-start gap-1.5">
                  <span
                    class="fr-icon-information-line fr-icon--xs text-[#000091] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{{ $t(a.detailKey) }}</span>
                </p>
              </div>
            </div>
            <p class="fr-text--sm text-gray-600 max-w-2xl m-0">
              {{ $t('apiService.adaptersNote') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ L'EXEMPLE CATALA (bande rythmée) ============ -->
    <BrandBackgroundContainer
      variant="subtle"
      class="full-bleed border-y border-[#e3e3fd]"
    >
      <div class="fr-container py-12 md:py-16 space-y-8">
        <div class="max-w-3xl space-y-2">
          <h2
            id="catala"
            class="fr-h3 m-0"
          >
            {{ $t('apiService.catalaTitle') }}
          </h2>
          <p class="fr-text--lg text-gray-700 m-0">
            {{ $t('apiService.catalaLead') }}
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div class="space-y-2 min-w-0">
            <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0">
              {{ $t('apiService.catalaSourceLabel') }}
            </p>
            <pre class="m-0 bg-[#1b1b35] text-gray-100 rounded-lg p-4 text-xs overflow-auto"><code>{{ catalaSource }}</code></pre>
            <p class="fr-text--xs text-gray-600 m-0">
              {{ $t('apiService.catalaSourceNote') }}
            </p>
          </div>
          <ol class="list-none p-0 m-0 space-y-3">
            <li
              v-for="(c, i) in catalaChain"
              :key="c.labelKey"
              class="relative rounded-lg border border-gray-200 bg-white p-4 flex items-start gap-3"
            >
              <span
                :class="c.icon"
                class="fr-icon--sm text-[#000091] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div class="min-w-0 space-y-0.5">
                <p class="fr-text--sm mb-0 font-bold text-gray-900 m-0">
                  {{ i + 1 }}. {{ $t(c.labelKey) }}
                  <code class="fr-text--xs font-normal text-gray-600 ml-1 break-all">{{ c.file }}</code>
                </p>
                <p class="fr-text--xs text-gray-600 m-0">
                  {{ $t(c.descKey) }}
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div class="flex flex-wrap gap-x-6 gap-y-2">
          <NuxtLink
            :to="localePath('/mvp/regles/prestagri')"
            class="fr-link fr-text--sm fr-icon-arrow-right-line fr-link--icon-right"
          >
            {{ $t('apiService.linkPrestagri') }}
          </NuxtLink>
          <a
            href="https://github.com/qloridant/datapi"
            target="_blank"
            rel="noopener"
            class="fr-link fr-text--sm fr-icon-external-link-line fr-link--icon-right"
          >
            {{ $t('apiService.linkSourceCode') }}
          </a>
          <a
            href="https://github.com/qloridant/datapi/blob/main/docs/INTEGRATION.md"
            target="_blank"
            rel="noopener"
            class="fr-link fr-text--sm fr-icon-external-link-line fr-link--icon-right"
          >
            {{ $t('apiService.linkIntegrationGuide') }}
          </a>
        </div>
      </div>
    </BrandBackgroundContainer>

    <!-- ============ APPEL À EXPLORER ============ -->
    <BrandBackgroundContainer
      variant="contrast"
      class="full-bleed"
    >
      <div class="fr-container py-12 md:py-14">
        <div class="max-w-2xl space-y-3">
          <h2 class="fr-h4 m-0 text-white">
            {{ $t('apiService.ctaTitle') }}
          </h2>
          <p class="fr-text--sm mb-0 text-white/90 m-0">
            {{ $t('apiService.ctaBody') }}
          </p>
          <div class="flex flex-wrap gap-3 pt-2">
            <NuxtLink
              :to="localePath('/mvp/regles/prestagri?tab=api')"
              class="fr-btn btn-on-dark--solid"
            >
              {{ $t('apiService.ctaPrimary') }}
            </NuxtLink>
            <NuxtLink
              :to="localePath('/mvp/regles/')"
              class="fr-btn fr-btn--secondary btn-on-dark--ghost"
            >
              {{ $t('apiService.ctaSecondary') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </BrandBackgroundContainer>
  </div>
</template>
