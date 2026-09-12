---
status: accepted
date: 2026-07-08
decision-makers: équipe du registre
scope: registre
---
# Un champ manquant reste vide, et l'écart au profil est publié

## Contexte et problème

La confiance dans le registre repose sur une règle : chaque information affichée existe dans une fiche ou dans une exécution. Que faire d'une fiche incomplète ?

## Décision

Quand une information manque, le champ reste vide et la section de l'interface qui en dépend reste absente. L'adaptateur qui lit une fiche liste les écarts au profil ; cette liste est publique, dans le rapport de conformité et sur la fiche. Une valeur attendue de test vient d'un calcul réel, daté et attribué.

### Conséquences

* Bon, parce que chaque libellé de l'interface correspond à une information présente dans la fiche.
* Bon, parce que la convergence du contrat se mesure au nombre d'écarts par fiche.
* Mauvais, parce qu'une fiche incomplète affiche une page plus courte.
