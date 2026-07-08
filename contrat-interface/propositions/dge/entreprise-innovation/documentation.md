# Aides fiscales à l'innovation - CIR, CII, CICo, JEI, JEU, JEC

> Documentation générée depuis `metadata.jsonld` par `scripts/generate-fiche-doc.mjs` - ne pas éditer à la main.
> Fiche source : `contrat-interface/propositions/dge/entreprise-innovation/metadata.jsonld`

Éligibilité et montant des six dispositifs fiscaux de soutien à l'innovation des entreprises. Modélisation Publicodes coconstruite avec un expert métier de la DGFiP, exposée en iframe sur entreprendre.service-public.fr (DILA).

- **Identifiant** : `fiscalite.entreprise-innovation.v1`
- **Autorité compétente** : Direction générale des Entreprises
- **Maturité** : N3 (échelle N0 référencée → N3 exécutable)

## Régime de certification

**Régime frontière.** L'administration certifie le comportement entrées → sorties sur des faits déclarés, à une version donnée. C'est la sémantique du rescrit : l'engagement porte sur les faits déclarés, pas sur leur provenance amont. Les cas de tests publiés sont l'artefact de cette certification.

## Base légale

- [Code général des impôts](https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006069577/) - Art. 244 quater B (CIR, CII, CICo), art. 44 sexies-0 A (JEI, JEU, JEC)

## Paramètres d'entrée

| Paramètre | Type | Obligatoire | Nature de frontière | Définition |
|-----------|------|-------------|---------------------|------------|
| **Nature de l'activité**<br>`natureActivite` | chaîne de caractères | obligatoire | déclaration (fait déclaré par l'usager, non vérifié) | Activité commerciale, industrielle, agricole ou artisanale (conditionne l'éligibilité au CIR, art. 244 quater B). |
| **Régime fiscal**<br>`regimeFiscal` | chaîne de caractères | obligatoire | déclaration (fait déclaré par l'usager, non vérifié) | Imposition au régime réel ou condition d'exonération (art. 244 quater B). |
| **Dépenses de recherche (métropole et DOM)**<br>`depensesRecherche` | nombre décimal | obligatoire | déclaration (fait déclaré par l'usager, non vérifié) | Assiette du crédit d'impôt : 30 % jusqu'à 100 M€ puis 5 % en métropole, 50 % dans les DOM. |

## Sorties

- **Éligibilité et montants par dispositif** (`value`) : Pour chacun des six dispositifs : statut d'éligibilité et, le cas échéant, montant du crédit d'impôt.
- **Explications d'inéligibilité** (`explications`) - *sortie d'explicabilité, utile pour expliquer un refus* : Règles publicodes « . explications » : texte expliquant pourquoi un dispositif n'est pas ouvert - utile pour expliquer un refus.

## Canaux d'accès

- **Bibliothèque de règles Publicodes (dépôt git)** : Règles YAML Publicodes exécutables côté client (navigateur) ou serveur via le paquet publicodes. ([lien](https://github.com/betagouv/publicodes-entreprise-innovation))

## Mappings opérationnels recensés

Le catalogue recense des correspondances qui tournent (exercées par une CI), il n'en rédige aucune.

- **Formulaire déclaratif → variables Publicodes** : survey-schema aides-simplifiées (entreprise-innovation.json) → règles publicodes-entreprise-innovation
  - [artefact](https://github.com/betagouv/aides-simplifiees-app/blob/main/public/forms/entreprise-innovation.json) · maintenu par : aides-simplifiées (service en cours de fermeture) · statut CI : unknown

## Historique de versions

- **main (2025-09-17)** (2025-09-17) - majeur : Publication du dépôt betagouv : un fichier Publicodes par dispositif, coconstruits avec un expert métier DGFiP. ([texte déclencheur](https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006069577/))

## Code source

- **Dépôt** : [publicodes-entreprise-innovation](https://github.com/betagouv/publicodes-entreprise-innovation/tree/fc8e9a8ac572b03d75504a2aba39d5633c0b25ea) (épinglé à une révision précise)
- **Langage(s)** : Publicodes
- Modélisation Publicodes des six dispositifs fiscaux de soutien à l'innovation (CIR, CII, CICo, JEI, JEU, JEC), un fichier par dispositif dans src/dispositifs/.
