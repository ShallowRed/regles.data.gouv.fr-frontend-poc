# Droit de vote en France

> Documentation générée depuis `metadata.jsonld` par `scripts/generate-fiche-doc.mjs` - ne pas éditer à la main.
> Fiche source : `app/data/jsonld/ministere-interieur/droits-civiques-elections/metadata.jsonld`

Vérification algorithmique de l'éligibilité au droit de vote en France (élections nationales et municipales), codifiée en Python à partir du Code électoral et de la Constitution.

- **Identifiant** : `civique.droit-vote.v1`
- **Version** : 1.0.0
- **Autorité compétente** : Ministère de l'Intérieur
- **Période de validité indicative** : `2024-01-01/` (ne couvre pas le droit transitoire : savoir quelle version s'applique est une règle, pas une métadonnée)

## Base légale

- [Code électoral](https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006070239/) - Art. L.2 à L.7, L.O. 227-1
- [Constitution du 4 octobre 1958](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006527438/) - Art. 88-3

## Paramètres d'entrée

| Paramètre | Type | Obligatoire | Définition |
|-----------|------|-------------|------------|
| **Nationalité française**<br>`nationalite_francaise` | booléen (oui/non) | obligatoire | La personne a la nationalité française (Art. L.2). Pour les élections municipales, une nationalité UE combinée à citoyennete_ue+domicile_france peut aussi ouvrir droit (Art. 88-3 C°). |
| **Âge**<br>`age` | nombre entier | obligatoire | Âge de la personne en années révolues (Art. L.3 : doit être ≥ 18). Une valeur négative lève une erreur. |
| **Capacité civique**<br>`capacite_civique` | booléen (oui/non) | obligatoire | La personne n'est pas privée de ses droits civiques (Art. L.5, L.6). |
| **Inscription sur les listes électorales**<br>`inscrit_listes_electorales` | booléen (oui/non) | obligatoire | La personne est inscrite sur les listes électorales (Art. L.7). |
| **Citoyenneté UE**<br>`citoyennete_ue` | booléen (oui/non) | optionnel (défaut : `false`) | La personne est citoyenne d'un État membre de l'UE. N'est prise en compte que pour les élections municipales (context.type_election = "municipale"), combinée à domicile_france. |
| **Domicile en France**<br>`domicile_france` | booléen (oui/non) | optionnel (défaut : `false`) | La personne est domiciliée en France. Combinée à citoyennete_ue pour l'éligibilité aux élections municipales (Art. 88-3 C° / L.O. 227-1). |
| **Type d'élection**<br>`type_election` | chaîne de caractères | optionnel (défaut : `nationale`) | Contexte d'exécution (paramètre 'context', pas 'data') : "nationale" (défaut) ou "municipale". Change la règle de nationalité appliquée. |

## Sorties

- **Éligibilité au droit de vote** (`value`) : Booléen : la personne a le droit de voter dans le contexte électoral demandé.
- **Détail des conditions évaluées** (`metadata.conditions`) - *sortie d'explicabilité, utile pour expliquer un refus* : Trace structurée de chaque condition individuelle évaluée (éligible_nationalite, age_suffisant, capacite_civique, inscrit_listes_electorales, citoyennete_ue_avec_domicile_france) — utile pour expliquer un refus.

## Canaux d'accès

- **Bibliothèque logicielle (package Python)** : Installation via pip. ATTENTION : le pyproject.toml référence test.pypi.org comme source — le package semble n'être publié qu'en environnement de test, pas sur PyPI officiel. ([lien](https://github.com/qloridant/regalgo-civique-droit-vote))

## Code source

- **Dépôt** : [regalgo-civique-droit-vote](https://github.com/qloridant/regalgo-civique-droit-vote/tree/13d9f80ca21d47f55aef9710e6288e94ea10ccc6) (épinglé à une révision précise)
- **Langage(s)** : Python
- Package Python implémentant l'éligibilité au droit de vote en France, avec deux modes d'appel : AlgoInput (données brutes) ou PersonInput (aligné sur Core Person Vocabulary / CCCEV — cv_nationality, schema_birth_date, cccev_civil_rights_intact, cccev_electoral_list_registered, cv_domicile_country). Fait partie de l'écosystème 'regalgo' d'algorithmes réglementaires.
