import type { LegalReference } from '~/types'
import type { Multilingual } from '~/utils/localized-text'
import { byLocale, localizeDeep } from '~/utils/localized-text'

/**
 * Références légales des entrées de la démo resserrée. Toutes réelles ; quand
 * l'identifiant Légifrance stable n'est pas connu avec certitude, le champ `eli`
 * est omis plutôt qu'inventé.
 *
 * Le nom du texte reste en français dans les deux langues, avec une glose anglaise à la
 * première mention ; seule la partie descriptive du libellé est traduite.
 */
export const legalReferencesSource: Record<string, Multilingual<LegalReference>> = {
  'code-electoral-L2-L7': {
    id: 'code-electoral-L2-L7',
    label: {
      fr: 'Code électoral, articles L. 2 à L. 7 et L.O. 227-1 (conditions du droit de vote)',
      en: 'Code électoral (French electoral code), articles L. 2 to L. 7 and L.O. 227-1 (conditions for the right to vote)',
    },
    kind: 'code',
    eli: 'https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006070239/',
  },
  'constitution-art-88-3': {
    id: 'constitution-art-88-3',
    label: {
      fr: 'Constitution du 4 octobre 1958, article 88-3 (droit de vote des citoyens UE aux municipales)',
      en: 'Constitution du 4 octobre 1958 (French Constitution), article 88-3 (right to vote of EU citizens in municipal elections)',
    },
    kind: 'autre',
    eli: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006527438/',
  },
  'note-service-masa-qf': {
    id: 'note-service-masa-qf',
    label: {
      fr: 'Note de service MASA - quotient familial et aide à la scolarité des agents (fiche F16)',
      en: 'Ministry of Agriculture service note - family quotient and school allowance for civil servants (sheet F16)',
    },
    kind: 'circulaire',
  },
  'cgi-244-quater-b': {
    id: 'cgi-244-quater-b',
    label: {
      fr: 'Code général des impôts, article 244 quater B (crédit d\'impôt recherche et innovation)',
      en: 'Code général des impôts (French general tax code), article 244 quater B (research and innovation tax credit)',
    },
    kind: 'code',
  },
  'cgi-44-sexies-0-a': {
    id: 'cgi-44-sexies-0-a',
    label: {
      fr: 'Code général des impôts, article 44 sexies-0 A (jeune entreprise innovante)',
      en: 'Code général des impôts (French general tax code), article 44 sexies-0 A (young innovative company)',
    },
    kind: 'code',
  },
  'css-L841-1': {
    id: 'css-L841-1',
    label: {
      fr: 'Code de la sécurité sociale, article L. 841-1 et suivants (prime d\'activité)',
      en: 'Code de la sécurité sociale (French social security code), article L. 841-1 and following (in-work benefit)',
    },
    kind: 'code',
  },
  'decret-2025-195': {
    id: 'decret-2025-195',
    label: {
      fr: 'Décret n° 2025-195 du 27 février 2025 (pass Culture : bonification selon le quotient familial)',
      en: 'Décret n° 2025-195 du 27 février 2025 (pass Culture bonus based on the family quotient)',
    },
    kind: 'decret',
    eli: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051261329',
  },
  'decret-2021-628': {
    id: 'decret-2021-628',
    label: {
      fr: 'Décret n° 2021-628 du 20 mai 2021 relatif au pass Culture',
      en: 'Décret n° 2021-628 du 20 mai 2021 on the pass Culture',
    },
    kind: 'decret',
    eli: 'https://www.legifrance.gouv.fr/eli/decret/2021/5/20/2021-628',
  },
}

export const legalReferencesFor = byLocale(
  locale => localizeDeep<Record<string, LegalReference>>(legalReferencesSource, locale),
)
