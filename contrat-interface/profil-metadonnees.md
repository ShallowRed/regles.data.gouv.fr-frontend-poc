# Contrat d'interface front ↔ data - profil de métadonnées

> **Statut : proposition v1.** Ce document est écrit côté POC front le temps de la discussion ; sa cible est le dépôt `datagouv/regles.data.gouv.fr`, qui reste la source de vérité des fiches. Il décrit le profil tel que le front le lit aujourd'hui. Chaque point est décidé dans [decisions/](decisions/) ; le vocabulaire `rdgf:` est transcrit dans [rdgf/](rdgf/) (contexte partagé et Turtle SKOS).

Le contrat tient en trois pièces :

1. **Le profil de `metadata.jsonld`** - champs obligatoires et optionnels, vocabulaires (sections 1 à 3 et 6).
2. **Une convention de slugs et d'URI** - sans espaces ni accents (section 4).
3. **Un index de catalogue généré** - le front ne crawle pas une arborescence (section 5).

Le dépôt data apporte la conformité SEMIC (CPSV-AP, CCCEV, sous-ensemble descriptif de CPRMV) ; le registre apporte la surcouche `rdgf:` (section 6) : l'engagement du producteur, l'origine de la valeur de chaque entrée, l'enveloppe des cas de tests, les correspondances opérationnelles et l'historique des versions. Les deux fiches de [propositions/](propositions/) montrent le profil complet sur des cas réels.

## 1. Socle

Constaté dans les fiches existantes et directement consommable par le front : le `@context` aplatit `title` et `description` en clés courtes, langue fr.

| Champ | Vocabulaire | Statut proposé | Note |
|---|---|---|---|
| `@context` + `@graph` | JSON-LD | obligatoire | |
| nœud `cpsv:PublicService` | CPSV-AP | obligatoire (>= 1) | |
| `dct:identifier` | DC | obligatoire | schéma section 4 |
| `title`, `description` (fr) | DC | obligatoires | |
| `dct:version` | DC | obligatoire | semver |
| `dct:valid` | DC | optionnel | période indicative, sans prétention sur le droit transitoire |
| `cv:hasCompetentAuthority` → `cv:PublicOrganisation` | CPSV-AP | obligatoire, décrit dans le graphe | les shapes exigent aussi `dct:spatial` sur l'organisation et le type `org:Organization` |
| `cv:hasLegalResource` (ELI, `dct:coverage` par articles) | CPSV-AP/ELI | obligatoire | id Légifrance et couverture article par article |
| `cv:hasChannel` | CPSV-AP | obligatoire | package, API, dépôt git |
| `cpsv:hasInput` → `["cv:Evidence", "cprmv:Parameter"]` | CPSV-AP + CPRMV | obligatoire | la propriété CPSV-AP 3.2.0 est `cpsv:hasInput`, de portée `cv:Evidence` ; typage volontairement superficiel, ni entités ni périodes dans le socle |
| `cpsv:produces` → `cprmv:Rule` | CPRMV | obligatoire | dont la sortie d'explicabilité |
| `schema:SoftwareSourceCode` épinglé à un SHA | schema.org | obligatoire si code publié | |
| `schema:HowTo` | schema.org | optionnel | |
| `dct:source` vers code et tests | DC | obligatoire si code publié | |

## 1 bis. Littéraux multilingues

Les littéraux affichés (`dct:title`, `dct:description`, `cprmv:definition`, `skos:prefLabel`, `dct:coverage`, `schema:name`, `schema:description`) s'écrivent en tableau de littéraux étiquetés par leur langue, forme prévue par JSON-LD 1.1 :

```jsonc
{
  "title": [
    { "@value": "Droit de vote en France", "@language": "fr" },
    { "@value": "Right to vote in France", "@language": "en" }
  ]
}
```

Règle de choix côté consommateur (`app/utils/jsonld-adapter.ts`) : la langue demandée, puis le français, puis le premier littéral disponible. Un texte identique dans les deux langues s'écrit en chaîne simple.

Les deux fiches vendorées dans `app/data/jsonld/` portent leurs traductions anglaises sous cette forme ; c'est une proposition au dépôt data, qu'une synchronisation (`pnpm sync:data`) écrase tant que le dépôt ne l'a pas reprise. Restent en français dans toutes les langues : le nom des textes de loi, les extraits réglementaires, le code des règles, les identifiants, versions et valeurs de tests.

## 2. Points tranchés

Relevés par `rapport-conformite.md`, généré par `scripts/sync-data-repo.mjs` à chaque synchronisation, et vérifiés par rejeu des shapes SHACL officielles CPSV-AP 3.2.0 :

- **`cpsv:hasInput`**, pas `cv:hasInput` : `cv:hasInput` n'existe pas sur Public Service. Les entrées portent le type `cv:Evidence`.
- **`type` plutôt que `@type`** sur les paramètres : le `@context` mappe déjà `type`.
- **Alias `title` et `description` partout**, y compris sur les paramètres et sorties : une clé `dct:title` en toutes lettres produit un littéral sans langue, que les shapes refusent.
- **Composition de services** : `dct:hasPart` entre services est hors profil, le lien natif est `dct:requires`. L'unité de référencement est le sous-service certifiable, pas le dépôt.
- **`cprmv:type` déclaré `"@type": "@id"`** dans le `@context`, sinon `"xsd:decimal"` s'expanse en chaîne.
- **Aucune clé non mappée** : une clé à préfixe non déclaré fuit en IRI invalide, une clé nue disparaît sans erreur.

Les deux fiches de [propositions/](propositions/) passent les shapes officielles (`conforms: true`) ; les écarts des fiches réelles (hasInput, `cv:ownedBy` → `org:Organization`, `dct:spatial`, langues, composition) sont matière à co-écriture avec le dépôt data.

## 3. Garantie du producteur

L'engagement du producteur est un nœud `rdgf:certification` ([ADR-0002](decisions/ADR-0002-certification.md)). Son absence signifie que la règle est référencée. Le profil exige, selon le niveau :

| `rdgf:certificationLevel` | Ce que l'organisme dit | Ce que le profil exige en plus |
|---|---|---|
| `certified` | « je réponds des résultats sur les faits déclarés, à cette version » | `rdgf:factKind` sur chaque entrée, au moins un `rdgf:testCase` avec enveloppe |
| `self-assessed` | « je publie le code et les tests, à ce commit » | un `schema:SoftwareSourceCode` désigné à un commit ou un tag, une suite native référencée par `dct:source` d'un `rdgf:testCase` |
| (absent) | règle référencée | socle descriptif seul |

Le niveau de la règle (référencée, documentée, vérifiée, exécutable) est calculé par le registre depuis la fiche et ses exécutions ([ADR-0003](decisions/ADR-0003-niveau-derive.md)) ; il n'apparaît pas dans la fiche.

## 4. Conventions de nommage

- **Arborescence** : `site/<org-slug>/<rule-slug>/metadata.jsonld`, slugs kebab-case ASCII.
- **Identifiant** : `<domaine>.<slug>.<variante>` (`civique.droit-vote.v1`) ; pour une règle décrite telle que la calcule une implémentation, la variante nomme cette implémentation (`solidarite.prime-activite.openfisca-france`).
- **URI canonique de service** : `https://regles.data.gouv.fr/regles/<org-slug>/<rule-slug>/<variante>`. Les URI GitHub restent en `dct:source` et `schema:codeRepository`.
- **Trois axes de version** : l'URI contient la lignée (`/v1`, ou la variante d'implémentation) ; `dct:version` le semver dans la lignée ; `rdgf:versionEvent` l'historique daté relié aux textes déclencheurs. Une rupture d'entrées ou de sorties crée une nouvelle URI ; deux implémentations de la même règle sont deux fiches reliées par `cv:relatedService`.
- **Entrées et sorties adressables** : un `@id` de fragment (`<uri-service>#input-<identifiant>`) plutôt qu'un blank node.

## 5. Index de catalogue (`catalog.json`)

Généré côté front par `scripts/sync-data-repo.mjs` (`pnpm sync:data`), à terme côté dépôt data en CI. Champs par entrée : `organisation`, `organisationSlug`, `slug`, `title`, `identifier`, `version`, `languages`, `sourcePath`, `conformite`. En-tête : commit source, date. Le front ne lit que l'index et les fiches qu'il référence. `title` est une chaîne quand la fiche n'a qu'une langue, un objet `{ "fr": "…", "en": "…" }` sinon.

## 6. Surcouche `rdgf:`

Namespace `https://regles.data.gouv.fr/def/rdgf#`, contexte partagé et définitions dans [rdgf/](rdgf/) ([ADR-0009](decisions/ADR-0009-publication.md)). Les énumérations sont des concepts SKOS que le contexte rend lisibles comme des chaînes : une fiche écrit `"rdgf:factKind": "attested"`. L'absence d'un terme sur une fiche apparaît dans `profileGaps`, sauf `rdgf:certification` dont l'absence signifie « référencée ».

| Terme | Sur | Contenu | Décision |
|---|---|---|---|
| `rdgf:certification` | service | nœud `rdgf:Certification` : `rdgf:certificationLevel` (`certified`, `self-assessed`), `prov:wasAttributedTo`, `dct:issued`, `dct:conformsTo` › `dct:version`, `description` | [ADR-0002](decisions/ADR-0002-certification.md) |
| `rdgf:factKind` | `cv:Evidence` | `declared`, `attested`, `derived`, `context` ; pour un fait attesté, l'organisme en `dct:publisher` et l'accès en `foaf:page` | [ADR-0004](decisions/ADR-0004-nature-des-entrees.md) |
| `rdgf:testCase` | service | nœud `rdgf:TestCase` : `title`, `description`, `rdgf:origin` (`administration`, `case-law`, `circular`, `anonymised-case`, `community`), `prov:wasAttributedTo`, `dct:date`, `adms:status` (`valid`, `pending`, `failing`), `dct:format`, `dct:source` (le test natif), `cv:hasLegalResource`, `rdgf:tolerance` | [ADR-0006](decisions/ADR-0006-cas-de-tests.md) |
| `rdgf:operationalMapping` | service | nœud `rdgf:OperationalMapping` : `title`, `rdgf:mapsFrom`, `rdgf:mapsTo`, `dct:source`, `dct:publisher`, `adms:status` | [ADR-0017](decisions/ADR-0017-correspondances-recensees.md) |
| `rdgf:versionEvent` | service | nœud `rdgf:VersionEvent` : `dct:version`, `dct:issued`, `rdgf:changeKind` (`major`, `minor`, `legal`), `rdgf:triggeredBy` → subdivision ELI, `description` | [ADR-0008](decisions/ADR-0008-versions.md) |
| `rdgf:engineProfile` | service | littéral JSON (`"@type": "@json"`) : le modèle de situations du moteur, transmis tel quel | [ADR-0001](decisions/ADR-0001-perimetre-rdgf.md) |

Les résultats d'exécution du registre ne sont pas dans les fiches : `scripts/verify-rules.mjs` écrit une assertion EARL par cas rejoué et par contrôle de dérive fiche/API dans `app/data/verification.json` ([ADR-0006](decisions/ADR-0006-cas-de-tests.md)). Le badge « résultats testés » et le niveau de la règle en sont calculés.

## 7. Processus

1. Le dépôt data reste la source de vérité des fiches ; le front les consomme via `pnpm sync:data` et n'édite jamais une fiche vendorée.
2. L'adaptateur lit la surcouche `rdgf:` quand une fiche la contient ; les qualifications encore écrites côté front (mocks) migrent dans les fiches à mesure que le dépôt data les adopte. `profileGaps` doit tendre vers zéro, c'est l'indicateur de convergence du contrat (`pnpm check:contrat`, qui vérifie aussi que toute clé `rdgf:` est déclarée dans le contexte partagé, que les valeurs appartiennent à leur schéma et que les exigences du niveau d'engagement sont remplies).
3. Validation : contrôles structurels du script, puis shapes SHACL CPSV-AP 3.2.0 en CI du dépôt data, étendues aux invariants `rdgf:` ([ADR-0019](decisions/ADR-0019-validation.md), proposée).
