# Rapport de conformité des fiches metadata.jsonld

> Généré par `scripts/sync-data-repo.mjs` - ne pas éditer à la main.
> Source : `29774e5ac` (2026-07-07T17:31:05+02:00). Contrôles structurels JS ;
> la validation SHACL CPSV-AP 3.2.0 (cf. vocabulaire-commun, tutoriel 04) reste à brancher en CI du dépôt data.

## Prest'Agri - moteur de calcul

Fiche : `site/Ministère Agriculture/prestagri/metadata.jsonld`

Points à trancher ensemble (profil) :

- service prestagri-quotient-familial : base légale absente (`cv:hasLegalResource`)
- service prestagri-quotient-familial : `dct:version` absent
- service prestagri-aide-scolarite : base légale absente (`cv:hasLegalResource`)
- service prestagri-aide-scolarite : `dct:version` absent
- autorité compétente référencée mais nœud `cv:PublicOrganisation` absent du graphe
- URI de service hors convention regles.* : https://github.com/betagouv/prestagri#service, https://github.com/betagouv/prestagri#service-quotient-familial, https://github.com/betagouv/prestagri#service-aide-scolarite
- chemin non normalisé (espaces/accents) : `site/Ministère Agriculture/prestagri/metadata.jsonld`

## Droit de vote en France

Fiche : `site/Ministère Intérieur/droits-civiques-elections/metadata.jsonld`

Points à trancher ensemble (profil) :

- chemin non normalisé (espaces/accents) : `site/Ministère Intérieur/droits-civiques-elections/metadata.jsonld`

