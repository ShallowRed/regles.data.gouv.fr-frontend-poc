---
status: proposed
date: 2026-09-12
decision-makers: équipe du registre
consulted: dépôt data
scope: partagée
---
# Les fiches sont validées par des shapes SHACL, avec une sévérité selon l'engagement

## Contexte et problème

Une clé mal orthographiée disparaît à l'expansion, un type mal écrit devient une chaîne. Une règle référencée et une règle certifiée n'ont pas les mêmes obligations. Comment valider les fiches avant publication ?

## Facteurs de décision

* Les shapes SHACL officielles de CPSV-AP 3.2.0 s'exécutent en Node et détectent les écarts constatés sur les fiches du dépôt data.
* Les invariants de la surcouche s'écrivent en SHACL core.

## Décision

* Trois couches de contrôle : les contrôles structurels de la synchronisation, les shapes officielles CPSV-AP, les shapes du vocabulaire `rdgf:` publiées avec lui (ADR-0009).
* Une sévérité selon l'engagement : erreur bloquante pour ce que le niveau déclaré exige, avertissement pour le reste ; une règle sans engagement est tenue au profil de base.
* Un contrôle de couverture du contexte : comparaison des clés du document aux triplets produits par l'expansion, écart bloquant.
* Les résultats sont publics, dans le rapport de conformité et sur la fiche.

### Conséquences

* Bon, parce que le rapport de conformité distingue erreurs et avertissements par fiche.
* Bon, parce que les contrôles peuvent passer en intégration continue du dépôt data, en refusant la fusion d'une fiche en erreur.
* Mauvais, parce que la validation dépend de la publication du vocabulaire (ADR-0009).
