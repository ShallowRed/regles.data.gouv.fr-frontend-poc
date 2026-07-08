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
| **Revenu de l'agent**<br>`agent_revenu` | nombre entier | obligatoire | Revenu fiscal de référence annuel de l'agent, en euros. |
| **Enfants de l'agent**<br>`agent_enfants` | nombre entier | obligatoire | Nombre d'enfants à charge de l'agent. |
| **Revenu du conjoint**<br>`conjoint_revenu` | nombre entier | optionnel | Revenu fiscal de référence annuel du conjoint, en euros (si vie à deux). |
| **Enfants du conjoint**<br>`conjoint_enfants` | nombre entier | optionnel | Nombre d'enfants à charge du conjoint. |
| **Handicap au foyer**<br>`personne_ou_enfant_porteur_handicap` | booléen (oui/non) | optionnel (défaut : `false`) | Un membre du foyer (agent, enfant ou personne à charge) est porteur de handicap. |
| **Garde alternée**<br>`garde_alternee` | booléen (oui/non) | optionnel (défaut : `false`) | L'agent a un ou des enfants en garde alternée. |
| **Parent isolé**<br>`parent_isole` | booléen (oui/non) | optionnel (défaut : `false`) | L'agent est parent isolé au sens fiscal (case T). |
| **Outre-mer**<br>`outre_mer` | booléen (oui/non) | optionnel (défaut : `false`) | L'agent est affecté en outre-mer (abattement de 20% sur le revenu fiscal de référence). |

### Sorties

- **Quotient familial** (`value`) : Quotient familial calculé, exprimé en euros (ex. "812.5€").
- **Explication du calcul** (`explanation`) - *sortie d'explicabilité, utile pour expliquer un refus* : Trace explicative Catala détaillant les étapes et exceptions appliquées au calcul.

## Calcul de l'aide à la scolarité

Calcule le montant de l'aide à la scolarité (fiche F16) à partir du quotient familial du foyer, du barème de points (dont l'éloignement domicile-établissement) et du plafond de 1000€ par enfant et par an.

### Paramètres d'entrée

| Paramètre | Type | Obligatoire | Définition |
|-----------|------|-------------|------------|
| **Revenu de l'agent**<br>`agent_revenu` | nombre entier | obligatoire | Revenu fiscal de référence annuel de l'agent, en euros. |
| **Enfants de l'agent**<br>`agent_enfants` | nombre entier | obligatoire | Nombre d'enfants à charge de l'agent. |
| **Adresse de l'agent**<br>`adresse_agent` | chaîne de caractères | obligatoire | Adresse du domicile de l'agent (utilisée pour calculer la distance vers l'établissement). |
| **Adresse de l'établissement**<br>`adresse_etablissement` | chaîne de caractères | obligatoire | Adresse de l'établissement scolaire ou universitaire fréquenté par l'enfant. |
| **Revenu du conjoint**<br>`conjoint_revenu` | nombre entier | optionnel | Revenu fiscal de référence annuel du conjoint, en euros. |
| **Enfants du conjoint**<br>`conjoint_enfants` | nombre entier | optionnel | Nombre d'enfants à charge du conjoint. |
| **Revenu de l'étudiant**<br>`etudiant_revenu` | nombre entier | optionnel | Revenu fiscal de référence de l'étudiant, si celui-ci fait sa propre déclaration fiscale. |
| **Enfants de l'étudiant**<br>`etudiant_enfants` | nombre entier | optionnel | Nombre d'enfants à charge de l'étudiant fiscalement indépendant. |
| **Handicap au foyer**<br>`personne_ou_enfant_porteur_handicap` | booléen (oui/non) | optionnel (défaut : `false`) | Un membre du foyer est porteur de handicap. |
| **Garde alternée**<br>`garde_alternee` | booléen (oui/non) | optionnel (défaut : `false`) | L'agent a un ou des enfants en garde alternée. |
| **Parent isolé**<br>`parent_isole` | booléen (oui/non) | optionnel (défaut : `false`) | L'agent est parent isolé au sens fiscal. |
| **Outre-mer**<br>`outre_mer` | booléen (oui/non) | optionnel (défaut : `false`) | L'agent est affecté en outre-mer. |
| **Adresse de l'étudiant**<br>`adresse_etudiant` | chaîne de caractères | optionnel | Adresse de résidence de l'étudiant, si différente de celle de l'agent (ex. logement étudiant). |
| **Matériel spécifique**<br>`montant_materiel_specifique` | nombre entier | optionnel | Montant des frais d'équipement scolaire obligatoire engagés, en euros. |
| **Post-bac**<br>`etudiant_post_bac` | booléen (oui/non) | optionnel (défaut : `false`) | L'enfant/étudiant est inscrit dans une filière post-bac (impacte le barème de points). |

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
