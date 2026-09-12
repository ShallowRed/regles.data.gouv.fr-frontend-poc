---
status: proposed
date: 2026-09-12
decision-makers: équipe du registre
consulted: dépôt data
scope: fiche
---
# Une fiche décrit un calcul certifiable, la composition passe par `dct:requires`

## Contexte et problème

Un dépôt de code peut contenir plusieurs calculs, le quotient familial et l'aide à la scolarité, et l'un peut utiliser l'autre. Qu'est-ce qu'une fiche décrit, le dépôt ou chaque calcul ?

## Facteurs de décision

* Un engagement concerne un comportement entrées-sorties (ADR-0002) et suppose un calcul délimité.
* CPSV-AP relie un service qui en utilise un autre par `dct:requires` et réserve `dct:isPartOf` au rattachement à un jeu de données ; un nœud qui décrirait le dépôt seul est rejeté par les shapes, faute de titre, d'identifiant et d'autorité.

## Options considérées

* Une fiche par calcul certifiable, reliée aux calculs qu'elle utilise.
* Une fiche par dépôt avec des sous-services.

## Décision

Option retenue : une fiche par calcul, parce que c'est l'unité d'un engagement et la seule qui passe les shapes.

Quand un calcul utilise la sortie d'un autre, la fiche le déclare par `dct:requires`, et l'entrée correspondante a `rdgf:factKind: derived`. Le regroupement par dépôt ou par organisme se fait dans l'index. Deux implémentations d'une même règle sont deux fiches reliées par `cv:relatedService`. Une variable se désigne par l'`@id` de fragment de son entrée.

### Conséquences

* Bon, parce que chaque fiche a un engagement précis.
* Mauvais, parce que Prest'Agri devient deux fiches, quotient familial et aide à la scolarité, la seconde requérant la première.
