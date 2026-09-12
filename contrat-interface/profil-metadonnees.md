# Contrat d'interface front ↔ data - profil de métadonnées

> **Statut : proposition v0.** Ce document vit côté POC front le temps de la discussion ; sa cible est le dépôt `datagouv/regles.data.gouv.fr`, qui reste la source de vérité des fiches. Il décrit le profil tel que le front le lit aujourd'hui. Les décisions qui fixent la version suivante du vocabulaire `rdgf:` sont consignées dans [decisions/](decisions/) ; la section 6 sera réécrite quand elles seront appliquées aux fiches et à l'adaptateur.

Le contrat tient en trois pièces :

1. **Le profil de `metadata.jsonld`** - champs obligatoires et optionnels, vocabulaires (sections 1 à 3 et 6).
2. **Une convention de slugs et d'URI** - sans espaces ni accents (section 4).
3. **Un index de catalogue généré** - le front ne crawle pas une arborescence (section 5).

Le dépôt data apporte la conformité SEMIC (CPSV-AP, CCCEV, sous-ensemble descriptif de CPRMV) ; le front apporte la couche confiance, proposée en extension JSON-LD (section 6). Les deux fiches de [propositions/](propositions/) montrent le profil complet sur des cas réels.

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

## 3. Régimes de certification

Le profil admet des variantes selon `rdgf:certificationRegime` :

| Régime | Quand | Ce que le profil exige en plus |
|---|---|---|
| `frontiere` | règle packageable : autorité claire, dépendances peu profondes | nature des entrées (section 6), cas de tests avec enveloppe |
| `implementation` | cœur socio-fiscal : chaîne de dépendances sans porteur unique | snapshot d'implémentation (dépôt et SHA), suite de tests native référencée |
| `referencement` | ni code ni tests publiés | socle descriptif seul |

## 4. Conventions de nommage

- **Arborescence** : `site/<org-slug>/<rule-slug>/metadata.jsonld`, slugs kebab-case ASCII.
- **Identifiant** : `<domaine>.<slug>.<variante>` (`civique.droit-vote.v1`) ; pour le régime implémentation, la variante nomme l'implémentation (`solidarite.prime-activite.openfisca-france`).
- **URI canonique de service** : `https://regles.data.gouv.fr/regles/<org-slug>/<rule-slug>/<variante>`. Les URI GitHub restent en `dct:source` et `schema:codeRepository`.
- **Trois axes de version** : l'URI porte la lignée (`/v1`, ou la variante d'implémentation) ; `dct:version` le semver dans la lignée ; `rdgf:versionEvent` l'historique daté relié aux textes déclencheurs. Une rupture de frontière crée une nouvelle URI ; deux implémentations de la même règle sont deux fiches reliées par `cv:relatedService`.
- **Entrées et sorties adressables** : un `@id` de fragment (`<uri-service>#input-<identifiant>`) plutôt qu'un blank node.

## 5. Index de catalogue (`catalog.json`)

Généré côté front par `scripts/sync-data-repo.mjs` (`pnpm sync:data`), à terme côté dépôt data en CI. Champs par entrée : `organisation`, `organisationSlug`, `slug`, `title`, `identifier`, `version`, `languages`, `sourcePath`, `conformite`. En-tête : commit source, date. Le front ne lit que l'index et les fiches qu'il référence. `title` est une chaîne quand la fiche n'a qu'une langue, un objet `{ "fr": "…", "en": "…" }` sinon.

## 6. Extensions « couche confiance » (namespace `rdgf:`)

Namespace `"rdgf": "https://regles.data.gouv.fr/def/catalogue#"`. Ce sont les champs que le front affiche et que le profil SEMIC ne porte pas ; leur absence sur une fiche apparaît dans `profileGaps`.

| Propriété | Porte sur | Valeurs | Rôle |
|---|---|---|---|
| `rdgf:maturity` | service | `N0` à `N3` | active les services progressivement |
| `rdgf:certificationRegime` | service | `frontiere`, `implementation`, `referencement` | section 3 |
| `rdgf:boundaryKind` | `cprmv:Parameter` | `declaration`, `donnee-attestee`, `sortie-regle`, `contexte` | dit ce que couvre un badge « certifiée » |
| `rdgf:evidenceSource` | `cprmv:Parameter` | nœud { label, url } | ancrage d'une donnée attestée à son propriétaire institutionnel |
| `rdgf:testCase` | service | nœud { `intent`, `provenance`, `validatedBy`, `validatedAt`, `legalAnchor`, `tolerance`, `status`, `nativeFormat`, `nativeRef` } | le test natif fait foi, le catalogue norme l'enveloppe |
| `rdgf:operationalMapping` | service | nœud { `from`, `to`, `artifact`, `maintainedBy`, `ciStatus` } | recense des correspondances qui tournent |
| `rdgf:implementationSnapshot` | service (régime `implementation`) | nœud { `repository`, `ref` } | l'unité certifiable du régime implémentation |
| `rdgf:engineProfile` | service | littéral JSON (`"@type": "@json"`) | les opinions du moteur (entités, périodes) restent locales et opaques au catalogue |
| `rdgf:versionEvent` | service | nœud { `version`, `date`, `kind`, `triggeredBy` → ELI } | historique lié aux textes déclencheurs |

Les valeurs d'énumération sont des chaînes nues, consommables en JSON sans résolution et contraignables par `sh:in`.

## 7. Processus

1. Le dépôt data reste la source de vérité des fiches ; le front les consomme via `pnpm sync:data` et n'édite jamais une fiche vendorée.
2. Les surcouches du front sont temporaires : dès que le profil `rdgf:` est accepté, elles migrent dans les fiches et l'adaptateur les lit. `profileGaps` doit tendre vers zéro, c'est l'indicateur de convergence du contrat (`pnpm check:contrat`).
3. Validation : contrôles structurels du script, puis shapes SHACL CPSV-AP 3.2.0 en CI du dépôt data, étendues au namespace `rdgf:` une fois le profil stabilisé.
