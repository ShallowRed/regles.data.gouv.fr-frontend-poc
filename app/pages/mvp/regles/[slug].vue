<script setup lang="ts">
import { apiParametersAssertion, assertionForTest, testAssertionsFor, verificationDate } from '~/utils/verification'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { formatLong } = useLocaleDate()
const { resolveTag } = useQualifiedTags()
const route = useRoute()
const { ruleBySlug, ruleTests, ruleVersions, rulePreviews, organisms, legalReferences } = useCatalog()

const slug = computed(() => String(route.params.slug ?? ''))
const rule = computed(() => ruleBySlug.value[slug.value])

const domain = computed(() => (rule.value ? domainMeta(rule.value.domain) : null))
const qualifiedTags = computed(() => (rule.value ? qualifiedTagsFor(rule.value).map(resolveTag) : []))
const engineTag = computed(() => (rule.value ? resolveTag(engineTagFor(rule.value)) : null))

const primaryReference = computed(() => rule.value?.legalReferences[0])

/** Tag de l'engagement du producteur (ADR-0002), rendu comme ses voisins (axe : valeur + hint). */
const guaranteeTag = computed(() => {
  const spec = rule.value ? guaranteeTagFor(rule.value) : null
  return spec ? resolveTag(spec) : null
})

/** Présentation des natures de fait des entrées (`rdgf:factKind`, ADR-0004). */
const factKindMeta: Record<string, { labelKey: string, icon: string, descriptionKey: string }> = {
  declared: {
    labelKey: 'fiche.factKind.declaredLabel',
    icon: 'fr-icon-edit-line',
    descriptionKey: 'fiche.factKind.declaredDescription',
  },
  attested: {
    labelKey: 'fiche.factKind.attestedLabel',
    icon: 'fr-icon-checkbox-circle-line',
    descriptionKey: 'fiche.factKind.attestedDescription',
  },
  derived: {
    labelKey: 'fiche.factKind.derivedLabel',
    icon: 'fr-icon-git-merge-line',
    descriptionKey: 'fiche.factKind.derivedDescription',
  },
  context: {
    labelKey: 'fiche.factKind.contextLabel',
    icon: 'fr-icon-settings-5-line',
    descriptionKey: 'fiche.factKind.contextDescription',
  },
}

/** Entrées groupées par nature de fait, dans l'ordre déclaré ci-dessus. */
const boundaryGroups = computed(() => {
  const boundary = rule.value?.boundary ?? []
  return Object.entries(factKindMeta)
    .map(([kind, meta]) => ({ kind, meta, inputs: boundary.filter(b => b.kind === kind) }))
    .filter(group => group.inputs.length > 0)
})

/** Sorties d'explicabilité (« utiles pour expliquer un refus »). */
const explanationOutputs = computed(() => (rule.value?.outputs ?? []).filter(o => o.isExplanation))

/** Aperçu de calcul pré-calculé (cas d'exemple), si la règle en expose un. */
const preview = computed(() => (rule.value ? rulePreviews.value[rule.value.slug] : undefined))

/**
 * Formulaire « essayer cette règle », généré depuis la fiche metadata.jsonld
 * (paramètres typés + endpoint du canal). Prest'Agri seulement pour l'instant :
 * seule règle dont l'API déclarée est appelable depuis le navigateur.
 */
const tryItForm = computed(() =>
  rule.value?.slug === 'prestagri' ? prestagriQuotientFamilialFormFor(locale.value) : null,
)

/** Appariements texte légal ↔ code pour la traçabilité, résolus avec leur référence. */
const traceabilityMappings = computed(() => {
  const r = rule.value
  if (!r)
    return []
  const mappings = ruleTraceabilityMock[r.slug] ?? []
  return mappings
    .map(m => ({ ...m, reference: legalReferences.value[m.referenceId] }))
    .filter((m): m is typeof m & { reference: NonNullable<typeof m.reference> } => Boolean(m.reference))
})

/** Services concrets dérivés des capacités, formulés pour l'usager (pas de jargon interne). */
const availableServices = computed(() => {
  const r = rule.value
  if (!r)
    return []
  const c = r.capabilities ?? {}
  const services: { icon: string, label: string, description: string, tab: RuleFicheTabKey }[] = []
  if (c.hasCalculationPreview || r.officialSimulatorUrl) {
    services.push({
      icon: 'fr-icon-calculator-line',
      label: t('fiche.services.estimateLabel'),
      description: t('fiche.services.estimateDescription'),
      tab: 'simulation',
    })
  }
  if (r.apiUrl || c.hasApiDocumentation) {
    services.push({
      icon: 'fr-icon-terminal-box-line',
      label: t('fiche.services.integrateLabel'),
      description: t('fiche.services.integrateDescription'),
      tab: 'api',
    })
  }
  if (c.hasLegalTraceability || r.sourceUrl) {
    services.push({
      icon: 'fr-icon-git-commit-line',
      label: t('fiche.services.traceLabel'),
      description: t('fiche.services.traceDescription'),
      tab: 'traceability',
    })
  }
  if (c.hasPublicTestCases) {
    services.push({
      icon: 'fr-icon-checkbox-circle-line',
      label: t('fiche.services.testsLabel'),
      description: t('fiche.services.testsDescription'),
      tab: 'tests',
    })
  }
  return services
})

const tabs = computed(() => (rule.value ? tabsFor(rule.value) : []))

const requestedTab = computed(() => String(route.query.tab ?? 'description') as RuleFicheTabKey)
const activeTab = computed<RuleFicheTabKey>(() => {
  const available = tabs.value.map(t => t.key)
  return available.includes(requestedTab.value) ? requestedTab.value : 'description'
})

/** Icône associée à chaque onglet, pour une nav plus lisible. */
const tabIcon: Record<RuleFicheTabKey, string> = {
  description: 'fr-icon-article-line',
  legal: 'fr-icon-scales-3-line',
  simulation: 'fr-icon-calculator-line',
  api: 'fr-icon-terminal-box-line',
  traceability: 'fr-icon-git-pull-request-line',
  tests: 'fr-icon-checkbox-circle-line',
  versions: 'fr-icon-git-commit-line',
}

const versionKindMeta: Record<string, { labelKey: string, badgeClass: string }> = {
  major: { labelKey: 'fiche.versions.major', badgeClass: 'fr-badge--purple-glycine' },
  minor: { labelKey: 'fiche.versions.minor', badgeClass: 'fr-badge--blue-cumulus' },
  legal: { labelKey: 'fiche.versions.legal', badgeClass: 'fr-badge--yellow-tournesol' },
}

const versions = computed(() => {
  const r = rule.value
  if (!r)
    return []
  return ruleVersions.value
    .filter(v => v.ruleId === r.id)
    .slice(0, 6)
    .map(v => ({
      ...v,
      kindMeta: versionKindMeta[v.kind] ?? versionKindMeta.minor,
      trigger: v.triggeredBy ? legalReferences.value[v.triggeredBy] : undefined,
      isCurrent: v.version === r.version,
    }))
})

const tests = computed(() => {
  const r = rule.value
  return r ? ruleTests.value.filter(t => t.ruleId === r.id) : []
})

/** Bilan des cas de la règle exécutés par le registre (assertions EARL, ADR-0006). */
const testAssertions = computed(() => testAssertionsFor(tests.value.map(t => t.id)))

/** Tag « résultats testés », établi par le registre depuis ses assertions (ADR-0006). */
const resultsTag = computed(() => {
  const spec = resultsTagFor(testAssertions.value)
  return spec ? resolveTag(spec) : null
})

/**
 * Bilan de la vérification automatique (pnpm verify:rules) : cas rejoués et contrôle de
 * dérive fiche/API, lus dans les assertions EARL du registre.
 */
const autoVerification = computed(() => {
  const r = rule.value
  if (!r)
    return null
  const cases = testAssertions.value
  const apiCheck = apiParametersAssertion(r.id)
  if (!cases.total && !apiCheck)
    return null
  return {
    checkedAt: verificationDate,
    total: cases.total,
    passing: cases.passing,
    allPassing: cases.total > 0 && cases.failing === 0,
    drift: apiCheck !== undefined && apiCheck['earl:result']['earl:outcome'] === 'earl:failed',
    driftInfo: apiCheck?.['earl:result']['earl:info'] ?? '',
  }
})

/** Phrase de synthèse du dernier contrôle automatique. */
const verificationSummary = computed(() => {
  const v = autoVerification.value
  if (!v)
    return ''
  const date = formatLong(v.checkedAt)
  if (v.drift)
    return t('fiche.tests.summaryGap', { date })
  if (v.total === 1)
    return t('fiche.tests.summaryOne', { date })
  if (v.allPassing)
    return t('fiche.tests.summaryAll', { total: v.total, date })
  return t('fiche.tests.summaryPartial', { passing: v.passing, total: v.total, date })
})

/** Organisme qui s'engage : par identifiant du catalogue, sinon le libellé lu dans la fiche, sinon le producteur. */
const guaranteeBy = computed(() => {
  const cert = rule.value?.certification
  if (!cert)
    return undefined
  const organism = cert.byOrganismId ? organisms.value[cert.byOrganismId] : undefined
  return organism?.acronym ?? organism?.name ?? cert.byLabel ?? rule.value?.organism.acronym ?? rule.value?.organism.name
})

/** Phrase de l'engagement : qui, depuis quand, sur quelle version. */
const guaranteeSentence = computed(() => {
  const cert = rule.value?.certification
  if (!cert)
    return ''
  const parts = [t('fiche.meta.guaranteeBy', { who: guaranteeBy.value })]
  if (cert.at)
    parts.push(t('fiche.meta.guaranteeOn', { date: formatLong(cert.at) }))
  const sentence = parts.join(' ')
  return `${cert.version ? `${sentence}, ${t('fiche.meta.guaranteeVersion', { version: cert.version })}` : sentence}.`
})

/** Champ d'entrée typé, dérivé du cas d'exemple de l'aperçu. */
function fieldName(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/** Valeur d'affichage (« 30 000 € ») → nombre brut pour les exemples d'API, ou null. */
function numericValue(value: string): number | null {
  const raw = value.trim().replace(/\s/g, '').replace(/(?:€|ans|mois)$/, '').replace(',', '.')
  return /^\d+(?:\.\d+)?$/.test(raw) ? Number.parseFloat(raw) : null
}

function fieldType(value: string): 'number' | 'boolean' | 'string' {
  if (numericValue(value) !== null)
    return 'number'
  if (/^(?:oui|non|true|false)$/i.test(value.trim()))
    return 'boolean'
  return 'string'
}

/** Documentation d'API dérivée du rôle de la règle et de son cas d'exemple. */
const apiDoc = computed(() => {
  const r = rule.value
  if (!r || !r.apiUrl)
    return null
  const p = preview.value
  const inputs = (p?.inputs ?? []).map(i => ({
    name: fieldName(i.label),
    label: i.label,
    type: fieldType(i.value),
    example: i.value,
  }))
  const requestBody = Object.fromEntries(
    inputs.map(i => [i.name, numericValue(i.example) ?? i.example]),
  )
  const responseBody = p
    ? {
        resultat: numericValue(p.result.value) ?? p.result.value,
        ...(p.result.unit ? { unite: p.result.unit.replace(/^-\s*/, '') } : {}),
        opposabilite: r.opposability,
      }
    : { resultat: '...' }

  return {
    method: 'POST',
    url: r.apiUrl,
    inputs,
    requestExample: JSON.stringify({ contexte: requestBody }, null, 2),
    responseExample: JSON.stringify(responseBody, null, 2),
  }
})

/** Modes d'intégration disponibles selon le moteur. */
const integrationModes = computed(() => {
  const r = rule.value
  if (!r)
    return []
  const modes: { icon: string, label: string, hint: string, available: boolean }[] = []
  modes.push({
    icon: 'fr-icon-terminal-box-line',
    label: t('fiche.api.modeApiLabel'),
    hint: t('fiche.api.modeApiHint'),
    available: Boolean(r.apiUrl),
  })
  const lightEngine = r.engine === 'publicodes' || r.engine === 'catala'
  modes.push({
    icon: 'fr-icon-window-line',
    label: t('fiche.api.modeWidgetLabel'),
    hint: t('fiche.api.modeWidgetHint'),
    available: lightEngine && r.maturity === 'N3',
  })
  modes.push({
    icon: 'fr-icon-download-line',
    label: t('fiche.api.modePackageLabel'),
    hint: t('fiche.api.modePackageHint'),
    available: lightEngine && r.maturity === 'N3',
  })
  return modes
})

const title = computed(() => (rule.value
  ? `${rule.value.title} | ${t('fiche.titleSuffix')}`
  : t('fiche.notFoundTitle')))
useHead(() => ({ title: title.value }))
</script>

<template>
  <article v-if="rule">
    <!-- Bandeau d'en-tête texturé : déborde sous l'en-tête pour accueillir la carte surélevée -->
    <BrandBackgroundContainer
      variant="subtle"
      class="full-bleed fr-pb-8w pt-1 relative"
    >
      <div class="fr-container">
        <Breadcrumbs
          :items="[
            { to: '/mvp', label: $t('breadcrumb.home') },
            { to: '/mvp/regles/', label: $t('breadcrumb.catalogue') },
            { to: null, label: rule.title },
          ]"
        />
        <header class="flex flex-row gap-8 space-between pb-8">
          <hgroup class="space-y-2">
            <h1 class="fr-h3 m-0 max-w-2xl">
              {{ rule.title }}
            </h1>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
              <NuxtLink
                :to="rule.organism.url"
                :external="true"
                target="_blank"
                rel="noopener"
                class="fr-text--sm mb-0 fr-m-0 pl-1 font-bold text-gray-700 fr-icon-bank-line fr-link--icon-left bg-none hover:text-[#000091]"
              >
                {{ rule.organism.name }}
              </NuxtLink>
              <span
                v-if="domain"
                class="text-gray-300"
                aria-hidden="true"
              >·</span>
              <span
                v-if="domain"
                class="inline-flex items-center gap-1 fr-text--sm mb-0 fr-m-0 text-gray-600"
              >
                <span
                  :class="domain.icon"
                  class="fr-icon--sm"
                  aria-hidden="true"
                />
                {{ $t(domain.labelKey) }}
              </span>
            </div>
          </hgroup>
          <ul class="flex-1 flex flex-wrap justify-end items-end gap-2 list-none p-0 m-0">
            <li
              v-for="tag in qualifiedTags"
              :key="tag.axis"
            >
              <QualifiedTag
                :axis="tag.axis"
                :value="tag.value"
                :tone="tag.tone"
                :hint="tag.hint"
              />
            </li>
            <li v-if="engineTag">
              <QualifiedTag
                :axis="engineTag.axis"
                :value="engineTag.value"
                :tone="engineTag.tone"
                :hint="engineTag.hint"
              />
            </li>
            <li v-if="guaranteeTag">
              <QualifiedTag
                :axis="guaranteeTag.axis"
                :value="guaranteeTag.value"
                :tone="guaranteeTag.tone"
                :hint="guaranteeTag.hint"
              />
            </li>
            <li v-if="resultsTag">
              <QualifiedTag
                :axis="resultsTag.axis"
                :value="resultsTag.value"
                :tone="resultsTag.tone"
                :hint="resultsTag.hint"
              />
            </li>
            <!-- <li class="fr-text--xs mb-0 fr-m-0 text-gray-500 ml-1">v{{ rule.version }}</li> -->
          </ul>
        </header>
      </div>

      <!-- Carte surélevée : remonte par-dessus le bandeau et porte onglets + contenu -->
      <div class="fr-container">
        <div class="bg-white rounded-sm shadow-[0_4px_24px_rgba(0,0,145,0.08)] border border-gray-200/60">
          <!-- Onglets pleine largeur -->
          <nav
            :aria-label="$t('fiche.tabsLabel')"
            class="border-b border-gray-200 overflow-x-auto px-5 md:px-8"
          >
            <ul class="flex gap-1 list-none p-0 m-0 min-w-max">
              <li
                v-for="tab in tabs"
                :key="tab.key"
                class="pb-[1px]"
              >
                <NuxtLink
                  :to="localePath(`/mvp/regles/${rule.slug}?tab=${tab.key}`)"
                  class="inline-flex items-center gap-2 px-4 py-3 -mb-px border-b-2 font-medium transition-colors bg-none whitespace-nowrap"
                  :class="activeTab === tab.key
                    ? 'border-[#000091] text-[#000091]'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
                >
                  <span
                    :class="tabIcon[tab.key]"
                    class="fr-icon--sm"
                    aria-hidden="true"
                  />
                  {{ $t(tab.labelKey) }}
                </NuxtLink>
              </li>
            </ul>
          </nav>

          <div class="min-w-0 p-5 md:px-12 md:py-10 min-h-[500px]">
            <!-- PRÉSENTATION : layout 2 colonnes (contenu + rail méta, local à cet onglet) -->
            <div
              v-if="activeTab === 'description'"
              class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10 items-start"
            >
              <section class="space-y-8 min-w-0">
                <div class="space-y-3">
                  <h2 class="fr-h5 m-0">
                    {{ $t('fiche.description.whatItDoes') }}
                  </h2>
                  <p class="text-gray-700 m-0 max-w-2xl">
                    {{ rule.shortDescription }}
                  </p>
                </div>

                <!-- Ce que la règle permet : renvoie vers les onglets dédiés -->
                <div
                  v-if="availableServices.length"
                  class="space-y-3"
                >
                  <h2 class="fr-h6 m-0">
                    {{ $t('fiche.description.whatYouCanDo') }}
                  </h2>
                  <ul class="grid sm:grid-cols-2 gap-3 list-none p-0 m-0">
                    <li
                      v-for="service in availableServices"
                      :key="service.label"
                    >
                      <NuxtLink
                        :to="localePath(`/mvp/regles/${rule.slug}?tab=${service.tab}`)"
                        class="group flex items-center gap-3 border border-gray-200 rounded p-3 h-full bg-none hover:border-[#000091] transition-colors"
                      >
                        <span
                          :class="service.icon"
                          class="fr-icon--sm text-[#000091] mt-0.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>
                          <span class="flex items-center gap-1 fr-text--sm mb-0 font-medium text-gray-900 group-hover:text-[#000091]">
                            {{ service.label }}
                            <span
                              class="fr-icon-arrow-right-line fr-icon--xs opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-hidden="true"
                            />
                          </span>
                          <span class="block fr-text--xs mb-0 text-gray-600">{{ service.description }}</span>
                        </span>
                      </NuxtLink>
                    </li>
                  </ul>
                </div>

                <!-- Garantie de fiabilité : comment la confiance est établie -->
                <!-- <p
                  v-if="reliability"
                  class="flex items-start gap-2 fr-text--sm mb-0 text-gray-700 m-0"
                >
                  <span
                    :class="[reliability.icon, reliability.tone]"
                    class="fr-icon--sm shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{{ reliability.text }}</span>
                </p> -->

                <!-- Dépendances vers d'autres règles -->
                <div
                  v-if="rule.dependsOn?.length"
                  class="space-y-3"
                >
                  <h2 class="fr-h6 m-0">
                    {{ $t('fiche.description.dependsOn') }}
                  </h2>
                  <ul class="list-none p-0 m-0 space-y-2">
                    <li
                      v-for="dep in rule.dependsOn"
                      :key="dep"
                    >
                      <NuxtLink
                        :to="localePath(`/mvp/regles/${dep}`)"
                        class="inline-flex items-center gap-2 fr-link fr-icon-arrow-right-line fr-link--icon-right"
                      >
                        {{ ruleBySlug[dep]?.title ?? dep }}
                      </NuxtLink>
                    </li>
                  </ul>
                </div>

                <!-- Frontière de la règle -->
                <details
                  v-if="boundaryGroups.length"
                  class="space-y-3"
                >
                  <summary class="fr-h6 m-0 cursor-pointer">
                    {{ $t('fiche.description.boundary') }}
                  </summary>
                  <div class="space-y-4">
                    <div
                      v-for="group in boundaryGroups"
                      :key="group.kind"
                      class="border border-gray-200 rounded p-4 space-y-2"
                    >
                      <p class="flex items-center gap-2 fr-text--sm mb-0 font-bold text-gray-900 m-0">
                        <span
                          :class="group.meta.icon"
                          class="fr-icon--sm text-[#000091]"
                          aria-hidden="true"
                        />
                        {{ $t(group.meta.labelKey) }}
                      </p>
                      <p class="fr-text--xs mb-0 text-gray-600 m-0">
                        {{ $t(group.meta.descriptionKey) }}
                      </p>
                      <ul class="list-none p-0 m-0 space-y-1">
                        <li
                          v-for="input in group.inputs"
                          :key="input.id"
                          class="fr-text--sm mb-0 text-gray-700"
                        >
                          <span
                            v-if="input.group"
                            class="fr-text--xs text-gray-500"
                          >{{ input.group }} · </span><strong>{{ input.label }}</strong><span
                            v-if="input.required"
                            aria-hidden="true"
                          > *</span>
                          <span
                            v-if="input.definition"
                            class="text-gray-600"
                          > - {{ input.definition }}</span>
                          <template v-if="input.publisher">
                            <br>
                            <span class="fr-text--xs text-gray-600">
                              {{ $t('fiche.description.attestedBy', { source: input.publisher.label }) }}
                            </span>
                          </template>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p
                    v-if="explanationOutputs.length"
                    class="fr-text--sm mb-0 text-gray-700 m-0"
                  >
                    <span
                      class="fr-icon-questionnaire-line fr-icon--sm text-[#000091]"
                      aria-hidden="true"
                    />
                    {{ $t('fiche.description.explanationBefore') }}
                    <template
                      v-for="(output, i) in explanationOutputs"
                      :key="output.id"
                    >
                      <template v-if="i > 0">
                        ,
                      </template><code class="fr-text--xs">{{ output.id }}</code>
                    </template>
                    - {{ $t('fiche.description.explanationAfter') }}
                  </p>
                </details>

                <!-- Mappings opérationnels recensés -->
                <div
                  v-if="rule.operationalMappings?.length"
                  class="space-y-3"
                >
                  <div class="flex items-center gap-2">
                    <h2 class="fr-h6 m-0">
                      {{ $t('fiche.description.mappingsTitle') }}
                    </h2>
                    <HintPopover
                      :text="$t('fiche.description.mappingsHint')"
                      :label="$t('fiche.description.mappingsHintLabel')"
                    />
                  </div>
                  <ul class="list-none p-0 m-0 space-y-2">
                    <li
                      v-for="mapping in rule.operationalMappings"
                      :key="mapping.artifactUrl"
                      class="border border-gray-200 rounded p-3 fr-text--sm mb-0"
                    >
                      <NuxtLink
                        :to="mapping.artifactUrl"
                        :external="true"
                        target="_blank"
                        rel="noopener"
                        class="font-medium"
                      >
                        {{ mapping.label }}
                      </NuxtLink>
                      <span class="block fr-text--xs text-gray-600 mt-1 mb-0">
                        {{ $t('fiche.description.maintainedBy', { who: mapping.maintainedBy }) }}
                        <template v-if="mapping.ciStatus && mapping.ciStatus !== 'unknown'"> · {{ mapping.ciStatus === 'passing' ? $t('fiche.description.ciPassing') : $t('fiche.description.ciFailing') }}</template>
                      </span>
                    </li>
                  </ul>
                </div>

                <!-- Note technique : écarts entre le profil metadata.jsonld source et le schéma catalogue -->
                <details
                  v-if="rule.profileGaps?.length"
                  class="border border-dashed border-gray-300 rounded p-3"
                >
                  <summary class="fr-text--xs mb-0 text-gray-600 cursor-pointer">
                    {{ $t('fiche.description.profileGapsSummary') }}
                  </summary>
                  <ul class="fr-text--xs text-gray-600 mt-2 mb-0 pl-5 space-y-1">
                    <li
                      v-for="gap in rule.profileGaps"
                      :key="gap"
                    >
                      {{ gap }}
                    </li>
                  </ul>
                </details>
              </section>

              <!-- Rail méta : présent uniquement dans Présentation -->
              <aside class="space-y-5">
                <div class="border border-gray-200 rounded">
                  <h2 class="fr-text--sm mb-0 font-bold uppercase tracking-wide text-gray-700 m-0 px-4 py-3 border-b border-gray-200">
                    {{ $t('fiche.meta.title') }}
                  </h2>
                  <dl class="m-0 p-0 divide-y divide-gray-100">
                    <div class="px-4 py-3">
                      <dt class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 m-0">
                        {{ $t('fiche.meta.producer') }}
                      </dt>
                      <dd class="m-0 mt-0.5 p-0 fr-text--sm mb-0 text-gray-900">
                        {{ rule.organism.name }}
                      </dd>
                    </div>
                    <div class="px-4 py-3">
                      <dt class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 m-0">
                        {{ $t('fiche.meta.identifier') }}
                      </dt>
                      <dd class="m-0 mt-0.5 p-0">
                        <code class="fr-text--xs mb-0 bg-gray-100 px-1.5 py-0.5 rounded">{{ rule.id }}</code>
                      </dd>
                    </div>
                    <div class="px-4 py-3">
                      <dt class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 m-0">
                        {{ $t('fiche.meta.updatedAt') }}
                      </dt>
                      <dd class="m-0 p-0 mt-0.5 fr-text--sm mb-0 text-gray-900">
                        {{ formatLong(rule.updatedAt) }}
                      </dd>
                    </div>
                    <div
                      v-if="primaryReference"
                      class="px-4 py-3"
                    >
                      <dt class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 m-0">
                        {{ $t('fiche.meta.primaryLegalBasis') }}
                      </dt>
                      <dd class="m-0 p-0 mt-1 fr-text--sm mb-0">
                        <LegalReferenceLink
                          :reference="primaryReference"
                          :show-kind="false"
                        />
                      </dd>
                    </div>
                  </dl>
                </div>
                <div
                  class="rounded border p-4 space-y-1.5"
                  :class="rule.opposability === 'opposable'
                    ? 'border-[#cad8ff] bg-[#f4f6ff]'
                    : 'border-gray-200 bg-gray-50'"
                >
                  <p class="flex items-center gap-2 fr-text--sm mb-0 font-bold m-0">
                    <span
                      :class="rule.opposability === 'opposable' ? 'fr-icon-success-fill text-[#0063cb]' : 'fr-icon-information-line text-gray-500'"
                      class="fr-icon--sm"
                      aria-hidden="true"
                    />
                    {{ rule.opposability === 'opposable' ? $t('opposability.bindingResult') : $t('opposability.indicativeResult') }}
                  </p>
                  <p class="fr-text--xs mb-0 text-gray-700 m-0">
                    {{ rule.opposability === 'opposable' ? $t('opposability.bindingText') : $t('opposability.indicativeText') }}
                  </p>
                </div>
                <!-- Garantie du producteur (rdgf:certification, ADR-0002) -->
                <div
                  class="border rounded p-4 space-y-2"
                  :class="rule.certification
                    ? (rule.certification.level === 'certified' ? 'border-[#b8e6c5] bg-[#f0fbf3]' : 'border-[#b6cffb] bg-[#f4f6fe]')
                    : 'border-gray-200 bg-gray-50'"
                >
                  <p class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 m-0">
                    {{ $t('fiche.meta.guaranteeTitle') }}
                  </p>
                  <h3
                    class="flex items-center gap-2 fr-text--sm mb-0 font-bold m-0"
                    :class="rule.certification
                      ? (rule.certification.level === 'certified' ? 'text-[#18753c]' : 'text-[#0063cb]')
                      : 'text-gray-700'"
                  >
                    <span
                      :class="rule.certification
                        ? (rule.certification.level === 'certified' ? 'fr-icon-success-fill' : 'fr-icon-git-repository-line')
                        : 'fr-icon-information-line'"
                      class="fr-icon--sm"
                      aria-hidden="true"
                    />
                    {{ rule.certification
                      ? (rule.certification.level === 'certified' ? $t('fiche.meta.guaranteeCertified') : $t('fiche.meta.guaranteeSelfAssessed'))
                      : $t('fiche.meta.guaranteeNone') }}
                  </h3>
                  <p
                    v-if="rule.certification"
                    class="fr-text--xs mb-0 text-gray-700 m-0"
                  >
                    {{ guaranteeSentence }}
                  </p>
                  <p class="fr-text--xs mb-0 text-gray-600 m-0">
                    {{ rule.certification ? (rule.certification.description ?? '') : $t('fiche.meta.guaranteeNoneText') }}
                  </p>
                </div>
              </aside>
            </div>

            <!-- AUTRES ONGLETS : pleine largeur -->
            <div
              v-else
              class="max-w-4xl"
            >
              <section
                v-if="activeTab === 'legal'"
                class="space-y-6"
              >
                <div class="space-y-2 max-w-2xl">
                  <h2 class="fr-h5 m-0">
                    {{ $t('fiche.legal.title') }}
                  </h2>
                  <p class="fr-text--sm text-gray-700 m-0">
                    {{ $t('fiche.legal.lead') }}
                  </p>
                </div>

                <ul class="list-none p-0 m-0 space-y-3 max-w-2xl">
                  <li
                    v-for="ref in rule.legalReferences"
                    :key="ref.id"
                    class="rounded-lg border border-gray-200 bg-white p-4 flex items-start gap-3"
                  >
                    <span
                      class="fr-icon-scales-3-line fr-icon--sm text-[#000091] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <LegalReferenceLink :reference="ref" />
                  </li>
                </ul>
              </section>

              <section
                v-else-if="activeTab === 'simulation'"
                class="space-y-6"
              >
                <h2 class="fr-h5 m-0">
                  {{ $t('fiche.simulation.title') }}
                </h2>

                <!-- Aperçu exécuté en direct : moteur Publicodes chargé dans la page -->
                <RuleLiveCalculation
                  v-if="rule.slug === 'entreprise-innovation'"
                  :opposability="rule.opposability"
                  :source="primaryReference?.label"
                />

                <!-- Régime implémentation : calcul délégué au moteur du producteur (OpenFisca) -->
                <RuleOpenfiscaCalculation
                  v-else-if="rule.slug === 'prime-activite-openfisca'"
                  :source-url="rule.sourceUrl"
                />

                <!-- Aperçu pré-calculé : moteur ouvert / exécutable -->
                <template v-else-if="preview">
                  <!-- Situation d'exemple -->
                  <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 md:p-5">
                    <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0 mb-3">
                      {{ $t('fiche.simulation.exampleSituation') }}
                    </p>
                    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-24 gap-y-2 m-0 p-0">
                      <div
                        v-for="input in preview.inputs"
                        :key="input.label"
                        class="flex justify-between gap-3 border-b border-gray-200 pb-1.5"
                      >
                        <dt class="fr-text--sm mb-0 text-gray-600">
                          {{ input.label }}
                        </dt>
                        <dd class="fr-text--sm mb-0 font-medium text-gray-900 m-0 text-right">
                          {{ input.value }}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <!-- Résultat + explicabilité -->
                  <RuleSimulationPreview
                    :result="preview.result"
                    :opposability="rule.opposability"
                    :source="primaryReference?.label"
                    :explanation="preview.explanation"
                    :computed-at="formatLong(preview.computedAt)"
                  />

                  <!-- Formulaire généré depuis la fiche, exécuté contre l'API déclarée -->
                  <RuleTryIt
                    v-if="tryItForm"
                    :form="tryItForm"
                  />

                  <p
                    v-if="rule.officialSimulatorUrl"
                    class="fr-text--sm mb-0 text-gray-600 m-0"
                  >
                    {{ $t('fiche.simulation.officialBefore') }}
                    <a
                      :href="rule.officialSimulatorUrl"
                      target="_blank"
                      rel="noopener"
                      class="fr-link"
                    >
                      {{ $t('fiche.simulation.officialLink', { organism: rule.organism.acronym ?? rule.organism.name }) }}</a>.
                  </p>
                </template>

                <!-- Dégradation : moteur fermé / interne à l'administration -->
                <div
                  v-else
                  class="rounded-lg border border-gray-200 bg-white p-6 space-y-4"
                >
                  <div class="flex items-start gap-3">
                    <span
                      class="fr-icon-lock-line fr-icon--lg text-gray-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div class="space-y-1.5">
                      <h3 class="fr-h6 m-0">
                        {{ $t('fiche.simulation.internalTitle') }}
                      </h3>
                      <p class="fr-text--sm mb-0 text-gray-700 m-0 max-w-2xl">
                        {{ $t('fiche.simulation.internalBody', { organism: rule.organism.acronym ?? rule.organism.name }) }}
                      </p>
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-3">
                    <a
                      v-if="rule.officialSimulatorUrl"
                      :href="rule.officialSimulatorUrl"
                      target="_blank"
                      rel="noopener"
                      class="fr-btn fr-btn--secondary fr-icon-external-link-line fr-btn--icon-right"
                    >
                      {{ $t('fiche.simulation.officialSimulator') }}
                    </a>
                    <NuxtLink
                      v-if="rule.apiUrl"
                      :to="localePath(`/mvp/regles/${rule.slug}?tab=api`)"
                      class="fr-btn fr-btn--tertiary fr-icon-terminal-box-line fr-btn--icon-left"
                    >
                      {{ $t('fiche.simulation.seeApi') }}
                    </NuxtLink>
                  </div>
                </div>
              </section>

              <section
                v-else-if="activeTab === 'api'"
                class="space-y-8"
              >
                <h2 class="fr-h5 m-0">
                  {{ $t('fiche.api.title') }}
                </h2>

                <!-- Modes d'intégration disponibles -->
                <ul class="grid grid-cols-1 sm:grid-cols-3 gap-3 list-none p-0 m-0">
                  <li
                    v-for="mode in integrationModes"
                    :key="mode.label"
                    class="rounded-lg border p-4 space-y-1.5"
                    :class="mode.available ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <span
                        :class="[mode.icon, mode.available ? 'text-[#000091]' : 'text-gray-400']"
                        class="fr-icon--sm"
                        aria-hidden="true"
                      />
                      <span
                        class="fr-badge fr-badge--sm"
                        :class="mode.available ? 'fr-badge--success' : 'fr-badge--grey'"
                      >
                        {{ mode.available ? $t('fiche.api.available') : $t('fiche.api.unavailable') }}
                      </span>
                    </div>
                    <p
                      class="fr-text--sm mb-0 font-medium m-0"
                      :class="mode.available ? 'text-gray-900' : 'text-gray-500'"
                    >
                      {{ mode.label }}
                    </p>
                    <p class="fr-text--xs mb-0 text-gray-600 m-0">
                      {{ mode.hint }}
                    </p>
                  </li>
                </ul>

                <!-- Documentation de l'API REST -->
                <div
                  v-if="apiDoc"
                  class="space-y-5"
                >
                  <h3 class="fr-h6 m-0">
                    {{ $t('fiche.api.docTitle') }}
                  </h3>

                  <!-- Endpoint -->
                  <div class="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <span class="fr-badge fr-badge--sm fr-badge--blue-cumulus">{{ apiDoc.method }}</span>
                    <code class="fr-text--sm mb-0 fr-m-0 text-gray-800 break-all">{{ apiDoc.url }}</code>
                  </div>

                  <!-- Schéma d'entrée -->
                  <div
                    v-if="apiDoc.inputs.length"
                    class="space-y-2"
                  >
                    <p class="fr-text--sm mb-0 font-semibold text-gray-900 m-0">
                      {{ $t('fiche.api.inputParams') }}
                    </p>
                    <div class="rounded-lg border border-gray-200 overflow-hidden">
                      <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 font-semibold px-3 py-2">
                              {{ $t('fiche.api.columnField') }}
                            </th>
                            <th class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 font-semibold px-3 py-2">
                              {{ $t('fiche.api.columnType') }}
                            </th>
                            <th class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 font-semibold px-3 py-2">
                              {{ $t('fiche.api.columnDescription') }}
                            </th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                          <tr
                            v-for="field in apiDoc.inputs"
                            :key="field.name"
                          >
                            <td class="px-3 py-2">
                              <code class="fr-text--xs mb-0 text-[#000091]">{{ field.name }}</code>
                            </td>
                            <td class="px-3 py-2 fr-text--xs mb-0 text-gray-600">
                              {{ field.type }}
                            </td>
                            <td class="px-3 py-2 fr-text--sm mb-0 text-gray-700">
                              {{ field.label }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Exemples requête / réponse -->
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <p class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 m-0">
                        {{ $t('fiche.api.requestExample') }}
                      </p>
                      <pre class="m-0 bg-[#1b1b35] text-gray-100 rounded-lg p-4 text-xs overflow-auto"><code>{{ apiDoc.requestExample }}</code></pre>
                    </div>
                    <div class="space-y-1.5">
                      <p class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 m-0">
                        {{ $t('fiche.api.responseExample') }}
                      </p>
                      <pre class="m-0 bg-[#1b1b35] text-gray-100 rounded-lg p-4 text-xs overflow-auto"><code>{{ apiDoc.responseExample }}</code></pre>
                    </div>
                  </div>

                  <p class="fr-text--xs mb-0 text-gray-500 m-0">
                    {{ $t('fiche.api.schemaNote') }}
                  </p>
                </div>
              </section>

              <section
                v-else-if="activeTab === 'traceability'"
                class="space-y-6"
              >
                <div class="flex items-center gap-2">
                  <h2 class="fr-h5 m-0">
                    {{ $t('fiche.traceability.title') }}
                  </h2>
                  <HintPopover
                    :text="$t('fiche.traceability.hint')"
                    :label="$t('fiche.traceability.hintLabel')"
                    more-to="/mvp/comprendre/verifier-une-regle"
                    :more-label="$t('fiche.traceability.hintMore')"
                  />
                </div>

                <!-- Appariements texte ↔ code : moteur ouvert, traçabilité publiée -->
                <template v-if="traceabilityMappings.length">
                  <LegalTraceability
                    v-for="(m, i) in traceabilityMappings"
                    :key="i"
                    :reference="m.reference"
                    :legal-excerpt="m.legalExcerpt"
                    :legal-anchor="m.legalAnchor"
                    :code-snippet="m.codeSnippet"
                    :engine="m.engine"
                    :code-anchor="m.codeAnchor"
                  />
                  <p
                    v-if="rule.sourceUrl"
                    class="fr-text--sm mb-0 text-gray-600 m-0"
                  >
                    {{ $t('fiche.traceability.fullSource') }}
                    <a
                      :href="rule.sourceUrl"
                      target="_blank"
                      rel="noopener"
                      class="fr-link"
                    >{{ rule.sourceUrl.replace('https://github.com/', '') }}</a>
                  </p>
                </template>

                <!-- Dégradation : pas d'appariement détaillé publié -->
                <div
                  v-else
                  class="space-y-4"
                >
                  <div class="rounded-lg border border-gray-200 bg-white p-6 space-y-3 max-w-2xl">
                    <div class="flex items-start gap-3">
                      <span
                        class="fr-icon-scales-3-line fr-icon--lg text-gray-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div class="space-y-1.5">
                        <h3 class="fr-h6 m-0">
                          {{ $t('fiche.traceability.emptyTitle') }}
                        </h3>
                        <p class="fr-text--sm mb-0 text-gray-700 m-0">
                          {{ $t('fiche.traceability.emptyBody') }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <ul class="list-none p-0 m-0 space-y-2 max-w-2xl">
                    <li
                      v-for="ref in rule.legalReferences"
                      :key="ref.id"
                    >
                      <LegalReferenceLink :reference="ref" />
                    </li>
                  </ul>
                </div>
              </section>

              <section
                v-else-if="activeTab === 'tests'"
                class="space-y-6 max-w-3xl"
              >
                <div class="flex items-center gap-2">
                  <h2 class="fr-h5 m-0">
                    {{ $t('fiche.tests.title') }}
                  </h2>
                  <HintPopover
                    :text="$t('fiche.tests.hint')"
                    :label="$t('fiche.tests.hintLabel')"
                    more-to="/mvp/comprendre/verifier-une-regle"
                    :more-label="$t('fiche.tests.hintMore')"
                  />
                </div>

                <template v-if="tests.length">
                  <!-- Synthèse de vérification : masquée quand la carte unique porte déjà l'info -->
                  <div
                    v-if="autoVerification && (autoVerification.drift || !autoVerification.allPassing || autoVerification.total > 1)"
                    class="rounded-lg border p-4 space-y-2"
                    :class="autoVerification.drift || !autoVerification.allPassing
                      ? 'border-[#b34000]/30 bg-[#fff4ed]'
                      : 'border-[#18753c]/30 bg-[#dffee6]/40'"
                  >
                    <div class="flex flex-wrap items-center gap-2">
                      <span
                        class="fr-badge fr-badge--sm"
                        :class="autoVerification.drift || !autoVerification.allPassing ? 'fr-badge--warning' : 'fr-badge--success'"
                      >
                        {{ autoVerification.drift || !autoVerification.allPassing ? $t('fiche.tests.badgeGap') : $t('fiche.tests.badgeConform') }}
                      </span>
                      <span class="fr-text--sm mb-0 text-gray-700">
                        {{ verificationSummary }}
                      </span>
                    </div>
                    <p
                      v-if="autoVerification.drift"
                      class="fr-text--sm mb-0 text-gray-700 m-0"
                    >
                      {{ $t('fiche.tests.gapBefore') }}
                      <code class="fr-text--xs">{{ autoVerification.driftInfo }}</code>.
                      {{ $t('fiche.tests.gapAfter') }}
                    </p>
                  </div>

                  <ul class="list-none p-0 m-0 space-y-3">
                    <li
                      v-for="testCase in tests"
                      :key="testCase.id"
                    >
                      <RuleTestCase
                        :test="testCase"
                        :assertion="assertionForTest(testCase.id)"
                      />
                    </li>
                  </ul>
                </template>

                <!-- Dégradation : règle sans cas de test publics -->
                <div
                  v-else
                  class="rounded-lg border border-gray-200 bg-white p-6 space-y-3 max-w-2xl"
                >
                  <div class="flex items-start gap-3">
                    <span
                      class="fr-icon-eye-off-line fr-icon--lg text-gray-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div class="space-y-1.5">
                      <h3 class="fr-h6 m-0">
                        {{ $t('fiche.tests.emptyTitle') }}
                      </h3>
                      <p class="fr-text--sm mb-0 text-gray-700 m-0">
                        {{ $t('fiche.tests.emptyBody', { organism: rule.organism.acronym ?? rule.organism.name }) }}
                      </p>
                    </div>
                  </div>
                  <p
                    v-if="rule.certification"
                    class="fr-text--xs mb-0 text-gray-600 m-0 pl-9"
                  >
                    {{ $t('fiche.tests.emptyCertified') }}
                  </p>
                </div>
              </section>

              <section
                v-else-if="activeTab === 'versions'"
                class="space-y-6"
              >
                <h2 class="fr-h5 m-0">
                  {{ $t('fiche.versions.title') }}
                </h2>

                <p
                  v-if="!versions.length"
                  class="fr-text--sm mb-0 text-gray-600 m-0"
                >
                  {{ $t('fiche.versions.empty') }}
                </p>

                <!-- Frise chronologique -->
                <ol
                  v-else
                  class="list-none p-0 pl-6 pt-4 m-0 relative"
                >
                  <li
                    v-for="(v, i) in versions"
                    :key="v.id"
                    class="relative pl-8 pb-6 last:pb-0"
                  >
                    <!-- Trait vertical reliant les jalons -->
                    <span
                      v-if="i < versions.length - 1"
                      class="absolute left-[7px] top-3 bottom-0 w-px bg-gray-200"
                      aria-hidden="true"
                    />
                    <!-- Pastille du jalon -->
                    <span
                      class="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2"
                      :class="v.isCurrent ? 'bg-[#000091] border-[#000091]' : 'bg-white border-gray-300'"
                      aria-hidden="true"
                    />

                    <div class="space-y-1.5">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="fr-text--sm mb-0 font-bold text-gray-900">{{ formatRuleVersion(v.version) }}</span>
                        <span
                          class="fr-badge fr-badge--sm"
                          :class="(v.kindMeta as {
                            labelKey: string;
                            badgeClass: string;
                          }).badgeClass"
                        >{{ $t((v.kindMeta as {
                          labelKey: string;
                          badgeClass: string;
                        }).labelKey) }}</span>
                        <span
                          v-if="v.isCurrent"
                          class="fr-badge fr-badge--sm fr-badge--green-emeraude"
                        >{{ $t('fiche.versions.current') }}</span>
                        <span class="fr-text--xs mb-0 text-gray-500">{{ formatLong(v.publishedAt) }}</span>
                      </div>

                      <p class="fr-text--sm mb-0 text-gray-700 m-0">
                        {{ v.changelog }}
                      </p>

                      <p
                        v-if="v.trigger"
                        class="fr-text--xs mb-0 text-gray-600 m-0"
                      >
                        <span
                          class="fr-icon-scales-3-line fr-icon--xs align-middle mr-1"
                          aria-hidden="true"
                        />
                        {{ $t('fiche.versions.triggeredBy') }}
                        <a
                          v-if="v.trigger.eli"
                          :href="v.trigger.eli"
                          target="_blank"
                          rel="noopener"
                          class="fr-link fr-link--sm"
                        >{{ v.trigger.label }}</a>
                        <span v-else>{{ v.trigger.label }}</span>
                      </p>
                    </div>
                  </li>
                </ol>
              </section>
            </div>
          </div>
        </div>
      </div>
    </BrandBackgroundContainer>
  </article>

  <section
    v-else
    class="space-y-4 py-10"
  >
    <h1 class="fr-h2">
      {{ $t('fiche.notFoundTitle') }}
    </h1>
    <p class="text-gray-700">
      {{ $t('fiche.notFoundBody') }} <code>{{ slug }}</code>.
    </p>
    <NuxtLink
      :to="localePath('/mvp/regles/')"
      class="fr-btn fr-btn--secondary fr-icon-arrow-left-line fr-btn--icon-left"
    >
      {{ $t('fiche.backToCatalogue') }}
    </NuxtLink>
  </section>
</template>
