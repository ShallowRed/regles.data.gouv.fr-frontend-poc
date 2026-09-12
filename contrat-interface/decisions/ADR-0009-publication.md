---
status: accepted
date: 2026-09-12
decision-makers: équipe du registre
consulted: dépôt data
informed: data.gouv.fr
scope: registre
---
# Le vocabulaire est publié à `https://regles.data.gouv.fr/def/rdgf#`, ses énumérations sont des concepts SKOS

## Contexte et problème

Chaque terme `rdgf:` doit avoir une définition consultable à son IRI, un fichier lisible par machine, un contexte JSON-LD partagé et des shapes. Quel namespace, et quelle forme pour les listes de valeurs ?

## Facteurs de décision

* Les vocabulaires SEMIC publient un namespace sans numéro de version, versionnent la spécification en semver et prescrivent les listes contrôlées en SKOS.
* CPRMV a choisi un namespace versionné dans l'IRI, qui change toutes les IRI à chaque révision.
* Le domaine `regles.data.gouv.fr` est une décision produit, à confirmer avec data.gouv.fr.

## Options considérées

* Des énumérations SKOS dès la publication, rendues lisibles comme des chaînes par le contexte.
* Des chaînes nues contraintes par `sh:in`, avec les libellés et définitions publiés à part.

## Décision

Option retenue : namespace stable et énumérations SKOS, parce que le contexte JSON-LD rend les concepts aussi simples à écrire que des chaînes et que les définitions vivent avec le vocabulaire.

* Namespace `https://regles.data.gouv.fr/def/rdgf#`, préfixe `rdgf`, sans numéro de version ; spécification versionnée en semver.
* Un `skos:ConceptScheme` par liste, `certificationLevel`, `factKind`, `origin`, `changeKind`, un concept par valeur avec libellés français et anglais. Le contexte déclare ces propriétés en `@type: @vocab` : une fiche écrit `"rdgf:factKind": "attested"`, un consommateur RDF lit l'IRI du concept.
* À l'URI du namespace : une page par terme, le Turtle, le contexte partagé, les shapes SHACL des invariants.
* Les fiches référencent le contexte publié par son URL.

### Conséquences

* Bon, parce que les fiches n'écrivent que des chaînes et qu'une révision du vocabulaire conserve leurs IRI.
* Mauvais, parce que la publication est un livrable à produire ; en attendant, le contexte est un fichier du dépôt, de contenu identique.

### Confirmation

Le contrôle de contrat valide les valeurs contre les schémas de concepts et traite une clé absente du contexte comme une erreur bloquante.
