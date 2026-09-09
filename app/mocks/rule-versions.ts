import type { RuleVersion } from '~/types'
import type { Multilingual } from '~/utils/localized-text'
import { byLocale, localizeDeep } from '~/utils/localized-text'

/**
 * Historique de versions des entrées de la démo resserrée.
 *
 * Anti-fabrication : seuls les jalons attestables par les dépôts sources sont listés
 * (dates de commits, versions publiées dans les fiches metadata.jsonld). Le champ
 * `triggeredBy` relie le changement au texte déclencheur quand il est connu.
 */
export const ruleVersionsSource: Multilingual<RuleVersion>[] = [
  {
    id: 'prestagri-0-1-0',
    ruleId: 'prestagri',
    version: '0.1.0',
    publishedAt: '2026-06-26',
    changelog: {
      fr: 'Première publication : règles Catala du quotient familial et de l\'aide à la scolarité, exposées via l\'API du producteur.',
      en: 'First publication: Catala rules for the family quotient and the school allowance, exposed through the producer\'s API.',
    },
    kind: 'majeur',
    author: 'betagouv / Prest\'Agri',
    triggeredBy: 'note-service-masa-qf',
  },
  {
    id: 'droit-vote-1-0-0',
    ruleId: 'droits-civiques-elections',
    version: '1.0.0',
    publishedAt: '2026-06-25',
    changelog: {
      fr: 'Première publication : éligibilité au droit de vote, élections nationales et municipales.',
      en: 'First publication: eligibility for the right to vote, national and municipal elections.',
    },
    kind: 'majeur',
    author: {
      fr: 'écosystème regalgo (extraction indépendante)',
      en: 'regalgo ecosystem (independent extraction)',
    },
  },
  {
    id: 'entreprise-innovation-initial',
    ruleId: 'entreprise-innovation',
    version: { fr: 'Publication initiale', en: 'Initial publication' },
    publishedAt: '2025-09-17',
    changelog: {
      fr: 'Les six dispositifs (CIR, CII, CICo, JEI, JEU, JEC), modélisés en Publicodes.',
      en: 'The six schemes (CIR, CII, CICo, JEI, JEU, JEC), modelled in Publicodes.',
    },
    kind: 'majeur',
    author: 'aides-simplifiées / DGE',
    triggeredBy: 'cgi-244-quater-b',
  },
]

export const ruleVersionsFor = byLocale(
  locale => localizeDeep<RuleVersion[]>(ruleVersionsSource, locale),
)
