---
status: accepted
date: 2026-05-01
decision-makers: équipe du registre
scope: partagée
---
# Une fiche est un fichier JSON-LD

## Contexte et problème

Le registre décrit des règles d'administrations et de moteurs différents, pour des réutilisateurs qui lisent du JSON avec leurs outils habituels et pour des catalogues européens qui lisent du RDF. Quel format de fiche sert les deux ?

## Décision

Une fiche est un fichier `metadata.jsonld` : un `@context` qui aplatit les clés affichées, `title`, `description`, et déclare chaque préfixe, un `@graph` qui décrit le service, ses entrées, ses sorties, ses organismes et ses canaux. Une clé absente du contexte est une erreur, parce qu'une clé nue disparaît à l'expansion et qu'une clé à préfixe inconnu produit une IRI invalide.

### Conséquences

* Bon, parce que le site du registre lit les fiches comme du JSON et qu'un consommateur RDF obtient un graphe.
* Bon, parce qu'une sérialisation Turtle et un schéma JSON se dérivent du contexte et des shapes.
* Mauvais, parce que la validation doit comprendre une expansion JSON-LD et comparer les clés du document aux triplets produits.
