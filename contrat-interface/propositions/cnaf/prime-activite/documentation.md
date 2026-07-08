# Prime d'activité - telle que calculée par openfisca-france

> Documentation générée depuis `metadata.jsonld` par `scripts/generate-fiche-doc.mjs` - ne pas éditer à la main.
> Fiche source : `contrat-interface/propositions/cnaf/prime-activite/metadata.jsonld`

Prestation du cœur socio-fiscal : sa chaîne de dépendances (SMIC, bases ressources, définitions de revenus) n'a pas de porteur unique. Elle est cataloguée en régime implémentation : le couple suite de tests + snapshot openfisca-france fait foi, pas la règle dans l'abstrait.

- **Identifiant** : `solidarite.prime-activite.openfisca-france`
- **Autorité compétente** : Caisse nationale des allocations familiales
- **Maturité** : N2 (échelle N0 référencée → N3 exécutable)

## Régime de certification

**Régime implémentation.** Règle du cœur socio-fiscal : sa chaîne de dépendances (SMIC, bases ressources, définitions de revenus) n'a pas de porteur administratif unique. L'unité cataloguée est la règle telle que calculée par une implémentation donnée ; l'unité certifiable est le couple suite de tests + snapshot d'implémentation.

Snapshot d'implémentation : [https://github.com/openfisca/openfisca-france](https://github.com/openfisca/openfisca-france) - référence : suivi continu (préciser un tag/SHA au moment de la certification).

## Base légale

- [Code de la sécurité sociale](https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006073189/) - Art. L. 841-1 et suivants (prime d'activité)

## Paramètres d'entrée

| Paramètre | Type | Obligatoire | Nature de frontière | Définition |
|-----------|------|-------------|---------------------|------------|
| **Salaires des 3 derniers mois**<br>`salaire_de_base` | nombre décimal | obligatoire | déclaration (fait déclaré par l'usager, non vérifié) | Revenus d'activité déclarés par l'usager sur le trimestre de référence. |
| **Revenu fiscal de référence**<br>`rfr` | nombre décimal | optionnel | donnée attestée (propriétaire institutionnel identifié) | Revenu fiscal de référence du foyer.<br>Attestée par : [DGFiP, mobilisable via API Particulier](https://particulier.api.gouv.fr) |
| **Montant forfaitaire et SMIC**<br>`montant_forfaitaire` | nombre décimal | optionnel | sortie d'une autre règle ou paramètre législatif partagé | Paramètres législatifs partagés du cœur socio-fiscal, maintenus dans openfisca-france ; aucun porteur administratif unique. |

## Sorties

- **Montant mensuel de la prime d'activité** (`ppa`) : Variable openfisca-france `ppa`, calculée par entité famille sur des périodes mensuelles avec bases ressources trimestrielles.

## Canaux d'accès

- **Moteur de microsimulation (Python, exécution serveur)** : Calcul via openfisca-france (paquet Python) ; exposition API possible via openfisca-core web-api. ([lien](https://github.com/openfisca/openfisca-france))

## Cas de tests

Les tests natifs font foi ; le catalogue publie leur enveloppe (intention, provenance, validation), jamais un format de situation commun.

- **Intention** : Suite de tests native openfisca-france : variables périodisées et entités composées, non transposables dans un format plat sans perte de sens.
  - provenance : communauté · validé par : Intégration continue openfisca-france · statut : valide · format natif : `openfisca-yaml`
  - [Tests natifs (référence qui fait foi)](https://github.com/openfisca/openfisca-france/tree/master/tests)

## Mappings opérationnels recensés

Le catalogue recense des correspondances qui tournent (exercées par une CI), il n'en rédige aucune.

- **Situation déclarative → entités et périodes OpenFisca** : formulaire déclaratif aides-simplifiées (description plate) → entités individu / famille / foyer fiscal / ménage, variables périodisées
  - [artefact](https://github.com/betagouv/aides-simplifiees-app/blob/main/inertia/services/openfisca/dispatchers.ts) · maintenu par : aides-simplifiées (service en cours de fermeture) · statut CI : unknown
