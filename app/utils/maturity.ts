/**
 * Source unique de vérité pour la maturité d'une règle.
 *
 * La classification `N0 à N3` (type `MaturityLevel`) est un repère ordinal interne.
 * Elle ne doit jamais s'afficher telle quelle dans l'interface : on présente le
 * `label` parlant, et le niveau sert à activer progressivement des services.
 *
 * Connaissance métier : pyramide de fonctionnalités de la restitution (métadonnées
 * → code et tests → exécution) croisée avec le niveau de validation de la règle.
 */
import type { MaturityLevel } from '~/types/rule'

export interface MaturityMeta {
  level: MaturityLevel
  /** Rang ordinal interne (0 à 3), pour comparer ou trier. */
  rank: number
  /** Libellé affiché à l'usager. Jamais « N0/N1 ». */
  label: string
  /** Action permise à partir de ce niveau, formulée pour l'usager (facette « ce que la règle permet »). */
  action: string
  /** Ce que ce niveau garantit sur la règle. */
  meaning: string
  /** Services activés à ce palier (nouveaux par rapport au précédent). */
  unlocks: string[]
  /** Classe DSFR de couleur du badge. */
  badgeClass: string
}

export const maturityScale: MaturityMeta[] = [
  {
    level: 'N0',
    rank: 0,
    label: 'Référencée',
    action: 'Consulter la fiche',
    meaning: 'Inscrite au catalogue, avec son organisme porteur et sa base légale.',
    unlocks: ['Recherche et découverte'],
    badgeClass: 'fr-badge--grey',
  },
  {
    level: 'N1',
    rank: 1,
    label: 'Documentée',
    action: 'Lire la documentation',
    meaning: 'Métadonnées complètes : périmètre, version et références à jour.',
    unlocks: ['Fiche détaillée', 'API de consultation'],
    badgeClass: 'fr-badge--blue-cumulus',
  },
  {
    level: 'N2',
    rank: 2,
    label: 'Vérifiée',
    action: 'Vérifier code et tests',
    meaning: 'Code ouvert et cas de tests publiés : la traçabilité entre la loi et le code est contrôlable.',
    unlocks: ['Traçabilité loi ↔ code', 'Documentation générée', 'Cas de tests publics'],
    badgeClass: 'fr-badge--purple-glycine',
  },
  {
    level: 'N3',
    rank: 3,
    label: 'Exécutable',
    action: 'Exécuter le calcul',
    meaning: 'Calcul disponible : aperçu indicatif et intégration via API ou widget.',
    unlocks: ['Aperçu de calcul', 'API d\'exécution', 'Widget intégrable'],
    badgeClass: 'fr-badge--green-emeraude',
  },
]

const byLevel = Object.fromEntries(
  maturityScale.map(meta => [meta.level, meta]),
) as Record<MaturityLevel, MaturityMeta>

/** Métadonnées d'affichage d'un niveau de maturité. */
export const maturityMeta = (level: MaturityLevel): MaturityMeta => byLevel[level]

/** Libellé court d'un niveau (jamais « N0/N1 »). */
export const maturityLabel = (level: MaturityLevel): string => byLevel[level].label

/** Services activés jusqu'à ce niveau inclus (cumulatif). */
export function servicesUnlocked(level: MaturityLevel): string[] {
  const max = byLevel[level].rank
  return maturityScale
    .filter(meta => meta.rank <= max)
    .flatMap(meta => meta.unlocks)
}
