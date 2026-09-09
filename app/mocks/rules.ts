import type { BoundaryKind, Rule, RuleBoundaryInput } from '~/types'
import type { Multilingual } from '~/utils/localized-text'
import prestagriRaw from '~/data/jsonld/ministere-agriculture/prestagri/metadata.jsonld?raw'
import droitVoteRaw from '~/data/jsonld/ministere-interieur/droits-civiques-elections/metadata.jsonld?raw'
import { adaptJsonldGraph } from '~/utils/jsonld-adapter'
import { byLocale, localizeDeep } from '~/utils/localized-text'
import { legalReferencesFor } from './legal-references'
import { organismsFor } from './organisms'

/**
 * Démo resserrée : 5 entrées ancrées dans le réel, une par couple moteur × partenaire.
 *
 * - Prest'Agri (Catala, MASA) et Droit de vote (Python, Intérieur) sont construites via
 *   l'adaptateur depuis les fiches metadata.jsonld réelles du dépôt data (vendorées dans
 *   app/data/jsonld/). Leur champ `profileGaps` liste ce que le profil data ne couvre pas.
 * - Entreprise-innovation (Publicodes, DGE) et Prime d'activité (OpenFisca) sont décrites
 *   depuis leurs dépôts publics respectifs.
 * - Le bonus QF pass Culture illustre le régime « référencement » : une entrée honnêtement
 *   non exécutable.
 *
 * Aucune donnée inventée : quand une information manque, le champ est omis.
 *
 * Les entrées adossées à une fiche tiennent leurs traductions de la fiche (l'adaptateur
 * reçoit la locale) ; les trois autres les portent ici, en littéraux `{ fr, en }` résolus
 * par `localizeDeep`. Un texte laissé en chaîne simple est le même dans les deux langues.
 */

/** Requalifie la frontière issue de l'adaptateur (kind par défaut : déclaration). */
function qualifyBoundary(
  draft: RuleBoundaryInput[],
  overrides: Record<string, Partial<RuleBoundaryInput> & { kind?: BoundaryKind }>,
): RuleBoundaryInput[] {
  return draft.map(input => ({ ...input, ...overrides[input.id] }))
}

function buildRules(locale: string): Rule[] {
  const organisms = organismsFor(locale)
  const legalReferences = legalReferencesFor(locale)
  const ml = <T>(source: Multilingual<T>): T => localizeDeep<T>(source, locale)
  type BoundaryOverrides = Record<string, Partial<RuleBoundaryInput> & { kind?: BoundaryKind }>

  const prestagriAdaptation = adaptJsonldGraph(prestagriRaw, locale)
  const droitVoteAdaptation = adaptJsonldGraph(droitVoteRaw, locale)

  const prestagri: Rule = {
    ...prestagriAdaptation.base as Rule,
    title: ml<string>({
      fr: 'Prest\'Agri - quotient familial et aide à la scolarité',
      en: 'Prest\'Agri - family quotient and school allowance',
    }),
    id: 'prestagri',
    slug: 'prestagri',
    nature: 'ouverte',
    domain: 'solidarite',
    engine: 'catala',
    maturity: 'N3',
    opposability: 'indicatif',
    regulatoryPosition: 'assistance-administration',
    organism: organisms['ministere-agriculture']!,
    legalReferences: [legalReferences['note-service-masa-qf']!],
    tags: ['catala', 'quotient-familial', 'aide-scolarite', 'agents-publics', 'betagouv'],
    updatedAt: '2026-06-26',
    certificationRegime: 'frontiere',
    boundary: qualifyBoundary(prestagriAdaptation.boundaryDraft, ml<BoundaryOverrides>({
      revenu_fiscal_reference: {
        kind: 'donnee-attestee' as const,
        evidenceSource: {
          label: {
            fr: 'Revenu fiscal de référence (DGFiP, mobilisable via API Particulier)',
            en: 'Reference tax income (DGFiP, available through API Particulier)',
          },
          url: 'https://particulier.api.gouv.fr',
        },
      },
    })),
    outputs: prestagriAdaptation.outputs,
    capabilities: {
      hasApiDocumentation: true,
      hasCalculationPreview: true,
      hasPublicTestCases: true,
    },
    profileGaps: prestagriAdaptation.gaps,
    metadataSourcePath: 'app/data/jsonld/ministere-agriculture/prestagri/metadata.jsonld',
  }

  const droitVote: Rule = {
    ...droitVoteAdaptation.base as Rule,
    id: 'droits-civiques-elections',
    slug: 'droits-civiques-elections',
    nature: 'ouverte',
    domain: 'citoyennete',
    maturity: 'N2',
    opposability: 'indicatif',
    regulatoryPosition: 'simulation-indicative',
    organism: organisms['ministere-interieur']!,
    legalReferences: [
      legalReferences['code-electoral-L2-L7']!,
      legalReferences['constitution-art-88-3']!,
    ],
    tags: ['python', 'regalgo', 'droit-de-vote', 'code-electoral'],
    updatedAt: '2026-06-25',
    certificationRegime: 'frontiere',
    boundary: qualifyBoundary(droitVoteAdaptation.boundaryDraft, ml<BoundaryOverrides>({
      inscrit_listes_electorales: {
        kind: 'donnee-attestee' as const,
        evidenceSource: {
          label: {
            fr: 'Répertoire électoral unique (Insee) - téléservice « interroger sa situation électorale »',
            en: 'Répertoire électoral unique (single electoral register, Insee) - online service to check one\'s electoral status',
          },
          url: 'https://www.service-public.fr/particuliers/vosdroits/services-en-ligne-et-formulaires/ISE',
        },
      },
      type_election: { kind: 'contexte' as const },
    })),
    outputs: droitVoteAdaptation.outputs,
    capabilities: {
      hasPublicTestCases: true,
    },
    profileGaps: droitVoteAdaptation.gaps,
    metadataSourcePath: 'app/data/jsonld/ministere-interieur/droits-civiques-elections/metadata.jsonld',
  }

  const entrepriseInnovation: Rule = ml<Rule>({
    id: 'entreprise-innovation',
    slug: 'entreprise-innovation',
    title: {
      fr: 'Aides fiscales à l\'innovation - CIR, CII, CICo, JEI, JEU, JEC',
      en: 'Tax incentives for innovation - CIR, CII, CICo, JEI, JEU, JEC',
    },
    shortDescription: {
      fr: 'Éligibilité et montant des six dispositifs fiscaux de soutien à l\'innovation des '
        + 'entreprises, tels qu\'exposés sur entreprendre.service-public.fr.',
      en: 'Eligibility and amount of the six tax schemes supporting business innovation, as '
        + 'presented on entreprendre.service-public.fr.',
    },
    nature: 'ouverte',
    domain: 'fiscalite',
    engine: 'publicodes',
    maturity: 'N3',
    opposability: 'indicatif',
    regulatoryPosition: 'simulation-indicative',
    organism: organisms.dge!,
    legalReferences: [
      legalReferences['cgi-244-quater-b']!,
      legalReferences['cgi-44-sexies-0-a']!,
    ],
    tags: ['cir', 'cii', 'jei', 'innovation', 'publicodes', 'entreprises'],
    updatedAt: '2025-09-17',
    version: { fr: 'Publication initiale', en: 'Initial publication' },
    sourceUrl: 'https://github.com/betagouv/publicodes-entreprise-innovation',
    capabilities: {
      hasCalculationPreview: true,
      hasLegalTraceability: true,
      hasPublicTestCases: true,
    },
    certificationRegime: 'frontiere',
    boundary: [
      {
        id: 'natureActivite',
        label: { fr: 'Nature de l\'activité', en: 'Type of activity' },
        kind: 'declaration',
        definition: {
          fr: 'Activité commerciale, industrielle, agricole ou artisanale (conditionne l\'éligibilité au CIR).',
          en: 'Commercial, industrial, agricultural or craft activity (conditions eligibility for the research tax credit).',
        },
        required: true,
      },
      {
        id: 'regimeFiscal',
        label: { fr: 'Régime fiscal', en: 'Tax regime' },
        kind: 'declaration',
        definition: {
          fr: 'Imposition au régime réel ou condition d\'exonération (CGI, art. 244 quater B).',
          en: 'Taxation under the actual profit regime, or an exemption condition (Code général des impôts, art. 244 quater B).',
        },
        required: true,
      },
      {
        id: 'depensesRecherche',
        label: {
          fr: 'Dépenses de recherche (métropole et DOM)',
          en: 'Research expenditure (mainland France and overseas departments)',
        },
        kind: 'declaration',
        definition: {
          fr: 'Assiette du crédit d\'impôt : 30 % jusqu\'à 100 M€ puis 5 % en métropole, 50 % dans les DOM.',
          en: 'Base of the tax credit: 30% up to 100 M€ then 5% in mainland France, 50% in the overseas departments.',
        },
        required: true,
      },
    ],
    operationalMappings: [
      {
        label: {
          fr: 'Formulaire déclaratif → variables Publicodes',
          en: 'Declaration form → Publicodes variables',
        },
        from: 'survey-schema aides-simplifiées (entreprise-innovation.json)',
        to: {
          fr: 'règles publicodes-entreprise-innovation',
          en: 'publicodes-entreprise-innovation rules',
        },
        artifactUrl: 'https://github.com/betagouv/aides-simplifiees-app/blob/main/public/forms/entreprise-innovation.json',
        maintainedBy: {
          fr: 'aides-simplifiées (service en cours de fermeture)',
          en: 'aides-simplifiées (service being shut down)',
        },
        ciStatus: 'unknown',
      },
    ],
    profileGaps: [{
      fr: 'fiche metadata.jsonld absente du dépôt data : entrée décrite depuis le dépôt source public',
      en: 'no metadata.jsonld record in the data repository: entry described from the public source repository',
    }],
  })

  const primeActivite: Rule = ml<Rule>({
    id: 'prime-activite-openfisca',
    slug: 'prime-activite-openfisca',
    title: { fr: 'Prime d\'activité', en: 'In-work benefit (prime d\'activité)' },
    shortDescription: {
      fr: 'Prestation mensuelle qui complète les revenus d\'activité modestes, calculée par '
        + 'openfisca-france à partir des ressources du trimestre de référence.',
      en: 'Monthly benefit topping up low earned income, calculated by openfisca-france from '
        + 'the resources of the reference quarter.',
    },
    nature: 'ouverte',
    domain: 'solidarite',
    engine: 'openfisca',
    maturity: 'N2',
    opposability: 'indicatif',
    regulatoryPosition: 'simulation-indicative',
    organism: organisms.cnaf!,
    legalReferences: [legalReferences['css-L841-1']!],
    tags: ['prime-activite', 'openfisca', 'minima-sociaux', 'cnaf'],
    updatedAt: '2026-07-07',
    version: 'openfisca-france 169.15.0',
    sourceUrl: 'https://github.com/openfisca/openfisca-france',
    certificationRegime: 'implementation',
    capabilities: {
      hasPublicTestCases: true,
      hasCalculationPreview: true,
    },
    boundary: [
      {
        id: 'salaire_de_base',
        label: { fr: 'Salaires des 3 derniers mois', en: 'Wages of the last 3 months' },
        kind: 'declaration',
        definition: {
          fr: 'Revenus d\'activité déclarés par l\'usager sur le trimestre de référence.',
          en: 'Earned income declared by the user for the reference quarter.',
        },
        required: true,
      },
      {
        id: 'rfr',
        label: { fr: 'Revenu fiscal de référence', en: 'Reference tax income' },
        kind: 'donnee-attestee',
        evidenceSource: {
          label: {
            fr: 'DGFiP, mobilisable via API Particulier',
            en: 'DGFiP, available through API Particulier',
          },
          url: 'https://particulier.api.gouv.fr',
        },
      },
      {
        id: 'montant_forfaitaire',
        label: { fr: 'Montant forfaitaire et SMIC', en: 'Flat-rate amount and minimum wage' },
        kind: 'sortie-regle',
        definition: {
          fr: 'Paramètres législatifs partagés du cœur socio-fiscal, maintenus dans openfisca-france.',
          en: 'Shared legislative parameters of the tax and benefit core, maintained in openfisca-france.',
        },
      },
    ],
    operationalMappings: [
      {
        label: {
          fr: 'Situation déclarative → entités et périodes OpenFisca',
          en: 'Declared situation → OpenFisca entities and periods',
        },
        from: {
          fr: 'formulaire déclaratif aides-simplifiées (description plate)',
          en: 'aides-simplifiées declaration form (flat description)',
        },
        to: {
          fr: 'entités individu / famille / foyer fiscal / ménage, variables périodisées',
          en: 'individual / family / tax household / household entities, period-based variables',
        },
        artifactUrl: 'https://github.com/betagouv/aides-simplifiees-app/blob/main/inertia/services/openfisca/dispatchers.ts',
        maintainedBy: {
          fr: 'aides-simplifiées (service en cours de fermeture)',
          en: 'aides-simplifiées (service being shut down)',
        },
        ciStatus: 'unknown',
      },
    ],
    engineProfile: {
      openfisca: {
        entities: ['individu', 'famille', 'foyer_fiscal', 'menage'],
        periodes: 'variables mensuelles, bases ressources trimestrielles, paramètres législatifs datés',
      },
    },
    profileGaps: [{
      fr: 'fiche metadata.jsonld absente du dépôt data : entrée décrite depuis le dépôt source public',
      en: 'no metadata.jsonld record in the data repository: entry described from the public source repository',
    }],
  })

  const passCultureBonusQf: Rule = ml<Rule>({
    id: 'pass-culture-bonus-qf',
    slug: 'pass-culture-bonus-qf',
    title: {
      fr: 'pass Culture - bonification selon le quotient familial',
      en: 'pass Culture - bonus based on the family quotient',
    },
    shortDescription: {
      fr: 'Bonus de 50 € du pass Culture conditionné au quotient familial (décret n° 2025-195). '
        + 'Référencée d\'après le texte réglementaire ; code et cas de tests non publiés par l\'opérateur.',
      en: 'The 50 € pass Culture bonus, conditioned on the family quotient (décret n° 2025-195). '
        + 'Referenced from the regulatory text; the operator publishes neither code nor test cases.',
    },
    nature: 'fermee',
    domain: 'culture',
    engine: 'autre',
    maturity: 'N0',
    opposability: 'indicatif',
    regulatoryPosition: 'simulation-indicative',
    organism: organisms['pass-culture']!,
    legalReferences: [
      legalReferences['decret-2025-195']!,
      legalReferences['decret-2021-628']!,
    ],
    tags: ['pass-culture', 'quotient-familial', 'jeunesse'],
    updatedAt: '2026-04-04',
    version: { fr: 'non publiée', en: 'not published' },
    certificationRegime: 'referencement',
  })

  return [
    prestagri,
    droitVote,
    entrepriseInnovation,
    primeActivite,
    passCultureBonusQf,
  ]
}

export const rulesFor = byLocale(buildRules)

export const ruleBySlugFor = byLocale(locale =>
  Object.fromEntries(rulesFor(locale).map(rule => [rule.slug, rule])) as Record<string, Rule>)
