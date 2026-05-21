/**
 * Présentation des qualifications d'une règle sous forme de tags « axe : valeur ».
 * Source de vérité partagée entre la carte de listing et la fiche, pour un
 * vocabulaire pédagogique cohérent.
 */
import type { Rule } from '~/types/rule'
import { maturityMeta } from '~/utils/maturity'

export interface QualifiedTagSpec {
  axis: string
  value: string
  tone: 'neutral' | 'green' | 'blue' | 'purple' | 'yellow' | 'grey'
  hint: string
}

const maturityTone: Record<string, QualifiedTagSpec['tone']> = {
  N0: 'grey',
  N1: 'blue',
  N2: 'purple',
  N3: 'green',
}

const natureSpec: Record<Rule['nature'], { value: string, tone: QualifiedTagSpec['tone'], hint: string }> = {
  ouverte: {
    value: 'ouvert',
    tone: 'green',
    hint: 'Le code et les artefacts de vérification sont publiquement consultables.',
  },
  hybride: {
    value: 'partiel',
    tone: 'yellow',
    hint: 'Documentation et API exposées ; certaines briques restent internes.',
  },
  fermee: {
    value: 'fermé',
    tone: 'grey',
    hint: 'Moteur interne à l\'administration, non publié en source ouverte.',
  },
}

const opposabilitySpec: Record<Rule['opposability'], { value: string, tone: QualifiedTagSpec['tone'], hint: string }> = {
  opposable: {
    value: 'opposable',
    tone: 'blue',
    hint: 'Cette modélisation fait foi : un agent ou un usager peut s\'en prévaloir.',
  },
  indicatif: {
    value: 'indicative',
    tone: 'neutral',
    hint: 'Aide à la lecture, sans valeur de source de droit.',
  },
}

const engineLabel: Record<Rule['engine'], string> = {
  publicodes: 'Publicodes',
  openfisca: 'OpenFisca',
  catala: 'Catala',
  proprietaire: 'propriétaire',
  autre: 'autre',
}

/** Les trois qualifications structurantes : ce que la règle permet, sa publication, sa portée. */
export function qualifiedTagsFor(rule: Rule): QualifiedTagSpec[] {
  const mat = maturityMeta(rule.maturity)
  return [
    {
      axis: 'règle',
      value: mat.label.toLowerCase(),
      tone: maturityTone[rule.maturity] ?? 'grey',
      hint: mat.meaning,
    },
    {
      axis: 'modèle',
      value: natureSpec[rule.nature].value,
      tone: natureSpec[rule.nature].tone,
      hint: natureSpec[rule.nature].hint,
    },
    {
      axis: 'valeur',
      value: opposabilitySpec[rule.opposability].value,
      tone: opposabilitySpec[rule.opposability].tone,
      hint: opposabilitySpec[rule.opposability].hint,
    },
  ]
}

/** Tag dédié au moteur de calcul (présenté à part, info plus technique). */
export function engineTagFor(rule: Rule): QualifiedTagSpec {
  return {
    axis: 'moteur',
    value: engineLabel[rule.engine],
    tone: 'neutral',
    hint: `Moteur de calcul : ${engineLabel[rule.engine]}.`,
  }
}
