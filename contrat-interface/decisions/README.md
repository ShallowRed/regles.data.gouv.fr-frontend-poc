# Décisions sur le format des fiches

Chaque décision structurante sur le profil de métadonnées est consignée ici au format MADR, selon l'[ADR-0000](ADR-0000-principe.md). Le frontmatter contient le statut, la date, les rôles et la portée.

Chaque ADR a une **portée** :

- **registre** : la décision concerne la surcouche `rdgf:` ou le fonctionnement du registre, elle se prend dans ce dépôt ;
- **fiche** : la décision touche le profil de base des fiches du dépôt data, elle se co-écrit avec lui et reste « proposée » jusque-là ;
- **partagée** : les deux.

## Profil de base des fiches

| ADR | Décision | Portée | Statut |
|---|---|---|---|
| [ADR-0000](ADR-0000-principe.md) | Consigner les décisions sur le format en ADR | registre | accepted |
| [ADR-0010](ADR-0010-json-ld.md) | Une fiche est un fichier JSON-LD | partagée | accepted |
| [ADR-0011](ADR-0011-cpsv-ap.md) | Une règle est un service public au sens de CPSV-AP, avec CCCEV pour les entrées et ELI pour la loi | fiche | proposed (corrections) |
| [ADR-0012](ADR-0012-unite-de-referencement.md) | Une fiche décrit un calcul certifiable, la composition passe par `dct:requires` | fiche | proposed |
| [ADR-0013](ADR-0013-code-epingle.md) | Le code d'une règle est désigné à un commit, un fichier et une portée | fiche | accepted |
| [ADR-0014](ADR-0014-litteraux-multilingues.md) | Les littéraux affichés sont multilingues, le français sert de langue de repli | partagée | proposed |
| [ADR-0018](ADR-0018-identifiants-et-uri.md) | Identifiants et URI des règles | fiche | proposed |
| [ADR-0005](ADR-0005-cprmv.md) | CPRMV sert au typage des sorties et, à terme, des cas de tests | fiche | proposed |
| [ADR-0007](ADR-0007-base-legale.md) | La base légale désigne l'article en ELI, le texte entier reste admis | fiche | proposed |

## Surcouche `rdgf:`

| ADR | Décision | Portée | Statut |
|---|---|---|---|
| [ADR-0001](ADR-0001-perimetre-rdgf.md) | La surcouche décrit l'engagement, la provenance et la validation  ; la description des situations est du ressort du moteur | registre | accepted |
| [ADR-0002](ADR-0002-certification.md) | L'engagement du producteur est un nœud `rdgf:certification` à deux niveaux | registre | accepted |
| [ADR-0004](ADR-0004-nature-des-entrees.md) | Chaque entrée indique la nature de son fait, `rdgf:factKind`, et l'organisme qui l'atteste en `dct:publisher` | registre | accepted |
| [ADR-0006](ADR-0006-cas-de-tests.md) | L'enveloppe d'un cas de test est dans la fiche, les résultats d'exécution s'écrivent en EARL | registre | accepted |
| [ADR-0008](ADR-0008-versions.md) | Trois axes de version, et un événement daté par version relié au texte déclencheur | partagée | accepted (événement), proposed (URI) |
| [ADR-0017](ADR-0017-correspondances-recensees.md) | Le registre recense les correspondances entre notions en production | registre | accepted |
| [ADR-0009](ADR-0009-publication.md) | Le vocabulaire est publié à `https://regles.data.gouv.fr/def/rdgf#`, ses énumérations sont des concepts SKOS | registre | accepted |

## Fonctionnement du registre

| ADR | Décision | Portée | Statut |
|---|---|---|---|
| [ADR-0003](ADR-0003-niveau-derive.md) | Le registre calcule le niveau d'une règle | registre | accepted |
| [ADR-0015](ADR-0015-source-de-verite.md) | Le dépôt data est la source de vérité, le registre synchronise et lit un index | registre | accepted |
| [ADR-0016](ADR-0016-anti-fabrication.md) | Un champ manquant reste vide, et l'écart au profil est publié | registre | accepted |
| [ADR-0019](ADR-0019-validation.md) | Les fiches sont validées par des shapes SHACL, avec une sévérité selon l'engagement | partagée | proposed |

## Le vocabulaire qui en résulte

| Terme | Nature | Domaine | Valeurs |
|---|---|---|---|
| `rdgf:certification` | propriété | service | nœud `rdgf:Certification` |
| `rdgf:Certification` | classe | | |
| `rdgf:certificationLevel` | propriété | `rdgf:Certification` | `certified`, `self-assessed` |
| `rdgf:factKind` | propriété | `cv:Evidence` | `declared`, `attested`, `derived`, `context` |
| `rdgf:testCase` | propriété | service | nœud `rdgf:TestCase` |
| `rdgf:TestCase` | classe | | |
| `rdgf:origin` | propriété | `rdgf:TestCase` | `administration`, `case-law`, `circular`, `anonymised-case`, `community` |
| `rdgf:tolerance` | propriété | `rdgf:TestCase` | littéral |
| `rdgf:operationalMapping` | propriété | service | nœud `rdgf:OperationalMapping` |
| `rdgf:OperationalMapping` | classe | | |
| `rdgf:mapsFrom`, `rdgf:mapsTo` | propriétés | `rdgf:OperationalMapping` | littéraux |
| `rdgf:versionEvent` | propriété | service | nœud `rdgf:VersionEvent` |
| `rdgf:VersionEvent` | classe | | |
| `rdgf:changeKind` | propriété | `rdgf:VersionEvent` | `major`, `minor`, `legal` |
| `rdgf:triggeredBy` | propriété | `rdgf:VersionEvent` | subdivision ELI |
| `rdgf:engineProfile` | propriété | service | littéral JSON |

## Ordre du jour avec le dépôt data

Les décisions « proposées » forment l'ordre du jour de la co-écriture avec le dépôt data, par impact décroissant : le typage des entrées en `cv:Evidence` avec `sh:datatype` (ADR-0005) et les corrections de conformité (ADR-0011), qui touchent toutes les fiches ; l'unité de référencement (ADR-0012), qui redécoupe Prest'Agri ; les identifiants et URI (ADR-0018) et les axes de version (ADR-0008), qui fixent les noms ; la base légale à l'article (ADR-0007) et les littéraux multilingues (ADR-0014), fiche par fiche ; la validation en intégration continue (ADR-0019).
