---
status: accepted
date: 2026-09-12
decision-makers: équipe du registre
informed: dépôt data
scope: registre
---
# Le dépôt data est la source de vérité, le registre synchronise les fiches et lit un index

## Contexte et problème

Les fiches sont écrites par les producteurs et maintenues dans le dépôt data. Comment le registre les affiche-t-il et les vérifie-t-il en restant fidèle à cette source ?

## Décision

Le registre synchronise les fiches dans son propre dépôt (`pnpm sync:data`) et ne les modifie pas ; une proposition de modification est une contribution au dépôt data. La synchronisation génère l'index `catalog.json`, avec pour chaque entrée l'organisme, le slug, le titre, l'identifiant, la version, les langues, le chemin source et les compteurs d'écarts, et un en-tête avec le commit source et la date, et produit le rapport de conformité, public. Le registre lit l'index et les fiches qu'il référence.

### Conséquences

* Bon, parce qu'un écart entre une fiche et le profil apparaît dans le rapport, la fiche restant identique.
* Bon, parce que la génération de l'index peut passer en intégration continue du dépôt data et produire un index DCAT par le même passage.
* Mauvais, parce qu'une correction apparaît dans le registre après sa fusion dans le dépôt data.
