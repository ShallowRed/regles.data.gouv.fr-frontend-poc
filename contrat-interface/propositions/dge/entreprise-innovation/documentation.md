# Aides fiscales à l'innovation - CIR, CII, CICo, JEI, JEU, JEC

> Documentation générée depuis `metadata.jsonld` par `scripts/generate-fiche-doc.mjs` - ne pas éditer à la main.
> Fiche source : `contrat-interface/propositions/dge/entreprise-innovation/metadata.jsonld`

Éligibilité et montant des six dispositifs fiscaux de soutien à l'innovation des entreprises. Modélisation Publicodes coconstruite avec un expert métier de la DGFiP, exposée en iframe sur entreprendre.service-public.fr (DILA).

- **Identifiant** : `fiscalite.entreprise-innovation.v1`
- **Version** : 1.0.0
- **Autorité compétente** : Direction générale des Entreprises

## Garantie du producteur

**Résultats certifiés.** L'organisme répond des résultats calculés sur les faits déclarés, à la version indiquée. Le profil exige la nature de chaque entrée et des cas de tests avec enveloppe.

Engagement de Direction générale des Entreprises, version 1.0.0.

Résultats certifiés sur les faits déclarés, à la version indiquée : règles coconstruites avec un expert métier de la DGFiP.

## Base légale

- [Code général des impôts](https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006069577/) - Art. 244 quater B (CIR, CII, CICo), art. 44 sexies-0 A (JEI, JEU, JEC)

## Paramètres d'entrée

| Paramètre | Type | Obligatoire | Nature du fait | Définition |
|-----------|------|-------------|----------------|------------|
| **Nature de l'activité**<br>`natureActivite` | chaîne de caractères | obligatoire | fait déclaré par la personne, non vérifié | Activité commerciale, industrielle, agricole ou artisanale (conditionne l'éligibilité au CIR, art. 244 quater B). |
| **Régime fiscal**<br>`regimeFiscal` | chaîne de caractères | obligatoire | fait déclaré par la personne, non vérifié | Imposition au régime réel ou condition d'exonération (art. 244 quater B). |
| **Dépenses de recherche (métropole et DOM)**<br>`depensesRecherche` | nombre décimal | obligatoire | fait déclaré par la personne, non vérifié | Assiette du crédit d'impôt : 30 % jusqu'à 100 M€ puis 5 % en métropole, 50 % dans les DOM. |

## Sorties

- **Éligibilité et montants par dispositif** (`value`) : Pour chacun des six dispositifs : statut d'éligibilité et, le cas échéant, montant du crédit d'impôt.
- **Explications d'inéligibilité** (`explications`) - *sortie d'explicabilité, utile pour expliquer un refus* : Règles publicodes « . explications » : texte expliquant pourquoi un dispositif n'est pas ouvert - utile pour expliquer un refus.

## Canaux d'accès

- **Bibliothèque de règles Publicodes (dépôt git)** : Règles YAML Publicodes exécutables côté client (navigateur) ou serveur via le paquet publicodes.

## Cas de tests

Le test natif constitue la référence ; la fiche publie son enveloppe (ce qu'il vérifie, origine, validation). Les résultats d'exécution du registre sont publiés à part, en assertions EARL.

- **Industrielle au réel, 100 000 € de dépenses**
  - Entreprise industrielle au régime réel : 100 000 € de dépenses de recherche en métropole ouvrent un crédit de 30 % (première tranche du barème).
  - origine : communauté · le 2026-07-09 · statut : valid · texte visé : https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006069577/ · tolérance : 0.01 · format natif : `publicodes-yaml`
  - [Test natif de référence](https://github.com/betagouv/publicodes-entreprise-innovation/blob/fc8e9a8ac572b03d75504a2aba39d5633c0b25ea/src/dispositifs/cir.publicodes)
- **Artisanale en BNC : non éligible**
  - Une activité artisanale imposée en BNC est hors du champ du CIR ; la sortie « explications » motive le refus.
  - origine : communauté · le 2026-07-09 · statut : valid · texte visé : https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006069577/ · format natif : `publicodes-yaml`
  - [Test natif de référence](https://github.com/betagouv/publicodes-entreprise-innovation/blob/fc8e9a8ac572b03d75504a2aba39d5633c0b25ea/src/dispositifs/cir.publicodes)

## Correspondances opérationnelles recensées

Le registre recense des correspondances en production, exercées par une intégration continue ; il n'en rédige aucune.

- **Formulaire déclaratif → variables Publicodes** : survey-schema aides-simplifiées (entreprise-innovation.json) → règles publicodes-entreprise-innovation
  - [artefact](https://github.com/betagouv/aides-simplifiees-app/blob/main/public/forms/entreprise-innovation.json) · maintenu par : aides-simplifiées (service en cours de fermeture) · statut CI : unknown

## Historique de versions

- **1.0.0** (2025-09-17) - majeur : Publication du dépôt betagouv : un fichier Publicodes par dispositif, coconstruits avec un expert métier DGFiP. ([texte déclencheur](https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006069577/))

## Code source

- **Dépôt** : [publicodes-entreprise-innovation](https://github.com/betagouv/publicodes-entreprise-innovation/tree/fc8e9a8ac572b03d75504a2aba39d5633c0b25ea) (épinglé à une révision précise)
- **Langage(s)** : Publicodes
- Modélisation Publicodes des six dispositifs fiscaux de soutien à l'innovation (CIR, CII, CICo, JEI, JEU, JEC), un fichier par dispositif dans src/dispositifs/.
