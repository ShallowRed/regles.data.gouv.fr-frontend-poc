/**
 * Métadonnées d'affichage des domaines de politique publique.
 * Facette de découverte du catalogue, pensée pour des publics métier.
 */
import type { RuleDomain } from '~/types/rule'

export interface DomainMeta {
  domain: RuleDomain
  label: string
  /** Icône DSFR (ligne) illustrant le domaine. */
  icon: string
}

export const domainScale: DomainMeta[] = [
  { domain: 'solidarite', label: 'Solidarité', icon: 'fr-icon-heart-line' },
  { domain: 'fiscalite', label: 'Fiscalité', icon: 'fr-icon-money-euro-circle-line' },
  { domain: 'emploi', label: 'Emploi', icon: 'fr-icon-briefcase-line' },
  { domain: 'retraite', label: 'Retraite', icon: 'fr-icon-calendar-line' },
  { domain: 'logement', label: 'Logement & mobilité', icon: 'fr-icon-home-4-line' },
  { domain: 'culture', label: 'Culture & jeunesse', icon: 'fr-icon-palette-line' },
  { domain: 'sante', label: 'Santé', icon: 'fr-icon-first-aid-kit-line' },
  { domain: 'citoyennete', label: 'Citoyenneté', icon: 'fr-icon-government-line' },
]

const byDomain = Object.fromEntries(
  domainScale.map(meta => [meta.domain, meta]),
) as Record<RuleDomain, DomainMeta>

export const domainMeta = (domain: RuleDomain): DomainMeta => byDomain[domain]

export const domainLabel = (domain: RuleDomain): string => byDomain[domain].label
