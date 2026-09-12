---
status: accepted
date: 2026-09-12
decision-makers: équipe du registre
consulted: dépôt data
scope: registre
---
# Le registre calcule le niveau d'une règle

## Contexte et problème

Le registre qualifie chaque règle par un niveau, « référencée », « documentée », « vérifiée », « exécutable », qui active les services de l'interface. Chaque palier se déduit de la fiche et des exécutions : une base légale et un organisme, des métadonnées complètes, des tests exécutés avec succès par le registre, un canal d'exécution. Qui établit ce niveau ?

## Options considérées

* Le registre calcule le niveau.
* Le producteur le déclare et le registre affiche l'écart avec ce qu'il constate.

## Décision

Option retenue : le registre calcule le niveau, parce qu'un niveau calculé est vérifiable et qu'un niveau déclaré ajoute un champ et un écart à gérer.

Le niveau est absent de la fiche. Le registre le calcule à partir de la base légale et de l'organisme, de la complétude des métadonnées, du résultat des tests qu'il a exécutés et de la présence d'un canal. L'échelle interne `N0` à `N3` reste un outil du code ; l'interface affiche les libellés.

### Conséquences

* Bon, parce qu'un producteur obtient « vérifiée » en publiant des tests que le registre exécute, « exécutable » en déclarant un canal.
* Bon, parce que l'engagement (ADR-0002) et le niveau sont deux axes, l'un déclaré, l'autre calculé.
* Mauvais, parce qu'un producteur ne peut pas afficher un niveau visé ; un niveau déclaratif distinct peut s'ajouter si l'équipe data le souhaite.
