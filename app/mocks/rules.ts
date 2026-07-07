import type { BoundaryKind, Rule, RuleBoundaryInput } from '~/types'
import prestagriRaw from '~/data/jsonld/ministere-agriculture/prestagri/metadata.jsonld?raw'
import droitVoteRaw from '~/data/jsonld/ministere-interieur/droits-civiques-elections/metadata.jsonld?raw'
import { adaptJsonldGraph } from '~/utils/jsonld-adapter'
import { legalReferencesMock } from './legal-references'
import { organismsMock } from './organisms'

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
 */

/** Requalifie la frontière issue de l'adaptateur (kind par défaut : déclaration). */
function qualifyBoundary(
  draft: RuleBoundaryInput[],
  overrides: Record<string, Partial<RuleBoundaryInput> & { kind?: BoundaryKind }>,
): RuleBoundaryInput[] {
  return draft.map(input => ({ ...input, ...overrides[input.id] }))
}

const prestagriAdaptation = adaptJsonldGraph(prestagriRaw)
const droitVoteAdaptation = adaptJsonldGraph(droitVoteRaw)

const prestagri: Rule = {
  ...prestagriAdaptation.base as Rule,
  id: 'prestagri',
  slug: 'prestagri',
  title: 'Prest\'Agri - quotient familial et aide à la scolarité',
  nature: 'ouverte',
  domain: 'solidarite',
  engine: 'catala',
  maturity: 'N3',
  opposability: 'indicatif',
  regulatoryPosition: 'assistance-administration',
  organism: organismsMock['ministere-agriculture']!,
  legalReferences: [legalReferencesMock['note-service-masa-qf']!],
  tags: ['catala', 'quotient-familial', 'aide-scolarite', 'agents-publics', 'betagouv'],
  updatedAt: '2026-06-26',
  certificationRegime: 'frontiere',
  boundary: qualifyBoundary(prestagriAdaptation.boundaryDraft, {
    agent_revenu: {
      kind: 'donnee-attestee',
      evidenceSource: { label: 'Revenu fiscal de référence (DGFiP, mobilisable via API Particulier)', url: 'https://particulier.api.gouv.fr' },
    },
    conjoint_revenu: {
      kind: 'donnee-attestee',
      evidenceSource: { label: 'Revenu fiscal de référence du conjoint (DGFiP)' },
    },
  }),
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
  organism: organismsMock['ministere-interieur']!,
  legalReferences: [
    legalReferencesMock['code-electoral-L2-L7']!,
    legalReferencesMock['constitution-art-88-3']!,
  ],
  tags: ['python', 'regalgo', 'droit-de-vote', 'code-electoral'],
  updatedAt: '2026-06-25',
  certificationRegime: 'frontiere',
  boundary: qualifyBoundary(droitVoteAdaptation.boundaryDraft, {
    inscrit_listes_electorales: {
      kind: 'donnee-attestee',
      evidenceSource: { label: 'Répertoire électoral unique (Insee) - téléservice « interroger sa situation électorale »', url: 'https://www.service-public.fr/particuliers/vosdroits/services-en-ligne-et-formulaires/ISE' },
    },
    type_election: { kind: 'contexte' },
  }),
  outputs: droitVoteAdaptation.outputs,
  capabilities: {
    hasPublicTestCases: true,
  },
  profileGaps: droitVoteAdaptation.gaps,
  metadataSourcePath: 'app/data/jsonld/ministere-interieur/droits-civiques-elections/metadata.jsonld',
}

const entrepriseInnovation: Rule = {
  id: 'entreprise-innovation',
  slug: 'entreprise-innovation',
  title: 'Aides fiscales à l\'innovation - CIR, CII, CICo, JEI, JEU, JEC',
  shortDescription:
    'Éligibilité et montant des six dispositifs fiscaux de soutien à l\'innovation des entreprises. '
    + 'Modélisation Publicodes coconstruite avec un expert métier de la DGFiP, exposée en iframe sur '
    + 'entreprendre.service-public.fr (DILA).',
  nature: 'ouverte',
  domain: 'fiscalite',
  engine: 'publicodes',
  maturity: 'N3',
  opposability: 'indicatif',
  regulatoryPosition: 'simulation-indicative',
  organism: organismsMock.dge!,
  legalReferences: [
    legalReferencesMock['cgi-244-quater-b']!,
    legalReferencesMock['cgi-44-sexies-0-a']!,
  ],
  tags: ['cir', 'cii', 'jei', 'innovation', 'publicodes', 'entreprises'],
  updatedAt: '2025-09-17',
  version: 'main (2025-09-17)',
  sourceUrl: 'https://github.com/betagouv/publicodes-entreprise-innovation',
  capabilities: {
    hasCalculationPreview: true,
    hasLegalTraceability: true,
  },
  certificationRegime: 'frontiere',
  boundary: [
    { id: 'natureActivite', label: 'Nature de l\'activité', kind: 'declaration', definition: 'Activité commerciale, industrielle, agricole ou artisanale (conditionne l\'éligibilité au CIR).', required: true },
    { id: 'regimeFiscal', label: 'Régime fiscal', kind: 'declaration', definition: 'Imposition au régime réel ou condition d\'exonération (CGI, art. 244 quater B).', required: true },
    { id: 'depensesRecherche', label: 'Dépenses de recherche (métropole et DOM)', kind: 'declaration', definition: 'Assiette du crédit d\'impôt : 30 % jusqu\'à 100 M€ puis 5 % en métropole, 50 % dans les DOM.', required: true },
  ],
  operationalMappings: [
    {
      label: 'Formulaire déclaratif → variables Publicodes',
      from: 'survey-schema aides-simplifiées (entreprise-innovation.json)',
      to: 'règles publicodes-entreprise-innovation',
      artifactUrl: 'https://github.com/betagouv/aides-simplifiees-app/blob/main/public/forms/entreprise-innovation.json',
      maintainedBy: 'aides-simplifiées (service en cours de fermeture)',
      ciStatus: 'unknown',
    },
  ],
  profileGaps: ['fiche metadata.jsonld absente du dépôt data : entrée décrite depuis le dépôt source public'],
}

const primeActivite: Rule = {
  id: 'prime-activite-openfisca',
  slug: 'prime-activite-openfisca',
  title: 'Prime d\'activité - telle que calculée par openfisca-france',
  shortDescription:
    'Prestation du cœur socio-fiscal : sa chaîne de dépendances (SMIC, bases ressources, définitions '
    + 'de revenus) n\'a pas de porteur unique. Elle est cataloguée comme implémentation : le couple '
    + 'suite de tests + snapshot openfisca-france fait foi, pas la règle dans l\'abstrait.',
  nature: 'ouverte',
  domain: 'solidarite',
  engine: 'openfisca',
  maturity: 'N2',
  opposability: 'indicatif',
  regulatoryPosition: 'simulation-indicative',
  organism: organismsMock.cnaf!,
  legalReferences: [legalReferencesMock['css-L841-1']!],
  tags: ['prime-activite', 'openfisca', 'minima-sociaux', 'cnaf'],
  updatedAt: '2026-07-07',
  version: 'openfisca-france (suivi continu)',
  sourceUrl: 'https://github.com/openfisca/openfisca-france',
  capabilities: {
    hasPublicTestCases: true,
  },
  certificationRegime: 'implementation',
  boundary: [
    { id: 'salaire_de_base', label: 'Salaires des 3 derniers mois', kind: 'declaration', definition: 'Revenus d\'activité déclarés par l\'usager sur le trimestre de référence.', required: true },
    { id: 'rfr', label: 'Revenu fiscal de référence', kind: 'donnee-attestee', evidenceSource: { label: 'DGFiP, mobilisable via API Particulier', url: 'https://particulier.api.gouv.fr' } },
    { id: 'montant_forfaitaire', label: 'Montant forfaitaire et SMIC', kind: 'sortie-regle', definition: 'Paramètres législatifs partagés du cœur socio-fiscal, maintenus dans openfisca-france ; aucun porteur administratif unique.' },
  ],
  operationalMappings: [
    {
      label: 'Situation déclarative → entités et périodes OpenFisca',
      from: 'formulaire déclaratif aides-simplifiées (description plate)',
      to: 'entités individu / famille / foyer fiscal / ménage, variables périodisées',
      artifactUrl: 'https://github.com/betagouv/aides-simplifiees-app/blob/main/inertia/services/openfisca/dispatchers.ts',
      maintainedBy: 'aides-simplifiées (service en cours de fermeture)',
      ciStatus: 'unknown',
    },
  ],
  engineProfile: {
    openfisca: {
      entities: ['individu', 'famille', 'foyer_fiscal', 'menage'],
      periodes: 'variables mensuelles, bases ressources trimestrielles, paramètres législatifs datés',
    },
  },
  profileGaps: ['fiche metadata.jsonld absente du dépôt data : entrée décrite depuis le dépôt source public'],
}

const passCultureBonusQf: Rule = {
  id: 'pass-culture-bonus-qf',
  slug: 'pass-culture-bonus-qf',
  title: 'Pass Culture - bonification selon le quotient familial',
  shortDescription:
    'Bonus de 50 € du pass Culture conditionné au quotient familial (décret n° 2025-195). '
    + 'L\'implémentation officielle n\'est pas publiée : l\'entrée est référencée sur la seule base du texte, '
    + 'sans code ni cas de tests. Une spécification d\'extraction indépendante existe.',
  nature: 'fermee',
  domain: 'culture',
  engine: 'autre',
  maturity: 'N0',
  opposability: 'indicatif',
  regulatoryPosition: 'simulation-indicative',
  organism: organismsMock['pass-culture']!,
  legalReferences: [
    legalReferencesMock['decret-2025-195']!,
    legalReferencesMock['decret-2021-628']!,
  ],
  tags: ['pass-culture', 'quotient-familial', 'jeunesse'],
  updatedAt: '2026-04-04',
  version: 'non publiée',
  certificationRegime: 'referencement',
}

export const rulesMock: Rule[] = [
  prestagri,
  droitVote,
  entrepriseInnovation,
  primeActivite,
  passCultureBonusQf,
]

export const ruleBySlug = Object.fromEntries(
  rulesMock.map(rule => [rule.slug, rule]),
) as Record<string, Rule>
