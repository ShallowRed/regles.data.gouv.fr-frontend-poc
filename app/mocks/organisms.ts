import type { Organism } from '~/types'

export const organismsMock: Record<string, Organism> = {
  'urssaf': {
    id: 'urssaf',
    name: 'Union de recouvrement des cotisations de sécurité sociale et d\'allocations familiales',
    acronym: 'URSSAF',
    url: 'https://www.urssaf.fr',
  },
  'dgfip': {
    id: 'dgfip',
    name: 'Direction générale des Finances publiques',
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
    name: 'Caisse nationale des allocations familiales',
    acronym: 'CNAF',
    url: 'https://www.caf.fr',
  },
  'cnav': {
    id: 'cnav',
    name: 'Caisse nationale d\'assurance vieillesse',
    acronym: 'CNAV',
    url: 'https://www.lassuranceretraite.fr',
  },
  'cd-seine-saint-denis': {
    id: 'cd-seine-saint-denis',
    name: 'Conseil départemental de Seine-Saint-Denis',
    acronym: 'CD 93',
    url: 'https://seinesaintdenis.fr',
  },
  'pass-culture': {
    id: 'pass-culture',
    // Casse officielle « pass Culture » ; la SAS (capitaux publics, 2019) est
    // l'opérateur du dispositif et le producteur de l'implémentation du bonus QF.
    name: 'SAS pass Culture',
    acronym: 'pass Culture',
    url: 'https://pass.culture.fr',
  },
  'ministere-culture': {
    id: 'ministere-culture',
    name: 'Ministère de la Culture',
    acronym: 'MC',
    url: 'https://www.culture.gouv.fr',
  },
  'cnam': {
    id: 'cnam',
    name: 'Caisse nationale de l\'assurance maladie',
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
    name: 'Ville de Paris',
    acronym: 'Ville de Paris',
    url: 'https://www.paris.fr',
  },
  'ministere-agriculture': {
    id: 'ministere-agriculture',
    name: 'Ministère de l\'Agriculture et de la Souveraineté alimentaire',
    acronym: 'MASA',
    url: 'https://agriculture.gouv.fr',
  },
  'ministere-interieur': {
    id: 'ministere-interieur',
    name: 'Ministère de l\'Intérieur',
    acronym: 'Ministère de l\'Intérieur',
    url: 'https://www.interieur.gouv.fr',
  },
  'dge': {
    id: 'dge',
    name: 'Direction générale des Entreprises',
    acronym: 'DGE',
    url: 'https://www.entreprises.gouv.fr',
  },
}
