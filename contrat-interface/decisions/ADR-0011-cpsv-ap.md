---
status: proposed
date: 2026-07-08
decision-makers: équipe du registre
consulted: dépôt data
scope: fiche
---
# Une règle est un service public au sens de CPSV-AP, avec CCCEV pour les entrées et ELI pour la loi

## Contexte et problème

Une règle du registre est un calcul qu'une administration effectue pour produire une décision. Quel vocabulaire décrit ce service, son autorité, sa base légale, ses entrées et ses sorties, et est reconnu par les autres registres européens ? Le profil de base est en usage dans le dépôt data ; le statut `proposed` concerne les corrections de conformité.

## Facteurs de décision

* CPSV-AP 3.2.0 décrit un service public avec son autorité compétente, ses ressources légales, ses canaux, ses pièces en entrée par `cpsv:hasInput` vers `cv:Evidence`, ses sorties. CCCEV décrit les pièces, ELI les textes.
* Le rejeu des shapes SHACL officielles sur les fiches du dépôt data détecte quatre écarts : `cv:hasInput` à la place de `cpsv:hasInput`, des entrées sans type `cv:Evidence`, des organismes sans `org:Organization` ni `dct:spatial`, des titres sans étiquette de langue.

## Décision

* Une règle est un `cpsv:PublicService` avec `dct:identifier`, `title`, `description`, `dct:version`, un `cv:hasCompetentAuthority` décrit dans le graphe en `cv:PublicOrganisation` et `org:Organization` avec `dct:spatial`, des `cv:hasLegalResource` en ELI (ADR-0007), des `cv:hasChannel`.
* Les entrées sont des `cv:Evidence` sous `cpsv:hasInput`, avec un `@id` de fragment, un titre étiqueté, un `sh:datatype` et la nature de leur fait (ADR-0004).
* Les sorties sont sous `cpsv:produces`, dont une sortie d'explication quand le moteur la fournit.
* Titres et descriptions utilisent les alias du contexte, qui fixent leur langue (ADR-0014).

### Conséquences

* Bon, parce qu'un terme `rdgf:` existe seulement pour ce que CPSV-AP, CCCEV et ELI laissent sans expression.
* Mauvais, parce que les fiches du dépôt data demandent quatre corrections, à co-écrire avec les producteurs.

### Confirmation

Les fiches de proposition passent les shapes officielles CPSV-AP 3.2.0.
