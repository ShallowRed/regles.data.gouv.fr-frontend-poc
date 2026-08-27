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
  label: string
}

/** Labels au masculin : ils qualifient le modèle (« modèle ouvert »), pas la règle. */
const natureMeta: Record<RuleNature, { label: string, badgeClass: string, meaning: string }> = {
  ouverte: {
    label: 'Ouvert',
    badgeClass: 'fr-badge--green-menthe',
    meaning: 'Code source et artefacts de vérification publiquement consultables.',
  },
  hybride: {
    label: 'Hybride',
    badgeClass: 'fr-badge--yellow-tournesol',
    meaning: 'Publication partielle : documentation et API exposées, certaines briques restent internes.',
  },
  fermee: {
    label: 'Fermé',
    badgeClass: 'fr-badge--beige-gris-galet',
    meaning: 'Moteur interne à l\'administration, non publié en source ouverte.',
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
  { key: 'description', label: 'Présentation' },
  { key: 'legal', label: 'Bases légales' },
]

const endTabs: RuleFicheTab[] = [{ key: 'versions', label: 'Versions' }]

export function tabsFor(rule: Rule): RuleFicheTab[] {
  const tabs = [...baseTabs]
  const caps = rule.capabilities ?? {}

  if (caps.hasCalculationPreview || rule.officialSimulatorUrl) {
    tabs.push({ key: 'simulation', label: 'Aperçu de calcul' })
  }

  if (caps.hasApiDocumentation || rule.apiUrl) {
    tabs.push({ key: 'api', label: 'API' })
  }

  if (caps.hasLegalTraceability || rule.sourceUrl) {
    tabs.push({ key: 'traceability', label: 'Traçabilité' })
  }

  if (caps.hasPublicTestCases) {
    tabs.push({ key: 'tests', label: 'Cas de tests' })
  }

  return [...tabs, ...endTabs]
}
