---
status: accepted
date: 2026-07-08
decision-makers: équipe du registre
scope: fiche
---
# Le code d'une règle est désigné à un commit, un fichier et une portée

## Contexte et problème

Un engagement, un cas de test ou une exécution se rapportent à une version précise du code. Un lien vers une branche change de contenu au fil des commits. Comment désigner le code ?

## Décision

Le dépôt est décrit par un `schema:SoftwareSourceCode` dont `schema:codeRepository` désigne l'arborescence à un commit précis, avec le langage, la version et, quand il existe, un `schema:HowTo` d'installation. `dct:source` de la règle désigne le fichier et la portée exacts, la fonction Catala ou le fichier Publicodes, au même commit. Un cas de test natif est désigné de la même façon (ADR-0006).

### Conséquences

* Bon, parce que le registre exécute les tests contre ce commit et le nomme dans ses assertions.
* Mauvais, parce qu'une nouvelle version de code s'accompagne d'un nouvel événement de version (ADR-0008).
