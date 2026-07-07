import type { LegalReference } from '~/types'

/**
 * Références légales des entrées de la démo resserrée. Toutes réelles ; quand
 * l'identifiant Légifrance stable n'est pas connu avec certitude, le champ `eli`
 * est omis plutôt qu'inventé.
 */
export const legalReferencesMock: Record<string, LegalReference> = {
  'code-electoral-L2-L7': {
    id: 'code-electoral-L2-L7',
    label: 'Code électoral, articles L. 2 à L. 7 et L.O. 227-1 (conditions du droit de vote)',
    kind: 'code',
    eli: 'https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006070239/',
  },
  'constitution-art-88-3': {
    id: 'constitution-art-88-3',
    label: 'Constitution du 4 octobre 1958, article 88-3 (droit de vote des citoyens UE aux municipales)',
    kind: 'autre',
    eli: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006527438/',
  },
  'note-service-masa-qf': {
    id: 'note-service-masa-qf',
    label: 'Note de service MASA - quotient familial et aide à la scolarité des agents (fiche F16)',
    kind: 'circulaire',
  },
  'cgi-244-quater-b': {
    id: 'cgi-244-quater-b',
    label: 'Code général des impôts, article 244 quater B (crédit d\'impôt recherche et innovation)',
    kind: 'code',
  },
  'cgi-44-sexies-0-a': {
    id: 'cgi-44-sexies-0-a',
    label: 'Code général des impôts, article 44 sexies-0 A (jeune entreprise innovante)',
    kind: 'code',
  },
  'css-L841-1': {
    id: 'css-L841-1',
    label: 'Code de la sécurité sociale, article L. 841-1 et suivants (prime d\'activité)',
    kind: 'code',
  },
  'decret-2025-195': {
    id: 'decret-2025-195',
    label: 'Décret n° 2025-195 du 27 février 2025 (pass Culture : bonification selon le quotient familial)',
    kind: 'decret',
    eli: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051261329',
  },
  'decret-2021-628': {
    id: 'decret-2021-628',
    label: 'Décret n° 2021-628 du 20 mai 2021 relatif au pass Culture',
    kind: 'decret',
    eli: 'https://www.legifrance.gouv.fr/eli/decret/2021/5/20/2021-628',
  },
}
