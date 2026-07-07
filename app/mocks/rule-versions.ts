import type { RuleVersion } from '~/types'

/**
 * Historique de versions des entrées de la démo resserrée.
 *
 * Anti-fabrication : seuls les jalons attestables par les dépôts sources sont listés
 * (dates de commits, versions publiées dans les fiches metadata.jsonld). Le champ
 * `triggeredBy` relie le changement au texte déclencheur quand il est connu.
 */
export const ruleVersionsMock: RuleVersion[] = [
  {
    id: 'prestagri-0-1-0',
    ruleId: 'prestagri',
    version: '0.1.0',
    publishedAt: '2026-06-26',
    changelog: 'Snapshot référencé par la fiche metadata.jsonld : règles Catala du quotient familial et de l\'aide à la scolarité, exposées via l\'API FastAPI.',
    kind: 'majeur',
    author: 'betagouv / Prest\'Agri',
    triggeredBy: 'note-service-masa-qf',
  },
  {
    id: 'droit-vote-1-0-0',
    ruleId: 'droits-civiques-elections',
    version: '1.0.0',
    publishedAt: '2026-06-25',
    changelog: 'Version référencée par la fiche metadata.jsonld (package 1.0.4 côté code) : éligibilité au droit de vote, élections nationales et municipales.',
    kind: 'majeur',
    author: 'écosystème regalgo (extraction indépendante)',
  },
  {
    id: 'entreprise-innovation-initial',
    ruleId: 'entreprise-innovation',
    version: 'main (2025-09-17)',
    publishedAt: '2025-09-17',
    changelog: 'Publication du dépôt betagouv : six dispositifs (CIR, CII, CICo, JEI, JEU, JEC), un fichier Publicodes par dispositif, coconstruits avec un expert métier DGFiP.',
    kind: 'majeur',
    author: 'aides-simplifiées / DGE',
    triggeredBy: 'cgi-244-quater-b',
  },
]
