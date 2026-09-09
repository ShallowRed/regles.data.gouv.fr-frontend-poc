/** Date ISO → format long localisé (« 13 août 2026 », "13 August 2026"). */
export function formatDateLong(value: string | undefined, locale: string): string {
  return format(value, locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

/** Date ISO → format court localisé (« 13 août 2026 », "13 Aug 2026"). */
export function formatDateShort(value: string | undefined, locale: string): string {
  return format(value, locale, { year: 'numeric', month: 'short', day: 'numeric' })
}

/** Date ISO → mois et année (« août 2026 », "August 2026"). */
export function formatMonthYear(value: string | undefined, locale: string): string {
  return format(value, locale, { year: 'numeric', month: 'long' })
}

function format(value: string | undefined, locale: string, options: Intl.DateTimeFormatOptions): string {
  if (!value)
    return '-'
  try {
    return new Date(value).toLocaleDateString(locale, options)
  }
  catch {
    return value
  }
}
