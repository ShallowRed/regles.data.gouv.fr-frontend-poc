/**
 * Présentation des qualifications d'une règle sous forme de tags « axe : valeur ».
 * Source de vérité partagée entre la carte de listing et la fiche, pour un
 * vocabulaire pédagogique cohérent.
 *
 * Les champs portent des clés de traduction : `useQualifiedTags()` les résout.
 */
import type { CertificationRegime, Rule } from '~/types/rule'
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

const regimeSpec: Record<CertificationRegime, Omit<QualifiedTagSpec, 'axisKey'>> = {
  frontiere: {
    valueKey: 'tags.results.frontiere',
    tone: 'green',
    hintKey: 'tags.results.hintFrontiere',
  },
  implementation: {
    valueKey: 'tags.results.implementation',
    tone: 'blue',
    hintKey: 'tags.results.hintImplementation',
  },
  referencement: {
    valueKey: 'tags.results.referencement',
    tone: 'grey',
    hintKey: 'tags.results.hintReferencement',
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

/** Tag du régime de certification, rendu comme ses voisins. */
export function certificationTagFor(rule: Rule): QualifiedTagSpec | null {
  const regime = rule.certificationRegime
  return regime ? { axisKey: 'tags.results.axis', ...regimeSpec[regime] } : null
}
