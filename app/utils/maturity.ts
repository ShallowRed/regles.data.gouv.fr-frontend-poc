/**
 * Source unique de vérité pour la maturité d'une règle.
 *
 * La classification `N0 à N3` (type `MaturityLevel`) est un repère ordinal interne.
 * Elle ne doit jamais s'afficher telle quelle dans l'interface : on présente le
 * libellé parlant, et le niveau sert à activer progressivement des services.
 *
 * Connaissance métier : pyramide de fonctionnalités de la restitution (métadonnées
 * → code et tests → exécution) croisée avec le niveau de validation de la règle.
 */
import type { MaturityLevel } from '~/types/rule'

export interface MaturityMeta {
  level: MaturityLevel
  /** Rang ordinal interne (0 à 3), pour comparer ou trier. */
  rank: number
  /** Clé du libellé affiché à l'usager. Jamais « N0/N1 ». */
  labelKey: string
  /** Clé de l'action permise à partir de ce niveau (facette « ce que la règle permet »). */
  actionKey: string
  /** Clé de ce que ce niveau garantit sur la règle. */
  meaningKey: string
  /** Classe DSFR de couleur du badge. */
  badgeClass: string
}

export const maturityScale: MaturityMeta[] = [
  {
    level: 'N0',
    rank: 0,
    labelKey: 'maturity.N0.label',
    actionKey: 'maturity.N0.action',
    meaningKey: 'maturity.N0.meaning',
    badgeClass: 'fr-badge--grey',
  },
  {
    level: 'N1',
    rank: 1,
    labelKey: 'maturity.N1.label',
    actionKey: 'maturity.N1.action',
    meaningKey: 'maturity.N1.meaning',
    badgeClass: 'fr-badge--blue-cumulus',
  },
  {
    level: 'N2',
    rank: 2,
    labelKey: 'maturity.N2.label',
    actionKey: 'maturity.N2.action',
    meaningKey: 'maturity.N2.meaning',
    badgeClass: 'fr-badge--purple-glycine',
  },
  {
    level: 'N3',
    rank: 3,
    labelKey: 'maturity.N3.label',
    actionKey: 'maturity.N3.action',
    meaningKey: 'maturity.N3.meaning',
    badgeClass: 'fr-badge--green-emeraude',
  },
]

const byLevel = Object.fromEntries(
  maturityScale.map(meta => [meta.level, meta]),
) as Record<MaturityLevel, MaturityMeta>

/** Métadonnées d'affichage d'un niveau de maturité. */
export const maturityMeta = (level: MaturityLevel): MaturityMeta => byLevel[level]
