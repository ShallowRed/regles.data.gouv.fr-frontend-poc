---
status: proposed
date: 2026-09-12
decision-makers: équipe du registre
consulted: dépôt data
scope: fiche
---
# Identifiants et URI des règles

## Contexte et problème

Une règle a besoin d'un identifiant court pour les humains et les index, et d'une URI pérenne qui serve de nom dans les fiches et les liens. Les fiches du dépôt data suivent deux schémas, l'un sous `regles.gouv.fr/algo/…`, l'autre sous `github.com/…#…`. Quelles conventions ?

## Facteurs de décision

* Une URI GitHub lie l'identité d'une règle à l'hébergement de son code.
* Une URI sous le domaine du produit est un identifiant, et un identifiant existe avant que le domaine y réponde.

## Décision

* Arborescence : `site/<org-slug>/<rule-slug>/metadata.jsonld`, slugs en kebab-case ASCII.
* Identifiant : `<domaine>.<slug>.<variante>`, par exemple `civique.droit-vote.v1` ; la variante nomme l'implémentation quand la règle est cataloguée par implémentation, `solidarite.prime-activite.openfisca-france`.
* URI canonique : `https://regles.data.gouv.fr/regles/<org-slug>/<rule-slug>/<variante>`. Les URI GitHub restent dans `dct:source` et `schema:codeRepository`.
* Entrées, sorties, cas de tests et événements ont un `@id` de fragment sous l'URI de la règle, `#input-<identifiant>`.

### Conséquences

* Bon, parce que la lignée d'une règle est lisible dans son URI (ADR-0008) et que chaque entrée est adressable.
* Mauvais, parce que les fiches existantes changent d'URI, et que la résolution des URI dépend du domaine.
