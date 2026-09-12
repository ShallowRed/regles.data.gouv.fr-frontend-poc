---
status: accepted
date: 2026-09-12
decision-makers: équipe du registre
consulted: dépôt data
informed: ICTU
scope: registre
---
# La surcouche `rdgf:` décrit l'engagement, la provenance et la validation  ; la description des situations est du ressort du moteur

## Contexte et problème

Le registre décrit chaque règle avec CPSV-AP pour le service, CCCEV pour les pièces, ELI pour la loi. Il a besoin de trois informations absentes de ces vocabulaires : ce dont l'organisme producteur répond, l'origine de la valeur de chaque entrée, la validation de chaque cas de test. Elles forment une surcouche sous le préfixe `rdgf:`. Jusqu'où cette surcouche peut-elle décrire une règle ?

## Facteurs de décision

* Décrire une situation, une famille dont les revenus ont changé en cours d'année, exige des entités et des périodes, c'est-à-dire le modèle de calcul d'un moteur.
* Un format commun de situations imposerait ce modèle à tous les moteurs et rendrait le registre responsable de le maintenir à chaque réforme ; les auteurs de langages de règles nomment ce risque la pollution computationnelle des ontologies partagées.
* Le registre accueille des moteurs différents, Catala, Publicodes, OpenFisca, Python.

## Options considérées

* La surcouche décrit l'engagement, la provenance et la validation.
* La surcouche décrit aussi les situations, pour rendre les cas de tests transposables entre moteurs.

## Décision

Option retenue : la surcouche décrit l'engagement, la provenance et la validation, parce que c'est la seule qui maintient la neutralité du registre entre moteurs.

`rdgf:` décrit : ce dont l'organisme répond, à quelle version, depuis quand ; l'origine de la valeur de chaque entrée ; l'enveloppe d'un cas de test, le test natif faisant foi ; les correspondances opérationnelles en production ; l'historique des versions relié aux textes déclencheurs. La description des situations reste dans `rdgf:engineProfile`, un littéral JSON que le registre transmet tel quel, et dans les tests natifs référencés. L'alignement avec CPRMV se limite aux termes descriptifs.

### Conséquences

* Bon, parce que chaque terme `rdgf:` répond à une question simple : qui, quand, sur quoi, d'où.
* Bon, parce qu'un moteur publie son modèle de situations dans son propre namespace, `openfisca:`, `publicodes:`, et que le profil reste identique.
* Mauvais, parce que le registre exclut de ses promesses la transposition de cas de tests entre moteurs, la comparaison inter-moteurs et la composition de règles entre moteurs.
