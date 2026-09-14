/**
 * Présentation des qualifications d'une règle sous forme de tags « axe : valeur ».
 * Source de vérité partagée entre la carte de listing et la fiche, pour un
 * vocabulaire pédagogique cohérent.
 *
 * Les champs portent des clés de traduction : `useQualifiedTags()` les résout.
 */
import type { CertificationLevel, Rule } from '~/types/rule'
import { maturityMeta } from '~/utils/maturity'

export interface QualifiedTagSpec {
  axisKey: string
  valueKey: string
  tone: 'neutral' | 'green' | 'blue' | 'purple' | 'yellow' | 'grey'
  hintKey: string
}

const maturityTone: Record<string, QualifiedTagSpec['tone']> = {
  N0: 'grey',
  N1: 'blue',
  N2: 'purple',
  N3: 'green',
}

const natureSpec: Record<Rule['nature'], Omit<QualifiedTagSpec, 'axisKey'>> = {
  ouverte: {
    valueKey: 'tags.model.ouverte',
    tone: 'green',
    hintKey: 'tags.model.hintOuverte',
  },
  hybride: {
    valueKey: 'tags.model.hybride',
    tone: 'yellow',
    hintKey: 'tags.model.hintHybride',
  },
  fermee: {
    valueKey: 'tags.model.fermee',
    tone: 'grey',
    hintKey: 'tags.model.hintFermee',
  },
}

const engineValueKey: Record<Rule['engine'], string> = {
  publicodes: 'engine.publicodes',
  openfisca: 'engine.openfisca',
  catala: 'engine.catala',
  proprietaire: 'tags.engine.proprietaire',
  autre: 'tags.engine.autre',
}

const guaranteeSpec: Record<CertificationLevel, Omit<QualifiedTagSpec, 'axisKey'>> = {
  'certified': {
    valueKey: 'tags.guarantee.certified',
    tone: 'green',
    hintKey: 'tags.guarantee.hintCertified',
  },
  'self-assessed': {
    valueKey: 'tags.guarantee.selfAssessed',
    tone: 'blue',
    hintKey: 'tags.guarantee.hintSelfAssessed',
  },
}

/** Les deux qualifications structurantes : ce que la règle permet, sa publication. */
export function qualifiedTagsFor(rule: Rule): QualifiedTagSpec[] {
  const mat = maturityMeta(rule.maturity)
  return [
    {
      axisKey: 'tags.rule.axis',
      valueKey: `tags.rule.${mat.level}`,
      tone: maturityTone[rule.maturity] ?? 'grey',
      hintKey: mat.meaningKey,
    },
    {
      axisKey: 'tags.model.axis',
      ...natureSpec[rule.nature],
    },
  ]
}

/** Tag dédié au moteur de calcul (présenté à part, info plus technique). */
export function engineTagFor(rule: Rule): QualifiedTagSpec {
  return {
    axisKey: 'tags.engine.axis',
    valueKey: engineValueKey[rule.engine],
    tone: 'neutral',
    hintKey: 'tags.engine.hint',
  }
}

/** Tag de l'engagement du producteur (ADR-0002) ; aucun tag quand la règle est référencée. */
export function guaranteeTagFor(rule: Rule): QualifiedTagSpec | null {
  const level = rule.certification?.level
  return level ? { axisKey: 'tags.guarantee.axis', ...guaranteeSpec[level] } : null
}

/** Tag établi par le registre depuis ses assertions EARL (ADR-0006) ; aucun tag sans exécution. */
export function resultsTagFor(assertions: { total: number, failing: number }): QualifiedTagSpec | null {
  if (assertions.total === 0)
    return null
  return assertions.failing === 0
    ? { axisKey: 'tags.results.axis', valueKey: 'tags.results.tested', tone: 'green', hintKey: 'tags.results.hintTested' }
    : { axisKey: 'tags.results.axis', valueKey: 'tags.results.gap', tone: 'yellow', hintKey: 'tags.results.hintGap' }
}
