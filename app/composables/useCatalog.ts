import type { RuleTest } from '~/types'
import { byLocale, localizeDeep } from '~/utils/localized-text'

/** Test cases hold data only, so they are localized here rather than in their module. */
const ruleTestsFor = byLocale(locale => localizeDeep<RuleTest[]>(ruleTestsSource, locale))

/**
 * Catalogue content resolved for the locale of the current route.
 *
 * Entries backed by a metadata.jsonld record are rebuilt by the JSON-LD adapter in that
 * locale; entries described on the front side have their `{ fr, en }` literals resolved.
 * Both are memoized per locale, so the prerendered pages of a locale share one build.
 */
export function useCatalog() {
  const { locale } = useI18n()

  return {
    rules: computed(() => rulesFor(locale.value)),
    ruleBySlug: computed(() => ruleBySlugFor(locale.value)),
    ruleTests: computed(() => ruleTestsFor(locale.value)),
    ruleVersions: computed(() => ruleVersionsFor(locale.value)),
    rulePreviews: computed(() => rulePreviewsFor(locale.value)),
    organisms: computed(() => organismsFor(locale.value)),
    legalReferences: computed(() => legalReferencesFor(locale.value)),
  }
}
