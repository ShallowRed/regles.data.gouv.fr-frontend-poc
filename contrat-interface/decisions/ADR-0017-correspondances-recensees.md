---
status: accepted
date: 2026-07-08
decision-makers: équipe du registre
scope: registre
---
# Le registre recense les correspondances entre notions en production

## Contexte et problème

Une même notion, le couple, le revenu, a une extension différente d'une administration à l'autre, et un service qui réutilise une règle projette ses données vers les entrées du moteur. Comment le registre aide-t-il à cette projection ?

## Facteurs de décision

* Une table de correspondances rédigée se dégrade à chaque réforme de chaque côté.
* Un dispatcher en production, exercé par une intégration continue, signale sa divergence quand ses tests échouent.

## Décision

Le registre recense les correspondances opérationnelles existantes, `rdgf:operationalMapping`, avec ce qu'elles projettent, `rdgf:mapsFrom` et `rdgf:mapsTo`, l'artefact en `dct:source`, le mainteneur en `dct:publisher` et l'état de son intégration continue en `adms:status`.

### Conséquences

* Bon, parce qu'une correspondance dont l'intégration continue échoue s'affiche avec cet état.
* Bon, parce que `m8g:query` de CCCEV peut décrire l'extraction d'une valeur si les correspondances deviennent exécutables par le registre.
* Mauvais, parce qu'une notion sans correspondance en production reste sans aide.
