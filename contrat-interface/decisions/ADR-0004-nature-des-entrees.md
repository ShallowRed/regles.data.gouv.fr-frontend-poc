---
status: accepted
date: 2026-09-12
decision-makers: équipe du registre
consulted: dépôt data
scope: registre
---
# Chaque entrée indique la nature de son fait, `rdgf:factKind`, et l'organisme qui l'atteste en `dct:publisher`

## Contexte et problème

Un engagement « résultats certifiés » couvre les résultats calculés sur les faits déclarés. La fiche indique, entrée par entrée, qui répond de la valeur : la personne, une administration, une autre règle, ou un paramètre de contexte. Comment nommer cette information et désigner l'organisme qui atteste ?

## Facteurs de décision

* CCCEV 2.2.0 distingue sur une pièce l'agent légalement responsable, `dct:publisher`, celui qui la transmet, `m8g:isProvidedBy`, et celui qui la produit, `dct:creator` ; la différence entre déclaration et source faisant autorité y figure dans une note de portée.
* Le producteur qui remplit une fiche doit comprendre le nom du champ.

## Options considérées

* `rdgf:factKind`, qui pose la question : de quel genre de fait s'agit-il.
* `rdgf:evidenceKind`, calqué sur `cv:Evidence`.

## Décision

Option retenue : `rdgf:factKind` avec `dct:publisher`, parce que le nom est compréhensible par le producteur et que l'organisme attestant reprend le terme de CCCEV.

Chaque entrée, typée `cv:Evidence`, contient `rdgf:factKind` : `declared`, déclaré par la personne ; `attested`, attesté par une administration et mobilisable par une API ; `derived`, sortie d'une autre règle ou paramètre partagé ; `context`, choisit la règle appliquée. Pour un fait attesté, l'organisme qui en répond s'écrit `dct:publisher`, l'accès en `foaf:page`.

```jsonc
{
  "id": "…/v1#input-rfr",
  "type": "cv:Evidence",
  "title": "Revenu fiscal de référence",
  "sh:datatype": "xsd:decimal",
  "rdgf:factKind": "attested",
  "dct:publisher": { "id": "https://identifier…/dgfip" },
  "foaf:page": { "id": "https://particulier.api.gouv.fr/…" }
}
```

### Conséquences

* Bon, parce que l'interface affiche « faits déclarés », « données attestées », « sorties d'autres règles », « paramètres de contexte », et l'organisme attestant.
* Bon, parce que le renommage en `rdgf:evidenceKind` reste possible à structure identique, et qu'une équivalence se déclarera si SEMIC introduit un drapeau de ce type.
* Mauvais, parce que le terme reste propre au registre.

### Confirmation

Le contrôle de contrat exige `rdgf:factKind` sur chaque entrée d'une règle `certified`.
