<script setup lang="ts">
import type { Rule } from '~/types/rule'

const props = withDefaults(defineProps<{
  rule: Rule
  /**
   * - `default` : carte de listing lisible (par défaut, catalogue principal)
   * - `compact` : ligne dense (idéale pour swimlane / tableaux denses)
   */
  variant?: 'default' | 'compact'
}>(), {
  variant: 'default',
})

const testsCount = computed(() => ruleTestsMock.filter(t => t.ruleId === props.rule.id).length)

const domain = computed(() => domainMeta(props.rule.domain))
const qualifiedTags = computed(() => qualifiedTagsFor(props.rule))
const engineTag = computed(() => engineTagFor(props.rule))

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
const updatedLabel = computed(() => dateFormatter.format(new Date(props.rule.updatedAt)))

/**
 * Capacités activées sur la fiche, présentées comme « ce que la règle permet ».
 * Ordonnées de la plus engageante (exécution) à la plus basique (traçabilité).
 */
const availableServices = computed(() => {
  const c = props.rule.capabilities ?? {}
  const services: { icon: string, label: string }[] = []
  if (props.rule.apiUrl)
    services.push({ icon: 'fr-icon-terminal-box-line', label: 'API' })
  if (c.hasCalculationPreview)
    services.push({ icon: 'fr-icon-calculator-line', label: 'Aperçu de calcul' })
  if (c.hasLegalTraceability)
    services.push({ icon: 'fr-icon-scales-3-line', label: 'Traçabilité' })
  if (c.hasPublicTestCases)
    services.push({ icon: 'fr-icon-checkbox-circle-line', label: `${testsCount.value || 'Cas de'} tests` })
  return services
})
</script>

<template>
  <!-- COMPACT -->
  <article
    v-if="variant === 'compact'"
    class="flex items-center gap-3 p-2 border border-gray-200 rounded bg-white"
    :aria-labelledby="`rule-${rule.id}-title`"
  >
    <MaturityBadge :level="rule.maturity" />
    <NatureBadge :nature="rule.nature" />
    <NuxtLink
      :id="`rule-${rule.id}-title`"
      :to="`/mvp/regles/${rule.slug}`"
      class="fr-link flex-1 truncate"
    >
      {{ rule.title }}
    </NuxtLink>
    <EngineTag :engine="rule.engine" />
  </article>

  <!-- DEFAULT (listing principal, une carte par ligne) -->
  <article
    v-else
    class="group relative border border-gray-200  bg-white hover:bg-gray-50"
    :aria-labelledby="`rule-${rule.id}-title`"
  >
    <div class="flex flex-col md:flex-row md:items-stretch">
      <!-- Colonne principale : identité + titre + description + services -->
      <div class="flex-1 min-w-0 p-5 md:p-6 space-y-3">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span class="fr-text--xs mb-0 font-bold uppercase tracking-wide text-gray-700">
            {{ rule.organism.acronym ?? rule.organism.name }}
          </span>
          <span
            class="text-gray-300"
            aria-hidden="true"
          >·</span>
          <span class="inline-flex items-center gap-1 fr-text--xs mb-0 text-gray-600">
            <span
              :class="domain.icon"
              class="fr-icon--xs"
              aria-hidden="true"
            />
            {{ domain.label }}
          </span>
        </div>

        <div class="space-y-1.5">
          <h3
            :id="`rule-${rule.id}-title`"
            class="fr-h6 m-0 leading-snug"
          >
            <NuxtLink
              :to="`/mvp/regles/${rule.slug}`"
              class="bg-none text-gray-900 before:absolute before:inset-0 before:content-['']"
            >
              {{ rule.title }}
            </NuxtLink>
          </h3>
          <p class="fr-text--sm text-gray-700 m-0 max-w-2xl">
            {{ rule.shortDescription }}
          </p>
        </div>

        <!-- Services activés : ce que la règle permet concrètement -->
        <ul
          v-if="availableServices.length"
          class="flex flex-wrap items-center gap-x-4 gap-y-1 list-none p-0 m-0"
        >
          <li
            v-for="service in availableServices"
            :key="service.label"
            class="inline-flex items-center gap-1.5 fr-text--xs mb-0 text-gray-700"
          >
            <span
              :class="service.icon"
              class="fr-icon--sm"
              aria-hidden="true"
            />
            {{ service.label }}
          </li>
        </ul>
        <p
          v-else
          class="fr-text--xs mb-0 text-gray-500 italic m-0"
        >
          Métadonnées de référencement
        </p>
      </div>

      <!-- Rail de qualification : tags « axe : valeur » + version/date -->
      <div class="shrink-0 md:w-60 p-5 md:p-6 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col gap-3 bg-gray-50/60">
        <ul class="flex flex-wrap md:flex-col md:items-start gap-2 list-none p-0 m-0">
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
          <li>
            <QualifiedTag
              :axis="engineTag.axis"
              :value="engineTag.value"
              :tone="engineTag.tone"
              :hint="engineTag.hint"
            />
          </li>
        </ul>
        <p class="fr-text--xs mb-0 text-gray-500 m-0 mt-auto">
          v{{ rule.version }} · maj {{ updatedLabel }}
        </p>
      </div>
    </div>
  </article>
</template>
