<script setup lang="ts">
import verificationData from '~/data/verification.json'

const route = useRoute()

const slug = computed(() => String(route.params.slug ?? ''))
const rule = computed(() => ruleBySlug[slug.value])

const domain = computed(() => (rule.value ? domainMeta(rule.value.domain) : null))
const qualifiedTags = computed(() => (rule.value ? qualifiedTagsFor(rule.value) : []))
const engineTag = computed(() => (rule.value ? engineTagFor(rule.value) : null))

const primaryReference = computed(() => rule.value?.legalReferences[0])

/** Métadonnées d'affichage du régime de certification (doctrine : plusieurs régimes assumés). */
const regimeMeta = computed(() => {
  const regime = rule.value?.certificationRegime
  if (!regime)
    return null
  const meta = {
    frontiere: {
      label: 'Certifiable à la frontière',
      badgeClass: 'fr-badge--green-emeraude',
      hint: 'L\'administration certifie le comportement entrées → sorties sur des faits déclarés, à une version donnée (sémantique du rescrit). La provenance amont des entrées n\'est pas couverte.',
    },
    implementation: {
      label: 'Cataloguée comme implémentation',
      badgeClass: 'fr-badge--blue-cumulus',
      hint: 'Règle du cœur socio-fiscal, sans porteur unique de sa chaîne de dépendances : le couple suite de tests + snapshot d\'implémentation fait foi, pas la règle dans l\'abstrait.',
    },
    referencement: {
      label: 'Simplement référencée',
      badgeClass: 'fr-badge--grey',
      hint: 'Métadonnées descriptives seules : ni code ni cas de tests publiés.',
    },
  } as const
  return meta[regime]
})

/** Présentation des natures d'entrées à la frontière de la règle. */
const boundaryKindMeta: Record<string, { label: string, icon: string, description: string }> = {
  'declaration': {
    label: 'Faits déclarés',
    icon: 'fr-icon-edit-line',
    description: 'Déclarés par l\'usager, non vérifiés. La certification porte sur ces faits tels que déclarés.',
  },
  'donnee-attestee': {
    label: 'Données attestées',
    icon: 'fr-icon-checkbox-circle-line',
    description: 'Attestées par une administration propriétaire, mobilisables via une API.',
  },
  'sortie-regle': {
    label: 'Sorties d\'autres règles',
    icon: 'fr-icon-git-merge-line',
    description: 'Paramètres partagés ou résultats d\'autres règles : hors du périmètre certifié par cette entrée.',
  },
  'contexte': {
    label: 'Paramètres de contexte',
    icon: 'fr-icon-settings-5-line',
    description: 'Changent la règle appliquée (par exemple le type d\'élection).',
  },
}

/** Entrées de la frontière groupées par nature, dans l'ordre déclaré ci-dessus. */
const boundaryGroups = computed(() => {
  const boundary = rule.value?.boundary ?? []
  return Object.entries(boundaryKindMeta)
    .map(([kind, meta]) => ({ kind, meta, inputs: boundary.filter(b => b.kind === kind) }))
    .filter(group => group.inputs.length > 0)
})

/** Sorties d'explicabilité (« utiles pour expliquer un refus »). */
const explanationOutputs = computed(() => (rule.value?.outputs ?? []).filter(o => o.isExplanation))

/** Aperçu de calcul pré-calculé (cas d'exemple), si la règle en expose un. */
const preview = computed(() => (rule.value ? rulePreviewsMock[rule.value.slug] : undefined))

/**
 * Formulaire « essayer cette règle », généré depuis la fiche metadata.jsonld
 * (paramètres typés + endpoint du canal). Prest'Agri seulement pour l'instant :
 * seule règle dont l'API déclarée est appelable depuis le navigateur.
 */
const tryItForm = computed(() =>
  rule.value?.slug === 'prestagri' ? prestagriQuotientFamilialForm : null,
)

/** Appariements texte légal ↔ code pour la traçabilité, résolus avec leur référence. */
const traceabilityMappings = computed(() => {
  const r = rule.value
  if (!r)
    return []
  const mappings = ruleTraceabilityMock[r.slug] ?? []
  return mappings
    .map(m => ({ ...m, reference: legalReferencesMock[m.referenceId] }))
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
      label: 'Estimer un cas',
      description: 'Obtenir un résultat indicatif à partir d\'une situation.',
      tab: 'simulation',
    })
  }
  if (r.apiUrl || c.hasApiDocumentation) {
    services.push({
      icon: 'fr-icon-terminal-box-line',
      label: 'Intégrer dans un service',
      description: 'Appeler la règle via son API documentée.',
      tab: 'api',
    })
  }
  if (c.hasLegalTraceability || r.sourceUrl) {
    services.push({
      icon: 'fr-icon-git-commit-line',
      label: 'Remonter à la loi',
      description: 'Relier chaque résultat à son texte de référence.',
      tab: 'traceability',
    })
  }
  if (c.hasPublicTestCases) {
    services.push({
      icon: 'fr-icon-checkbox-circle-line',
      label: 'Vérifier sur des cas',
      description: 'Consulter les cas de test publiés par le producteur.',
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

const versionKindMeta: Record<string, { label: string, badgeClass: string }> = {
  majeur: { label: 'Majeur', badgeClass: 'fr-badge--purple-glycine' },
  mineur: { label: 'Mineur', badgeClass: 'fr-badge--blue-cumulus' },
  correctif: { label: 'Correctif', badgeClass: 'fr-badge--yellow-tournesol' },
  editorial: { label: 'Éditorial', badgeClass: 'fr-badge--grey' },
}

const versions = computed(() => {
  const r = rule.value
  if (!r)
    return []
  return ruleVersionsMock
    .filter(v => v.ruleId === r.id)
    .slice(0, 6)
    .map(v => ({
      ...v,
      kindMeta: versionKindMeta[v.kind] ?? versionKindMeta.mineur,
      trigger: v.triggeredBy ? legalReferencesMock[v.triggeredBy] : undefined,
      isCurrent: v.version === r.version,
    }))
})

const tests = computed(() => {
  const r = rule.value
  return r ? ruleTestsMock.filter(t => t.ruleId === r.id) : []
})

/**
 * Statut de la vérification automatique (pnpm verify:rules) : rejeu daté des cas de
 * l'enveloppe contre l'API déclarée dans la fiche. Le fichier est produit par le script,
 * jamais édité à la main.
 */
const autoVerification = computed(() => {
  const r = rule.value
  if (!r)
    return null
  const results = verificationData.results.filter(entry => entry.ruleId === r.id)
  const schemaCheck = verificationData.schemaChecks?.find(entry => entry.ruleId === r.id)
  if (!results.length && !schemaCheck)
    return null
  const passing = results.filter(entry => entry.status === 'conforme').length
  return {
    checkedAt: verificationData.checkedAt,
    total: results.length,
    passing,
    allPassing: results.length > 0 && passing === results.length,
    drift: schemaCheck?.drift === true,
    declaredNotAccepted: schemaCheck?.declaredNotAccepted ?? [],
    acceptedNotDeclared: schemaCheck?.acceptedNotDeclared ?? [],
  }
})

/** Décompte des cas de test par statut, pour la barre de synthèse. */
const testStats = computed(() => {
  const t = tests.value
  return {
    total: t.length,
    valide: t.filter(x => x.status === 'valide').length,
    enRevue: t.filter(x => x.status === 'en_revue').length,
    echec: t.filter(x => x.status === 'echec').length,
    administration: t.filter(x => x.source === 'administration').length,
    communaute: t.filter(x => x.source === 'communaute').length,
  }
})

const certifyingOrganism = computed(() => {
  const cert = rule.value?.certification
  return cert ? organismsMock[cert.byOrganismId] : undefined
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

function fieldType(value: string): 'number' | 'boolean' | 'string' {
  if (/^\d+(?:[.,]\d+)?\s*(?:€|ans|mois)?$/.test(value.trim()))
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
    inputs.map(i => [i.name, i.type === 'number'
      ? Number.parseFloat(i.example.replace(',', '.')) || i.example
      : i.example]),
  )
  const responseBody = p
    ? { resultat: p.result.value, ...(p.result.unit ? { unite: p.result.unit.replace(/^-\s*/, '') } : {}), opposabilite: r.opposability }
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
    label: 'API de calcul',
    hint: 'Appel REST renvoyant un résultat à partir d\'une situation.',
    available: Boolean(r.apiUrl),
  })
  const lightEngine = r.engine === 'publicodes' || r.engine === 'catala'
  modes.push({
    icon: 'fr-icon-window-line',
    label: 'Widget intégrable',
    hint: 'Module de simulation à embarquer (iframe / web component).',
    available: lightEngine && r.maturity === 'N3',
  })
  modes.push({
    icon: 'fr-icon-download-line',
    label: 'Paquet exécutable',
    hint: 'Exécution côté client, adaptée au mobile et à la vie privée.',
    available: lightEngine && r.maturity === 'N3',
  })
  return modes
})

function formatDate(s: string | undefined): string {
  if (!s)
    return '-'
  try {
    return new Date(s).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  catch {
    return s
  }
}

const title = computed(() => (rule.value ? `${rule.value.title} | Catalogue des règles` : 'Règle introuvable'))
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
            { to: '/mvp', label: 'Accueil' },
            { to: '/mvp/regles/', label: 'Catalogue' },
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
                {{ domain.label }}
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
            <li v-if="regimeMeta">
              <p
                class="fr-badge fr-badge--sm m-0"
                :class="regimeMeta.badgeClass"
                :title="regimeMeta.hint"
              >
                {{ regimeMeta.label }}
              </p>
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
            aria-label="Sections de la fiche"
            class="border-b border-gray-200 overflow-x-auto px-5 md:px-8"
          >
            <ul class="flex gap-1 list-none p-0 m-0 min-w-max">
              <li
                v-for="tab in tabs"
                :key="tab.key"
                class="pb-[1px]"
              >
                <NuxtLink
                  :to="`/mvp/regles/${rule.slug}?tab=${tab.key}`"
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
                  {{ tab.label }}
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
                    Ce que fait cette règle
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
                    Ce que vous pouvez en faire
                  </h2>
                  <ul class="grid sm:grid-cols-2 gap-3 list-none p-0 m-0">
                    <li
                      v-for="service in availableServices"
                      :key="service.label"
                    >
                      <NuxtLink
                        :to="`/mvp/regles/${rule.slug}?tab=${service.tab}`"
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
                    S'appuie sur d'autres règles
                  </h2>
                  <ul class="list-none p-0 m-0 space-y-2">
                    <li
                      v-for="dep in rule.dependsOn"
                      :key="dep"
                    >
                      <NuxtLink
                        :to="`/mvp/regles/${dep}`"
                        class="inline-flex items-center gap-2 fr-link fr-icon-arrow-right-line fr-link--icon-right"
                      >
                        {{ ruleBySlug[dep]?.title ?? dep }}
                      </NuxtLink>
                    </li>
                  </ul>
                </div>

                <!-- Frontière de la règle : ce que la certification couvre, et ce qu'elle ne couvre pas -->
                <div
                  v-if="boundaryGroups.length"
                  class="space-y-3"
                >
                  <h2 class="fr-h6 m-0">
                    La frontière de la règle
                  </h2>
                  <p class="fr-text--sm text-gray-600 m-0 max-w-2xl">
                    Un résultat certifié couvre le comportement de la règle sur ses entrées, pas la
                    provenance de celles-ci. Chaque entrée est donc classée selon sa nature.
                  </p>
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
                        {{ group.meta.label }}
                      </p>
                      <p class="fr-text--xs mb-0 text-gray-600 m-0">
                        {{ group.meta.description }}
                      </p>
                      <ul class="list-none p-0 m-0 space-y-1">
                        <li
                          v-for="input in group.inputs"
                          :key="input.id"
                          class="fr-text--sm mb-0 text-gray-700"
                        >
                          <strong>{{ input.label }}</strong><span
                            v-if="input.required"
                            aria-hidden="true"
                          > *</span>
                          <span
                            v-if="input.definition"
                            class="text-gray-600"
                          > - {{ input.definition }}</span>
                          <template v-if="input.evidenceSource">
                            <br>
                            <span class="fr-text--xs text-gray-600">
                              Attestée par : {{ input.evidenceSource.label }}
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
                    En plus du résultat, cette règle produit une trace d'explication
                    <template
                      v-for="(output, i) in explanationOutputs"
                      :key="output.id"
                    >
                      <template v-if="i > 0">
                        ,
                      </template><code class="fr-text--xs">{{ output.id }}</code>
                    </template>
                    - utile pour expliquer un refus.
                  </p>
                </div>

                <!-- Mappings opérationnels recensés (jamais rédigés par le catalogue) -->
                <div
                  v-if="rule.operationalMappings?.length"
                  class="space-y-3"
                >
                  <h2 class="fr-h6 m-0">
                    Mappings opérationnels recensés
                  </h2>
                  <p class="fr-text--sm text-gray-600 m-0 max-w-2xl">
                    Le catalogue ne rédige pas de dictionnaire de correspondances : il recense des
                    mappings qui tournent, avec leur mainteneur et leur statut d'intégration continue.
                  </p>
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
                        {{ mapping.from }} → {{ mapping.to }} · maintenu par {{ mapping.maintainedBy }}
                        <template v-if="mapping.ciStatus && mapping.ciStatus !== 'unknown'"> · CI : {{ mapping.ciStatus === 'passing' ? 'au vert' : 'en échec' }}</template>
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
                    Note technique : champs sans équivalent dans la fiche source
                    <template v-if="rule.metadataSourcePath">
                      ({{ rule.metadataSourcePath }})
                    </template>
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
                    Métadonnées principales
                  </h2>
                  <dl class="m-0 p-0 divide-y divide-gray-100">
                    <div class="px-4 py-3">
                      <dt class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 m-0">
                        Producteur
                      </dt>
                      <dd class="m-0 mt-0.5 p-0 fr-text--sm mb-0 text-gray-900">
                        {{ rule.organism.name }}
                      </dd>
                    </div>
                    <div class="px-4 py-3">
                      <dt class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 m-0">
                        Identifiant
                      </dt>
                      <dd class="m-0 mt-0.5 p-0">
                        <code class="fr-text--xs mb-0 bg-gray-100 px-1.5 py-0.5 rounded">{{ rule.id }}</code>
                      </dd>
                    </div>
                    <div class="px-4 py-3">
                      <dt class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 m-0">
                        Dernière mise à jour
                      </dt>
                      <dd class="m-0 p-0 mt-0.5 fr-text--sm mb-0 text-gray-900">
                        {{ formatDate(rule.updatedAt) }}
                      </dd>
                    </div>
                    <div
                      v-if="primaryReference"
                      class="px-4 py-3"
                    >
                      <dt class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 m-0">
                        Base légale principale
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
                    {{ rule.opposability === 'opposable' ? 'Résultat opposable' : 'Résultat indicatif' }}
                  </p>
                  <p class="fr-text--xs mb-0 text-gray-700 m-0">
                    {{ rule.opposability === 'opposable'
                      ? 'Cette modélisation fait foi : un agent ou un usager peut s\'en prévaloir.'
                      : 'Aide à la lecture du droit, sans valeur de décision. La décision opposable reste prise par l\'administration.' }}
                  </p>
                </div>
                <div
                  v-if="rule.certification && certifyingOrganism"
                  class="border border-[#b8e6c5] rounded bg-[#f0fbf3] p-4 space-y-2"
                >
                  <h3 class="flex items-center gap-2 fr-text--sm mb-0 font-bold m-0 text-[#18753c]">
                    <span
                      class="fr-icon-success-fill fr-icon--sm"
                      aria-hidden="true"
                    />
                    Résultats certifiés
                  </h3>
                  <p class="fr-text--xs mb-0 text-gray-700 m-0">
                    Certifiés par <strong>{{ certifyingOrganism.acronym ?? certifyingOrganism.name }}</strong>
                    le {{ formatDate(rule.certification.at) }}.
                  </p>
                  <p
                    v-if="rule.certification.ref"
                    class="fr-text--xs mb-0 text-gray-600 m-0"
                  >
                    Référence : {{ rule.certification.ref }}
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
                    Bases légales
                  </h2>
                  <p class="fr-text--sm text-gray-700 m-0">
                    Les textes officiels qui fondent cette règle. Chaque référence renvoie
                    à sa source consolidée sur Légifrance.
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
                <div class="space-y-2 max-w-2xl">
                  <h2 class="fr-h5 m-0">
                    Aperçu de calcul
                  </h2>
                  <p class="fr-text--sm mb-0 text-gray-700 m-0">
                    Un cas d'exemple illustre le résultat de la règle et le détail de son
                    calcul, étape par étape. Le résultat est <strong>indicatif</strong>&nbsp;:
                    la décision opposable reste prise par l'administration productrice.
                  </p>
                </div>

                <!-- Aperçu exécuté en direct : moteur Publicodes chargé dans la page -->
                <RuleLiveCalculation
                  v-if="rule.slug === 'entreprise-innovation'"
                  :opposability="rule.opposability"
                  :source="primaryReference?.label"
                />

                <!-- Régime implémentation : calcul délégué au moteur du producteur (OpenFisca) -->
                <RuleOpenfiscaCalculation
                  v-else-if="rule.slug === 'prime-activite-openfisca'"
                  :entities="(rule.engineProfile?.openfisca?.entities as string[] | undefined)"
                  :source-url="rule.sourceUrl"
                />

                <!-- Aperçu pré-calculé : moteur ouvert / exécutable -->
                <template v-else-if="preview">
                  <!-- Situation d'exemple -->
                  <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 md:p-5">
                    <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0 mb-3">
                      Situation d'exemple
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
                    :computed-at="formatDate(preview.computedAt)"
                  />

                  <!-- Formulaire généré depuis la fiche, exécuté contre l'API déclarée -->
                  <RuleTryIt
                    v-if="tryItForm"
                    :form="tryItForm"
                    :source-path="rule.metadataSourcePath"
                  />

                  <p
                    v-if="rule.officialSimulatorUrl"
                    class="fr-text--sm mb-0 text-gray-600 m-0"
                  >
                    Pour une estimation personnalisée, utilisez le
                    <a
                      :href="rule.officialSimulatorUrl"
                      target="_blank"
                      rel="noopener"
                      class="fr-link"
                    >
                      simulateur officiel de {{ rule.organism.acronym ?? rule.organism.name }}</a>.
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
                        Calcul opéré en interne
                      </h3>
                      <p class="fr-text--sm mb-0 text-gray-700 m-0 max-w-2xl">
                        Le moteur de cette règle reste interne à {{ rule.organism.acronym ?? rule.organism.name }}.
                        Le catalogue n'expose donc pas d'aperçu de calcul intégré, mais référence
                        les conditions, la base légale et, le cas échéant, l'accès au service officiel.
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
                      Simulateur officiel
                    </a>
                    <NuxtLink
                      v-if="rule.apiUrl"
                      :to="`/mvp/regles/${rule.slug}?tab=api`"
                      class="fr-btn fr-btn--tertiary fr-icon-terminal-box-line fr-btn--icon-left"
                    >
                      Voir l'API d'exécution
                    </NuxtLink>
                  </div>
                </div>
              </section>

              <section
                v-else-if="activeTab === 'api'"
                class="space-y-8"
              >
                <div class="space-y-2 max-w-2xl">
                  <h2 class="fr-h5 m-0">
                    Intégrer cette règle
                  </h2>
                  <p class="fr-text--sm mb-0 text-gray-700 m-0">
                    La règle s'appelle comme un service&nbsp;: une situation en entrée,
                    un résultat en sortie. Les contrats sont stables et versionnés pour
                    garantir la reproductibilité.
                  </p>
                </div>

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
                        {{ mode.available ? 'Disponible' : 'Indisponible' }}
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
                    API de calcul
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
                      Paramètres d'entrée
                    </p>
                    <div class="rounded-lg border border-gray-200 overflow-hidden">
                      <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 font-semibold px-3 py-2">
                              Champ
                            </th>
                            <th class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 font-semibold px-3 py-2">
                              Type
                            </th>
                            <th class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 font-semibold px-3 py-2">
                              Description
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
                        Exemple de requête
                      </p>
                      <pre class="m-0 bg-[#1b1b35] text-gray-100 rounded-lg p-4 text-xs overflow-auto"><code>{{ apiDoc.requestExample }}</code></pre>
                    </div>
                    <div class="space-y-1.5">
                      <p class="fr-text--xs mb-0 uppercase tracking-wide text-gray-500 m-0">
                        Exemple de réponse
                      </p>
                      <pre class="m-0 bg-[#1b1b35] text-gray-100 rounded-lg p-4 text-xs overflow-auto"><code>{{ apiDoc.responseExample }}</code></pre>
                    </div>
                  </div>

                  <p class="fr-text--xs mb-0 text-gray-500 m-0">
                    Schéma illustratif dérivé d'un cas d'exemple. La spécification complète
                    (OpenAPI) est publiée avec la règle.
                  </p>
                </div>
              </section>

              <section
                v-else-if="activeTab === 'traceability'"
                class="space-y-6"
              >
                <div class="space-y-2 max-w-2xl">
                  <h2 class="fr-h5 m-0">
                    Traçabilité loi ↔ code
                  </h2>
                  <p class="fr-text--sm mb-0 text-gray-700 m-0">
                    Chaque fragment du texte réglementaire est mis en regard du code qui
                    l'implémente. Cet appariement rend la modélisation
                    <strong>auditable</strong>&nbsp;: on peut vérifier que le calcul
                    respecte le droit, ligne à ligne.
                  </p>
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
                    Code source complet&nbsp;:
                    <a
                      :href="rule.sourceUrl"
                      target="_blank"
                      rel="noopener"
                      class="fr-link"
                    >{{ rule.sourceUrl }}</a>
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
                          Bases légales référencées
                        </h3>
                        <p class="fr-text--sm mb-0 text-gray-700 m-0">
                          L'appariement détaillé texte ↔ code n'est pas publié pour cette
                          règle (moteur interne ou traçabilité non encore exposée). Les
                          textes qui la fondent restent référencés.
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
                class="space-y-6"
              >
                <div class="space-y-2 max-w-2xl">
                  <h2 class="fr-h5 m-0">
                    Cas de tests
                  </h2>
                  <p class="fr-text--sm mb-0 text-gray-700 m-0">
                    Des scénarios « situation → résultat attendu » documentent le comportement
                    de la règle. Ils servent de <strong>garantie de confiance</strong> entre le
                    producteur et les réutilisateurs, et sont rejoués à chaque nouvelle version.
                  </p>
                </div>

                <template v-if="tests.length">
                  <!-- Vérification automatique : rejeu des cas + contrôle de dérive fiche/API -->
                  <div
                    v-if="autoVerification"
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
                        {{ autoVerification.drift ? 'Dérive détectée' : autoVerification.allPassing ? 'Vérifiée automatiquement' : 'Vérification en échec' }}
                      </span>
                      <span class="fr-text--sm mb-0 text-gray-700">
                        Dernier contrôle automatique le {{ formatDate(autoVerification.checkedAt) }}.
                      </span>
                    </div>
                    <p
                      v-if="autoVerification.drift"
                      class="fr-text--sm mb-0 text-gray-700 m-0"
                    >
                      L'API du producteur n'accepte plus les paramètres déclarés par la fiche
                      (<code class="fr-text--xs">{{ autoVerification.declaredNotAccepted.join(', ') }}</code>).
                      Elle attend désormais
                      <code class="fr-text--xs">{{ autoVerification.acceptedNotDeclared.slice(0, 3).join(', ') }}…</code>
                      La fiche de référencement doit être mise à jour par le producteur&nbsp;: c'est
                      exactement le type d'écart que la vérification continue rend visible.
                    </p>
                    <p
                      v-else
                      class="fr-text--sm mb-0 text-gray-700 m-0"
                    >
                      {{ autoVerification.passing }}/{{ autoVerification.total }} cas rejoués conformes
                      contre l'API déclarée dans la fiche.
                    </p>
                  </div>

                  <!-- Barre de synthèse : statuts + sources -->
                  <div class="rounded-lg border border-gray-200 overflow-hidden">
                    <div class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200">
                      <div class="p-4">
                        <p class="text-2xl font-bold text-gray-900 m-0 tabular-nums">
                          {{ testStats.total }}
                        </p>
                        <p class="fr-text--xs mb-0 text-gray-600 m-0">
                          cas publiés
                        </p>
                      </div>
                      <div class="p-4">
                        <p class="text-2xl font-bold text-[#18753c] m-0 tabular-nums">
                          {{ testStats.valide }}
                        </p>
                        <p class="fr-text--xs mb-0 text-gray-600 m-0">
                          validés
                        </p>
                      </div>
                      <div class="p-4">
                        <p class="text-2xl font-bold text-[#716043] m-0 tabular-nums">
                          {{ testStats.enRevue }}
                        </p>
                        <p class="fr-text--xs mb-0 text-gray-600 m-0">
                          en revue
                        </p>
                      </div>
                      <div class="p-4">
                        <p
                          class="text-2xl font-bold m-0 tabular-nums"
                          :class="testStats.echec ? 'text-[#ce0500]' : 'text-gray-400'"
                        >
                          {{ testStats.echec }}
                        </p>
                        <p class="fr-text--xs mb-0 text-gray-600 m-0">
                          en échec
                        </p>
                      </div>
                    </div>
                    <div class="border-t border-gray-200 bg-gray-50 px-4 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-1">
                      <span class="inline-flex items-center gap-1.5 fr-text--xs mb-0 text-gray-700">
                        <span
                          class="fr-icon-refresh-line fr-icon--xs text-[#000091]"
                          aria-hidden="true"
                        />
                        Rejoués en intégration continue à chaque version
                      </span>
                      <span
                        v-if="testStats.administration"
                        class="inline-flex items-center gap-1.5 fr-text--xs mb-0 text-gray-600"
                      >
                        <span
                          class="fr-icon-bank-line fr-icon--xs"
                          aria-hidden="true"
                        />
                        {{ testStats.administration }} de l'administration
                      </span>
                      <span
                        v-if="testStats.communaute"
                        class="inline-flex items-center gap-1.5 fr-text--xs mb-0 text-gray-600"
                      >
                        <span
                          class="fr-icon-team-line fr-icon--xs"
                          aria-hidden="true"
                        />
                        {{ testStats.communaute }} de la communauté
                      </span>
                    </div>
                  </div>

                  <ul class="list-none p-0 m-0 space-y-3">
                    <li
                      v-for="t in tests"
                      :key="t.id"
                    >
                      <RuleTestCase :test="t" />
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
                        Pas de cas de test publics
                      </h3>
                      <p class="fr-text--sm mb-0 text-gray-700 m-0">
                        Cette règle ne publie pas ses jeux de tests. Cela ne signifie pas
                        qu'elle n'est pas validée&nbsp;: {{ rule.organism.acronym ?? rule.organism.name }}
                        peut effectuer cette validation en interne, sans en exposer le détail
                        (sensibilité des données, charge de maintenance).
                      </p>
                    </div>
                  </div>
                  <p
                    v-if="rule.certification"
                    class="fr-text--xs mb-0 text-gray-600 m-0 pl-9"
                  >
                    Cette règle dispose toutefois d'une certification de ses résultats par l'administration productrice.
                  </p>
                </div>
              </section>

              <section
                v-else-if="activeTab === 'versions'"
                class="space-y-6"
              >
                <div class="space-y-2 max-w-2xl">
                  <h2 class="fr-h5 m-0">
                    Historique des versions
                  </h2>
                  <p class="fr-text--sm mb-0 text-gray-700 m-0">
                    Chaque évolution de la règle est versionnée et datée. On sait ainsi
                    quel calcul s'appliquait à une date donnée, et quelle évolution
                    réglementaire l'a motivé.
                  </p>
                </div>

                <p
                  v-if="!versions.length"
                  class="fr-text--sm mb-0 text-gray-600 m-0"
                >
                  Aucune version antérieure publiée.
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
                            label: string;
                            badgeClass: string;
                          }).badgeClass"
                        >{{ (v.kindMeta as {
                          label: string;
                          badgeClass: string;
                        }).label }}</span>
                        <span
                          v-if="v.isCurrent"
                          class="fr-badge fr-badge--sm fr-badge--green-emeraude"
                        >Version courante</span>
                        <span class="fr-text--xs mb-0 text-gray-500">{{ formatDate(v.publishedAt) }}</span>
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
                        Déclenchée par
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
      Règle introuvable
    </h1>
    <p class="text-gray-700">
      Aucune règle ne correspond à l'identifiant <code>{{ slug }}</code>.
    </p>
    <NuxtLink
      to="/mvp/regles/"
      class="fr-btn fr-btn--secondary fr-icon-arrow-left-line fr-btn--icon-left"
    >
      Retour au catalogue
    </NuxtLink>
  </section>
</template>
