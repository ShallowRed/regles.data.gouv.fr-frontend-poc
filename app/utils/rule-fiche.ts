import type { Rule, RuleNature } from '~/types'

export type RuleFicheTabKey
  = | 'description'
    | 'legal'
    | 'simulation'
    | 'api'
    | 'traceability'
    | 'tests'
    | 'versions'

export interface RuleFicheTab {
  key: RuleFicheTabKey
  labelKey: string
}

/** Libellés au masculin : ils qualifient le modèle (« modèle ouvert »), pas la règle. */
const natureMeta: Record<RuleNature, { labelKey: string, badgeClass: string, meaningKey: string }> = {
  ouverte: {
    labelKey: 'nature.ouverte.label',
    badgeClass: 'fr-badge--green-menthe',
    meaningKey: 'nature.ouverte.meaning',
  },
  hybride: {
    labelKey: 'nature.hybride.label',
    badgeClass: 'fr-badge--yellow-tournesol',
    meaningKey: 'nature.hybride.meaning',
  },
  fermee: {
    labelKey: 'nature.fermee.label',
    badgeClass: 'fr-badge--beige-gris-galet',
    meaningKey: 'nature.fermee.meaning',
  },
}

export const ruleNatureMeta = (nature: RuleNature) => natureMeta[nature]

/**
 * Affichage d'une version : préfixe « v » seulement pour les versions numériques (semver).
 * Les règles en régime implémentation portent des versions descriptives
 * (« openfisca-france 169.15.0 », « publication du 17 septembre 2025 ») affichées telles quelles.
 */
export function formatRuleVersion(version: string): string {
  return /^\d/.test(version) ? `v${version}` : version
}

const baseTabs: RuleFicheTab[] = [
  { key: 'description', labelKey: 'fiche.tabs.description' },
  { key: 'legal', labelKey: 'fiche.tabs.legal' },
]

const endTabs: RuleFicheTab[] = [{ key: 'versions', labelKey: 'fiche.tabs.versions' }]

export function tabsFor(rule: Rule): RuleFicheTab[] {
  const tabs = [...baseTabs]
  const caps = rule.capabilities ?? {}

  if (caps.hasCalculationPreview || rule.officialSimulatorUrl) {
    tabs.push({ key: 'simulation', labelKey: 'fiche.tabs.simulation' })
  }

  if (caps.hasApiDocumentation || rule.apiUrl) {
    tabs.push({ key: 'api', labelKey: 'fiche.tabs.api' })
  }

  if (caps.hasLegalTraceability || rule.sourceUrl) {
    tabs.push({ key: 'traceability', labelKey: 'fiche.tabs.traceability' })
  }

  if (caps.hasPublicTestCases) {
    tabs.push({ key: 'tests', labelKey: 'fiche.tabs.tests' })
  }

  return [...tabs, ...endTabs]
}
