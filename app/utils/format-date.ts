/** Date ISO → format long français (« 13 août 2026 »). */
export function formatDateFr(value: string | undefined): string {
  if (!value)
    return '-'
  try {
    return new Date(value).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  catch {
    return value
  }
}
