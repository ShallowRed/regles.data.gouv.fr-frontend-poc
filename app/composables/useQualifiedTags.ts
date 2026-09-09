import type { QualifiedTagSpec } from '~/utils/rule-tags'

export interface QualifiedTagView {
  axis: string
  value: string
  tone: QualifiedTagSpec['tone']
  hint: string
}

/**
 * Résout les clés d'un `QualifiedTagSpec` dans la locale active.
 * Le hint reçoit la valeur du tag en paramètre `value` (utilisé par le tag moteur).
 */
export function useQualifiedTags() {
  const { t } = useI18n()

  function resolveTag(spec: QualifiedTagSpec): QualifiedTagView {
    const value = t(spec.valueKey)
    return {
      axis: t(spec.axisKey),
      value,
      tone: spec.tone,
      hint: t(spec.hintKey, { value }),
    }
  }

  return { resolveTag }
}
