import type { Organism } from '~/types'
import type { Multilingual } from '~/utils/localized-text'
import { byLocale, localizeDeep } from '~/utils/localized-text'

/**
 * Les noms propres d'institutions restent en français, avec une glose anglaise entre
 * parenthèses quand l'institution n'a pas de nom anglais d'usage. Les sigles ne changent pas.
 */
export const organismsSource: Record<string, Multilingual<Organism>> = {
  'urssaf': {
    id: 'urssaf',
    name: {
      fr: 'Union de recouvrement des cotisations de sécurité sociale et d\'allocations familiales',
      en: 'Union de recouvrement des cotisations de sécurité sociale et d\'allocations familiales (social security and family benefit contribution collection body)',
    },
    acronym: 'URSSAF',
    url: 'https://www.urssaf.fr',
  },
  'dgfip': {
    id: 'dgfip',
    name: {
      fr: 'Direction générale des Finances publiques',
      en: 'Direction générale des Finances publiques (Directorate General for Public Finances)',
    },
    acronym: 'DGFiP',
    url: 'https://www.impots.gouv.fr',
  },
  'france-travail': {
    id: 'france-travail',
    name: 'France Travail',
    acronym: 'France Travail',
    url: 'https://www.francetravail.fr',
  },
  'cnaf': {
    id: 'cnaf',
    name: {
      fr: 'Caisse nationale des allocations familiales',
      en: 'Caisse nationale des allocations familiales (national family allowance fund)',
    },
    acronym: 'CNAF',
    url: 'https://www.caf.fr',
  },
  'cnav': {
    id: 'cnav',
    name: {
      fr: 'Caisse nationale d\'assurance vieillesse',
      en: 'Caisse nationale d\'assurance vieillesse (national old-age insurance fund)',
    },
    acronym: 'CNAV',
    url: 'https://www.lassuranceretraite.fr',
  },
  'cd-seine-saint-denis': {
    id: 'cd-seine-saint-denis',
    name: {
      fr: 'Conseil départemental de Seine-Saint-Denis',
      en: 'Seine-Saint-Denis departmental council',
    },
    acronym: 'CD 93',
    url: 'https://seinesaintdenis.fr',
  },
  'pass-culture': {
    id: 'pass-culture',
    // Casse officielle « pass Culture » ; la SAS (capitaux publics, 2019) est
    // l'opérateur du dispositif et le producteur de l'implémentation du bonus QF.
    name: 'Pass Culture',
    acronym: 'Pass Culture',
    url: 'https://pass.culture.fr',
  },
  'ministere-culture': {
    id: 'ministere-culture',
    name: { fr: 'Ministère de la Culture', en: 'Ministry of Culture' },
    acronym: 'MC',
    url: 'https://www.culture.gouv.fr',
  },
  'cnam': {
    id: 'cnam',
    name: {
      fr: 'Caisse nationale de l\'assurance maladie',
      en: 'Caisse nationale de l\'assurance maladie (national health insurance fund)',
    },
    acronym: 'CNAM',
    url: 'https://www.ameli.fr',
  },
  'metropole-grenoble': {
    id: 'metropole-grenoble',
    name: 'Grenoble-Alpes Métropole',
    acronym: 'GAM',
    url: 'https://www.grenoblealpesmetropole.fr',
  },
  'ville-paris': {
    id: 'ville-paris',
    name: { fr: 'Ville de Paris', en: 'City of Paris' },
    acronym: 'Ville de Paris',
    url: 'https://www.paris.fr',
  },
  'ministere-agriculture': {
    id: 'ministere-agriculture',
    name: {
      fr: 'Ministère de l\'Agriculture et de la Souveraineté alimentaire',
      en: 'Ministry of Agriculture and Food Sovereignty',
    },
    acronym: 'MASA',
    url: 'https://agriculture.gouv.fr',
  },
  'ministere-interieur': {
    id: 'ministere-interieur',
    name: { fr: 'Ministère de l\'Intérieur', en: 'Ministry of the Interior' },
    acronym: { fr: 'Ministère de l\'Intérieur', en: 'Ministry of the Interior' },
    url: 'https://www.interieur.gouv.fr',
  },
  'dge': {
    id: 'dge',
    name: {
      fr: 'Direction générale des Entreprises',
      en: 'Direction générale des Entreprises (Directorate General for Enterprises)',
    },
    acronym: 'DGE',
    url: 'https://www.entreprises.gouv.fr',
  },
}

export const organismsFor = byLocale(
  locale => localizeDeep<Record<string, Organism>>(organismsSource, locale),
)
