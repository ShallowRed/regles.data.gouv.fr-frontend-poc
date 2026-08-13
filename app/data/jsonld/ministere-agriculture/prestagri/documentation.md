# Prest'Agri - moteur de calcul

> Documentation générée depuis `metadata.jsonld` par `scripts/generate-fiche-doc.mjs` - ne pas éditer à la main.
> Fiche source : `app/data/jsonld/ministere-agriculture/prestagri/metadata.jsonld`

Calcule le quotient familial d'un agent selon la note de service MASA (revenu fiscal de référence rapporté au nombre d'unités du foyer, avec majorations parent isolé / handicap / garde alternée / abattement outre-mer). Calcule le montant de l'aide à la scolarité (fiche F16) à partir du quotient familial du foyer, du barème de points (dont l'éloignement domicile-établissement) et du plafond de 1000€ par enfant et par an.

- **Version** : 0.1.0

## Calcul du quotient familial (QF)

Calcule le quotient familial d'un agent selon la note de service MASA (revenu fiscal de référence rapporté au nombre d'unités du foyer, avec majorations parent isolé / handicap / garde alternée / abattement outre-mer).

### Paramètres d'entrée

| Paramètre | Type | Obligatoire | Définition |
|-----------|------|-------------|------------|
| **Ménage · Handicap au foyer**<br>`beneficiaire_porteur_handicap` | booléen (oui/non) | optionnel (défaut : `false`) | Un membre du foyer (agent, enfant ou personne à charge) est porteur de handicap. |
| **Ménage · Garde alternée**<br>`garde_alternee` | booléen (oui/non) | optionnel (défaut : `false`) | L'agent a un ou des enfants en garde alternée. |
| **Ménage · Parent isolé**<br>`parent_isole` | booléen (oui/non) | optionnel (défaut : `false`) | L'agent est parent isolé au sens fiscal (case T). |
| **Ménage · Outre-mer**<br>`outre_mer` | booléen (oui/non) | optionnel (défaut : `false`) | L'agent est affecté en outre-mer (abattement de 20% sur le revenu fiscal de référence). |
| **Ménage › Foyer fiscal · Revenu fiscal de référence**<br>`revenu_fiscal_reference` | nombre décimal | obligatoire | Revenu fiscal de référence annuel du foyer, en euros. |
| **Ménage › Foyer fiscal · Nombre de personnes**<br>`nombre_personnes` | nombre entier | obligatoire | Nombre de personnes rattachées à ce foyer fiscal. |

### Sorties

- **Quotient familial** (`value`) : Quotient familial calculé, exprimé en euros (ex. "812.5€").
- **Explication du calcul** (`explanation`) - *sortie d'explicabilité, utile pour expliquer un refus* : Trace explicative Catala détaillant les étapes et exceptions appliquées au calcul.

## Calcul de l'aide à la scolarité

Calcule le montant de l'aide à la scolarité (fiche F16) à partir du quotient familial du foyer, du barème de points (dont l'éloignement domicile-établissement) et du plafond de 1000€ par enfant et par an.

### Paramètres d'entrée

| Paramètre | Type | Obligatoire | Définition |
|-----------|------|-------------|------------|
| **Quotient familial**<br>`quotient-familial` | nombre entier | obligatoire | Quotient familial du foyer, issu du service de calcul du quotient familial. |
| **Montant du matériel spécifique**<br>`montant_matériel_spécifique` | nombre décimal | obligatoire | Montant du matériel spécifique, en euros. |
| **Étudiant en filière post-bac**<br>`étudiant_en_filière_post_bac` | booléen (oui/non) | optionnel | L'étudiant est inscrit dans une filière post-bac. |
| **Trajet depuis domicile agent · Distance**<br>`trajet_depuis_domicile_agent.distance_km` | nombre entier | obligatoire | Distance (en km) |
| **Trajet depuis domicile agent · Durée**<br>`trajet_depuis_domicile_agent.durée_minutes` | nombre entier | obligatoire | Durée (en minutes) |
| **Trajet depuis domicile étudiant · Distance**<br>`trajet_depuis_domicile_étudiant.distance_km` | nombre entier | obligatoire | Distance (en km) |
| **Trajet depuis domicile étudiant · Durée**<br>`trajet_depuis_domicile_étudiant.durée_minutes` | nombre entier | obligatoire | Durée (en minutes) |

### Sorties

- **Montant de l'aide** (`value`) : Montant de l'aide à la scolarité calculé, plafonné à 1000€ par enfant et par an, exprimé en euros.
- **Explication du calcul** (`explanation`) - *sortie d'explicabilité, utile pour expliquer un refus* : Trace explicative structurée (quotient_familial, criteres_eligibles, aide_scolarite) détaillant chaque étape du calcul.

## Canaux d'accès

- **En ligne (API)** : Point d'accès HTTP GET, réponses JSON. ([lien](https://api.prest-agri.beta.gouv.fr/quotient_familial))
- **En ligne (API)** : Point d'accès HTTP GET, réponses JSON. ([lien](https://api.prest-agri.beta.gouv.fr/aide_scolarite))

## Code source

- **Dépôt** : [Prest'Agri - moteur de calcul](https://github.com/betagouv/prestagri/tree/478b3cc2ab28299c73b94fdd192b0559ae5873b8) (épinglé à une révision précise)
- **Langage(s)** : Python, Catala
- Backend FastAPI (Python) exposant des règles de droit codées en Catala (calcul du quotient familial et de l'aide à la scolarité), compilées en bibliothèque Python.
