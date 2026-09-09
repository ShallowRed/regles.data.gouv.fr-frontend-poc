/**
 * Métadonnées d'affichage des domaines de politique publique.
 * Facette de découverte du catalogue, pensée pour des publics métier.
 */
import type { RuleDomain } from '~/types/rule'

export interface DomainMeta {
  domain: RuleDomain
  labelKey: string
  /** Icône DSFR (ligne) illustrant le domaine. */
  icon: string
}

export const domainScale: DomainMeta[] = [
  { domain: 'solidarite', labelKey: 'domains.solidarite', icon: 'fr-icon-heart-line' },
  { domain: 'fiscalite', labelKey: 'domains.fiscalite', icon: 'fr-icon-money-euro-circle-line' },
  { domain: 'emploi', labelKey: 'domains.emploi', icon: 'fr-icon-briefcase-line' },
  { domain: 'retraite', labelKey: 'domains.retraite', icon: 'fr-icon-calendar-line' },
  { domain: 'logement', labelKey: 'domains.logement', icon: 'fr-icon-home-4-line' },
  { domain: 'culture', labelKey: 'domains.culture', icon: 'fr-icon-palette-line' },
  { domain: 'sante', labelKey: 'domains.sante', icon: 'fr-icon-first-aid-kit-line' },
  { domain: 'citoyennete', labelKey: 'domains.citoyennete', icon: 'fr-icon-government-line' },
]

const byDomain = Object.fromEntries(
  domainScale.map(meta => [meta.domain, meta]),
) as Record<RuleDomain, DomainMeta>

export const domainMeta = (domain: RuleDomain): DomainMeta => byDomain[domain]
