import { formatDateLong, formatDateShort, formatMonthYear } from '~/utils/format-date'

/** Date formatters bound to the active locale tag (fr-FR, en-GB). */
export function useLocaleDate() {
  const { locale, locales } = useI18n()
  const tag = computed(() =>
    locales.value.find(entry => entry.code === locale.value)?.language ?? locale.value,
  )
  return {
    formatLong: (value?: string) => formatDateLong(value, tag.value),
    formatShort: (value?: string) => formatDateShort(value, tag.value),
    formatMonthYear: (value?: string) => formatMonthYear(value, tag.value),
  }
}
