---
status: accepted
date: 2026-09-12
decision-makers: équipe du registre
scope: registre
---
# Consigner les décisions sur le format en ADR au format MADR

## Contexte et problème

Le format des fiches engage le registre, le dépôt data, les producteurs de règles et les partenaires européens. Comment garder, avec chaque choix structurant, ses raisons et les options écartées, lisibles des mois plus tard par une personne qui n'a pas participé à la discussion ?

## Décision

Toute décision structurante sur le format est un enregistrement de décision d'architecture, un fichier `ADR-NNNN-<sujet>.md` dans ce dossier, au format MADR ([adr.github.io/madr](https://adr.github.io/madr/)), numéroté dans l'ordre des décisions et listé dans le README par portée.

Le frontmatter contient les champs MADR : `status` parmi `proposed`, `accepted`, `deprecated`, `superseded by ADR-NNNN` ; `date` de la dernière mise à jour ; `decision-makers`, `consulted`, `informed`, exprimés en rôles, l'équipe du registre, le dépôt data, les producteurs, un partenaire. Un champ `scope` ajoute la portée : `registre` quand la décision se prend dans ce dépôt, `fiche` quand elle touche le profil de base des fiches du dépôt data, `partagée` pour les deux. Une décision de portée `fiche` a le statut `proposed` jusqu'à sa co-écriture avec le dépôt data.

Le corps suit les sections MADR, en français : le titre, « Contexte et problème », « Facteurs de décision » quand ils aident, « Options considérées » quand plusieurs solutions se tenaient, « Décision » avec l'option retenue et sa justification, « Conséquences » en bonnes et mauvaises, « Confirmation » quand un contrôle vérifie l'application, « Informations complémentaires » pour ce qui reste ouvert.

Un ADR décrit le format tel qu'il est décidé et se révise par un nouvel ADR ; l'ancien passe en `superseded`.

### Conséquences

* Bon, parce que le format est celui d'un outillage existant, lisible par des lecteurs habitués aux ADR.
* Bon, parce que le README liste les décisions à co-écrire avec le dépôt data.
* Mauvais, parce qu'une décision de détail suit le même gabarit ; un ADR court est admis.
