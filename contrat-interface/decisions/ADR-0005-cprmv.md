---
status: proposed
date: 2026-09-12
decision-makers: équipe du registre
consulted: dépôt data, ICTU
scope: fiche
---
# CPRMV sert au typage des sorties et, à terme, des cas de tests

## Contexte et problème

Le registre travaille avec ICTU, éditeur du Core Public Rule Management Vocabulary dans GovTech4All, et a intérêt à ce que ses fiches restent lisibles par l'outillage néerlandais. Les fiches du dépôt data typent aujourd'hui leurs entrées `cprmv:Parameter` avec `cprmv:type`. Que reprendre de CPRMV ?

## Facteurs de décision

* CPRMV 0.4.1, premier brouillon public du 20 avril 2026, définit une méthode de modélisation : une règle est un ensemble de règles, ses paramètres sont des règles qui varient plus souvent qu'elle.
* `cprmv:Parameter` désigne un montant revalorisé ; la spécification ne définit ni entrée, ni pièce, ni type de donnée, ni `cprmv:type`.
* `TestCase` et `TestSet` existent, sans méthode de test enregistrée. Le namespace est versionné, `https://standaarden.open-regels.nl/standards/cprmv/0.4.1#`.

## Options considérées

* Typer les entrées en `cv:Evidence` avec `sh:datatype`, et réserver CPRMV aux sorties et aux cas de tests.
* Garder le double typage des entrées en `cv:Evidence` et `cprmv:Parameter`.

## Décision

Option retenue : CPRMV pour les sorties et les cas de tests, parce que le double typage affirme qu'une donnée de situation est un paramètre au sens de la spécification et introduit sa méthode de modélisation dans le profil.

Les entrées sont typées `cv:Evidence` et déclarent leur type XSD par `sh:datatype`. Le préfixe `cprmv` est déclaré dans le contexte partagé sur le namespace 0.4.1 et type les sorties, `cpsv:produces` vers `cprmv:Rule`. L'enveloppe de cas de tests (ADR-0006) accepte un typage secondaire `cprmv:TestCase` dès qu'ICTU enregistre une méthode de test.

### Conséquences

* Bon, parce que les fiches restent lisibles par l'outillage CPRMV pour ce qu'il définit.
* Mauvais, parce que le contexte suit le numéro de version du namespace CPRMV à chaque révision.
* Mauvais, parce que les fiches du dépôt data changent le typage de toutes leurs entrées.

### Confirmation

Le contrôle de contrat signale `cprmv:Parameter` et `cprmv:type` sur une entrée comme une erreur.

## Informations complémentaires

Trois points à discuter avec ICTU : le namespace définitif, le sens de `Parameter`, la convergence entre l'enveloppe de tests et `TestCase` / `TestSet`.
