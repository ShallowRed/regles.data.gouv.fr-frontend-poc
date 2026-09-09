/**
 * Multilingual literals for the catalogue entries described on the front side.
 *
 * The entries backed by a `metadata.jsonld` record carry their translations in the record
 * itself (see `jsonld-adapter.ts`). The three entries described here, having no record in
 * the data repository yet, carry them in the mock objects: a translated string is written
 * `{ fr: '…', en: '…' }` instead of a plain string, and `localizeDeep` resolves every such
 * object for one locale so that display code keeps receiving plain strings.
 *
 * Selection rule, identical to the JSON-LD adapter: requested language, then French, then
 * the first available literal. A string left plain is the same text in every language.
 */

export interface LocalizedText {
  fr: string
  en?: string
}

/** Shape of a value tree where any string may be replaced by a `LocalizedText`. */
export type Multilingual<T>
  = T extends string ? T | LocalizedText
    : T extends (infer U)[] ? Multilingual<U>[]
      : T extends object ? { [K in keyof T]: Multilingual<T[K]> }
        : T

const LOCALE_KEYS = ['fr', 'en']

export function isLocalizedText(value: unknown): value is LocalizedText {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return false
  const entries = Object.entries(value)
  return entries.some(([key]) => key === 'fr')
    && entries.every(([key, item]) => LOCALE_KEYS.includes(key) && typeof item === 'string')
}

export function localizeText(value: LocalizedText | string, locale: string): string {
  if (typeof value === 'string')
    return value
  const record = value as Record<string, string | undefined>
  return record[locale] ?? record.fr ?? Object.values(record).find(Boolean) ?? ''
}

function resolve(value: unknown, locale: string): unknown {
  if (isLocalizedText(value))
    return localizeText(value, locale)
  if (Array.isArray(value))
    return value.map(item => resolve(item, locale))
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolve(item, locale)]))
  return value
}

export function localizeDeep<T>(value: Multilingual<T>, locale: string): T {
  return resolve(value, locale) as T
}

/** Caches a per-locale build: the catalogue content is static for a given locale. */
export function byLocale<T>(build: (locale: string) => T): (locale: string) => T {
  const cache = new Map<string, T>()
  return (locale: string) => {
    const cached = cache.get(locale)
    if (cached !== undefined)
      return cached
    const built = build(locale)
    cache.set(locale, built)
    return built
  }
}
