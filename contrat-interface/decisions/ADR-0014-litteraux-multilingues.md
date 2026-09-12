---
status: proposed
date: 2026-09-12
decision-makers: équipe du registre
consulted: dépôt data
scope: partagée
---
# Les littéraux affichés sont multilingues, le français sert de langue de repli

## Contexte et problème

Le registre a aussi des lecteurs européens : titre, description, définitions des entrées et libellés d'organismes doivent exister en anglais dans la même fiche. Comment les écrire ?

## Décision

Chaque littéral affiché s'écrit en tableau de `{ "@value", "@language" }`, forme prévue par JSON-LD 1.1, une entrée par langue ; un texte identique dans toutes les langues s'écrit en chaîne simple. Le consommateur choisit la langue demandée, puis le français, puis le premier littéral disponible. Restent en français dans toutes les langues : le nom des textes de loi, les extraits réglementaires, le code des règles, les identifiants, versions et valeurs de tests.

### Conséquences

* Bon, parce que les shapes exigent une étiquette de langue sur `dct:title` et que le tableau la fournit.
* Bon, parce qu'une langue s'ajoute par une entrée.
* Mauvais, parce que l'index contient un objet `{ fr, en }` pour le titre quand la fiche a plusieurs langues.
