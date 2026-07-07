# Contrat d'interface front ↔ data - profil de métadonnées

> **Statut : proposition v0, à co-écrire.** Ce document vit côté POC front le temps de la
> discussion ; sa cible est le dépôt `datagouv/regles.data.gouv.fr`, qui reste la source de
> vérité des fiches. Rédigé à partir des deux fiches existantes (droit de vote, Prest'Agri)
> et de la doctrine du catalogue (ontologie localisée, régimes de certification).

Le contrat tient en trois pièces, aucune n'existait :

1. **Le profil de `metadata.jsonld` figé** - champs obligatoires/optionnels, vocabulaires (ce document, sections 2-3).
2. **Une convention de slugs et d'URI** - sans espaces ni accents (section 4).
3. **Un index de catalogue généré** - le front ne crawle pas une arborescence (section 5).

La répartition des apports : le dépôt data apporte la conformité SEMIC (CPSV-AP, CCCEV,
sous-ensemble descriptif de CPRMV) ; le front apporte la **couche confiance** (maturité,
régimes de certification, enveloppe de cas de tests, frontière des entrées), proposée en
extension JSON-LD (section 6). Les deux fiches d'exemple dans [propositions/](propositions/)
montrent le profil complet sur des cas réels.

## 1. Socle constaté (ce qui marche, à garder tel quel)

Constaté dans les deux fiches existantes, directement consommable par le front (le
`@context` aplatit `title`/`description` en clés courtes, langue fr - pas besoin de stack RDF) :

| Champ | Vocabulaire | Statut proposé | Note |
|---|---|---|---|
| `@context` + `@graph` | JSON-LD | obligatoire | |
| nœud `cpsv:PublicService` | CPSV-AP | obligatoire (>= 1) | composition possible via `dct:hasPart` / `dct:isPartOf` (cas Prest'Agri) |
| `dct:identifier` | DC | obligatoire | schéma à figer, cf. section 4 |
| `title`, `description` (fr) | DC | obligatoires | |
| `dct:version` | DC | obligatoire | semver ; aujourd'hui absent des sous-services Prest'Agri |
| `dct:valid` | DC | optionnel | période indicative ; ne prétend pas couvrir le droit transitoire (c'est une règle, pas une métadonnée) |
| `cv:hasCompetentAuthority` → `cv:PublicOrganisation` | CPSV-AP | obligatoire, **décrit dans le graphe** | aujourd'hui référencé sans nœud dans Prest'Agri |
| `cv:hasLegalResource` (ELI, `dct:coverage` par articles) | CPSV-AP/ELI | obligatoire | le motif « id Légifrance + coverage article par article » de la fiche droit de vote est le bon |
| `cv:hasChannel` | CPSV-AP | obligatoire | package, API, dépôt git |
| `cv:hasInput` → `cprmv:Parameter` (types XSD, `cprmv:definition` sourcée) | CPRMV (sous-ensemble descriptif) | obligatoire | le typage reste volontairement superficiel : **pas d'entités ni de périodes dans le socle** (cf. section 7) |
| `cpsv:produces` → `cprmv:Rule` | CPRMV | obligatoire | dont la sortie d'explicabilité (`explanation`, `metadata.conditions`) - motif à généraliser : « utile pour expliquer un refus » |
| `schema:SoftwareSourceCode` pinné à un SHA | schema.org | obligatoire si code publié | |
| `schema:HowTo` | schema.org | optionnel | |
| `dct:source` vers code **et tests** | DC | obligatoire si code publié | remplacé à terme par `rdgf:testCase` (section 6) qui structure l'enveloppe |

## 2. Points à trancher (relevés par `rapport-conformite.md`)

Générés automatiquement par `scripts/sync-data-repo.mjs` à chaque synchronisation :

- **Schéma d'URI des services** : `https://regles.gouv.fr/algo/...` (droit de vote) vs
  `https://github.com/betagouv/prestagri#...` (Prest'Agri). Proposition section 4.
- **`cv:hasInput` vs `cpsv:hasInput`** : trancher selon la référence CPSV-AP 3.2.0 et s'y tenir.
- **`type` vs `@type` sur les paramètres** : normaliser (le `@context` mappe déjà `type` → `@type`,
  autant l'utiliser partout).
- **Dossiers avec espaces et accents** (`site/Ministère Intérieur/...`) : inutilisables en
  routes front, cf. section 4.
- **Autorité compétente non décrite** (Prest'Agri) et **bases légales absentes** des sous-services.

## 3. Régimes de certification : des variantes de profil, pas un moule unique

Le profil admet des **variantes selon les propriétés de la règle** (`rdgf:certificationRegime`) :

| Régime | Quand | Ce que le profil exige en plus | Ce qu'il n'exige pas |
|---|---|---|---|
| `frontiere` | règle packageable : autorité claire, dépendances peu profondes | qualification de la frontière des entrées (section 6), cas de tests avec enveloppe | rien sur l'amont des entrées |
| `implementation` | cœur socio-fiscal : chaîne de dépendances transitive sans porteur unique | snapshot d'implémentation (dépôt + version/SHA), suite de tests native référencée | une « autorité de la règle dans l'abstrait » |
| `referencement` | ni code ni tests publiés | socle descriptif seul (section 1) | code, tests, canaux d'exécution |

C'est la traduction en profil de la mise en garde OpenFisca : sur le cœur socio-fiscal,
« administration porteuse » n'a pas de sens ; l'unité certifiable est le couple tests + snapshot.

## 4. Conventions de nommage proposées

- **Arborescence** : `site/<org-slug>/<rule-slug>/metadata.jsonld`, slugs kebab-case ASCII
  (`ministere-interieur/droits-civiques-elections`). Le script de sync applique déjà cette
  normalisation côté front ; autant la faire à la source.
- **Identifiant** : `<domaine>.<slug>.<variante>` en gardant le motif existant
  (`civique.droit-vote.v1`) ; pour le régime implémentation, la variante nomme
  l'implémentation (`solidarite.prime-activite.openfisca-france`).
- **URI canonique de service** : `https://regles.data.gouv.fr/regles/<org-slug>/<rule-slug>/<variante>`
  - le domaine cible du produit, même si rien n'y répond encore (les URI JSON-LD sont des
  identifiants, pas des liens). Les URI GitHub restent en `dct:source`/`schema:codeRepository`.

## 5. Index de catalogue (`catalog.json`)

Généré aujourd'hui côté front par `scripts/sync-data-repo.mjs` (`pnpm sync:data`), à terme
généré côté dépôt data en CI. Champs par entrée : `organisation`, `organisationSlug`, `slug`,
`title`, `identifier`, `version`, `languages`, `sourcePath`, `conformite` (compteurs d'écarts).
En-tête : commit source, date. Le front ne lit **que** l'index et les fiches qu'il référence.

## 6. Extensions « couche confiance » (namespace `rdgf:`)

Proposition : `"rdgf": "https://regles.data.gouv.fr/def/catalogue#"`. Ce sont les champs que
le front affiche déjà et que le profil actuel ne porte pas (liste `profileGaps` visible sur
les fiches du POC). Illustrées sur des cas réels dans [propositions/](propositions/).

| Propriété | Porte sur | Valeurs | Pourquoi |
|---|---|---|---|
| `rdgf:maturity` | service | `N0`-`N3` | active les services progressivement (doctrine restitution) |
| `rdgf:certificationRegime` | service | `frontiere` / `implementation` / `referencement` | section 3 |
| `rdgf:boundaryKind` | `cprmv:Parameter` | `declaration` / `donnee-attestee` / `sortie-regle` / `contexte` | un badge « certifiée » doit dire ce qu'il couvre ; généralise la distinction data/context déjà présente dans la fiche droit de vote |
| `rdgf:evidenceSource` | `cprmv:Parameter` | nœud { label, url } | ancrage aux données attestées ayant un propriétaire institutionnel (RFR/DGFiP via API Particulier) - logique Evidence CCCEV, plus gouvernable qu'un modèle d'entités |
| `rdgf:testCase` | service | nœud enveloppe : `intent`, `provenance`, `validatedBy`, `validatedAt`, `legalAnchor`, `tolerance`, `status`, `nativeFormat`, `nativeRef` | le test natif fait foi ; le catalogue norme l'enveloppe sociale, jamais le format de situation (ontologie localisée) |
| `rdgf:operationalMapping` | service | nœud { from, to, artifact, maintainedBy, ciStatus } | recenser des mappings qui tournent, ne jamais rédiger de dictionnaire |
| `rdgf:implementationSnapshot` | service (régime `implementation`) | nœud { repository, ref } | l'unité certifiable du régime implémentation |
| `rdgf:engineProfile` | service | nœud namespacé par moteur | les opinions ontologiques (entités, périodes OpenFisca) restent locales au moteur |
| `rdgf:versionEvent` | service | nœud { version, date, kind, triggeredBy → ELI } | historique de versions lié aux textes déclencheurs |

## 7. Ce que le profil n'ajoutera pas (exclusions volontaires)

- **Pas d'entités ni de périodes dans le socle commun.** Décrire une situation exige
  l'ontologie du moteur ; un format commun de situations serait le « langage unique » par la
  bande (biais d'inférence, cf. position Merigoux sur CPRMV). D'où `rdgf:engineProfile`
  (namespacé) et les tests natifs référencés plutôt que transposés.
- **Pas de format d'exécution des tests.** L'enveloppe `rdgf:testCase` est sociale
  (provenance, validation), le test exécutable reste dans le dépôt source.
- **Pas de table de correspondances entre notions administratives.** Uniquement le
  recensement `rdgf:operationalMapping`.
- Conséquence assumée : pas de promesse de transposabilité automatique inter-moteurs.

## 8. Processus proposé

1. Le dépôt data reste la **source de vérité** des fiches ; le front les consomme via
   `pnpm sync:data` (clone local) et n'édite jamais une fiche vendorée.
2. Les surcouches du front (maturité, régime, frontière...) sont **temporaires** : dès que le
   profil `rdgf:` est accepté, elles migrent dans les fiches et l'adaptateur les lit
   (`profileGaps` doit tendre vers zéro - c'est l'indicateur de convergence du contrat).
3. Validation : contrôles structurels du script en attendant les shapes SHACL CPSV-AP 3.2.0
   (outillage prêt dans `qloridant/vocabulaire-commun`, tutoriel 04) en CI du dépôt data,
   étendues au namespace `rdgf:` une fois le profil stabilisé.
