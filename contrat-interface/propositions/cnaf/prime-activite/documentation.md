# Prime d'activité - telle que calculée par openfisca-france

> Documentation générée depuis `metadata.jsonld` par `scripts/generate-fiche-doc.mjs` - ne pas éditer à la main.
> Fiche source : `contrat-interface/propositions/cnaf/prime-activite/metadata.jsonld`

Prestation du cœur socio-fiscal : sa chaîne de dépendances (SMIC, bases ressources, définitions de revenus) n'a pas de porteur unique. La fiche décrit la prime d'activité telle que la calcule openfisca-france à la version indiquée ; le couple suite de tests native et code à cette version constitue la référence.

- **Identifiant** : `solidarite.prime-activite.openfisca-france`
- **Version** : 169.15.0
- **Autorité compétente** : Caisse nationale des allocations familiales

## Garantie du producteur

**Code et tests publiés.** L'organisme publie le code et les tests à un commit désigné. Le profil exige un dépôt désigné à un commit et une suite de tests native référencée.

Engagement de communauté openfisca-france, version 169.15.0.

Code et suite de tests native publiés à la version indiquée ; aucun engagement de la CNAF sur les résultats.

## Base légale

- [Code de la sécurité sociale](https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006073189/) - Art. L. 841-1 et suivants (prime d'activité)

## Paramètres d'entrée

| Paramètre | Type | Obligatoire | Nature du fait | Définition |
|-----------|------|-------------|----------------|------------|
| **Salaires des 3 derniers mois**<br>`salaire_de_base` | nombre décimal | obligatoire | fait déclaré par la personne, non vérifié | Revenus d'activité déclarés par l'usager sur le trimestre de référence. |
| **Revenu fiscal de référence**<br>`rfr` | nombre décimal | optionnel | donnée attestée par une administration qui en répond | Revenu fiscal de référence du foyer.<br>Attestée par [Direction générale des Finances publiques](https://particulier.api.gouv.fr) |
| **Montant forfaitaire et SMIC**<br>`montant_forfaitaire` | nombre décimal | optionnel | sortie d'une autre règle ou paramètre partagé | Paramètres législatifs partagés du cœur socio-fiscal, maintenus dans openfisca-france ; aucun porteur administratif unique. |

## Sorties

- **Montant mensuel de la prime d'activité** (`ppa`) : Variable openfisca-france `ppa`, calculée par entité famille sur des périodes mensuelles avec bases ressources trimestrielles.

## Canaux d'accès

- **Moteur de microsimulation (Python, exécution serveur)** : Calcul via openfisca-france (paquet Python) ; exposition API possible via openfisca-core web-api.

## Cas de tests

Le test natif constitue la référence ; la fiche publie son enveloppe (ce qu'il vérifie, origine, validation). Les résultats d'exécution du registre sont publiés à part, en assertions EARL.

- **Suite de tests native openfisca-france**
  - Variables périodisées et entités composées, dans le format YAML du moteur, non transposables dans un format plat sans perte de sens.
  - origine : communauté · validé par : communauté openfisca-france · statut : valid · format natif : `openfisca-yaml`
  - [Test natif de référence](https://github.com/openfisca/openfisca-france/tree/169.15.0/tests)

## Correspondances opérationnelles recensées

Le registre recense des correspondances en production, exercées par une intégration continue ; il n'en rédige aucune.

- **Situation déclarative → entités et périodes OpenFisca** : formulaire déclaratif aides-simplifiées (description plate) → entités individu / famille / foyer fiscal / ménage, variables périodisées
  - [artefact](https://github.com/betagouv/aides-simplifiees-app/blob/main/inertia/services/openfisca/dispatchers.ts) · maintenu par : aides-simplifiées (service en cours de fermeture) · statut CI : unknown

## Code source

- **Dépôt** : [openfisca-france](https://github.com/openfisca/openfisca-france/tree/169.15.0) (épinglé à une révision précise)
- **Langage(s)** : Python
- Modèle socio-fiscal français pour OpenFisca ; la prime d'activité est la variable `ppa`.
