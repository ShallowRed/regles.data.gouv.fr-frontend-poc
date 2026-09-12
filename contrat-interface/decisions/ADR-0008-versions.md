---
status: accepted
date: 2026-09-12
decision-makers: équipe du registre
consulted: dépôt data
scope: partagée
---
# Trois axes de version, et un événement daté par version relié au texte déclencheur

## Contexte et problème

Le registre dit quelle règle il décrit, à quel numéro, et pourquoi chaque version existe. Le choix de la version applicable à une date est une question de droit transitoire, que la règle calcule à partir d'une date de référence reçue en entrée de contexte. Comment écrire l'historique ? Le statut est `accepted` pour l'événement de version et `proposed` au dépôt data pour les axes d'URI.

## Facteurs de décision

* CPSV-AP décrit l'état d'un service avec `adms:status` ; DCAT-AP offre des notes de version en prose ; ELI date un article.
* Les modèles néerlandais distinguent la date de validité et la date de consultation pour représenter une correction rétroactive.

## Options considérées

* Un événement par version, daté, relié au texte déclencheur.
* Des événements avec des dates d'effet.

## Décision

Option retenue : un événement par version relié au texte, parce que des dates d'effet feraient affirmer à la fiche quelle version s'applique à une date, ce que seule la règle calcule.

| Axe | Porté par | Change quand |
|---|---|---|
| la lignée | l'URI, `/v1`, ou la variante d'implémentation, `.openfisca-france` | les entrées ou les sorties deviennent incompatibles |
| le numéro dans la lignée | `dct:version`, en semver | à chaque publication |
| l'historique | `rdgf:versionEvent`, un nœud par version publiée | à chaque publication |

```jsonc
"rdgf:versionEvent": [{
  "type": "rdgf:VersionEvent",
  "dct:version": "1.2.0",
  "dct:issued": "2025-09-17",
  "rdgf:changeKind": "legal",
  "rdgf:triggeredBy": { "id": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000…" },
  "description": "Nouveau barème du crédit d'impôt recherche."
}]
```

`rdgf:changeKind` vaut `major`, `minor` ou `legal`. `rdgf:triggeredBy` référence une subdivision ELI qui a sa propre `eli:version_date` ; `dct:issued` date la publication par le registre. Deux implémentations d'une même règle sont deux fiches reliées par `cv:relatedService`.

### Conséquences

* Bon, parce que la rétroactivité correspond à l'écart entre `dct:issued` et la date de version du texte.
* Bon, parce que l'interface affiche l'historique dans l'ordre des `dct:issued`, avec le texte déclencheur.
* Mauvais, parce qu'une rupture d'entrées ou de sorties crée une nouvelle URI et des renvois entre les deux.
