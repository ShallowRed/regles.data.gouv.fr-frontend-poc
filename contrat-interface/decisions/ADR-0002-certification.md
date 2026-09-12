---
status: accepted
date: 2026-09-12
decision-makers: équipe du registre
informed: ICTU
scope: registre
---
# L'engagement du producteur est un nœud `rdgf:certification` à deux niveaux

## Contexte et problème

Un badge « résultats certifiés » est utile s'il dit qui s'engage, depuis quand, sur quelle version et sur quel périmètre, et si l'on distingue ce que l'organisme déclare de ce que le registre constate en exécutant les tests. Comment nommer et structurer cet engagement ?

## Facteurs de décision

* L'ontologie de gouvernance du registre néerlandais modélise l'engagement avec `certifiedBy`, `certifiedAt` et `certificationStatus` valant `certified` ou `self-assessed`.
* Le droit européen emploie « niveau de garantie » pour l'identification électronique, sans table d'autorité pour ses niveaux.
* L'interface affiche déjà « résultats certifiés ».

## Options considérées

* `rdgf:certification`, les mots d'ICTU et des badges.
* `rdgf:assurance`, le mot du droit européen, à structure identique.

## Décision

Option retenue : `rdgf:certification`, parce que le mot est celui du pair avec lequel le registre discute et celui que l'interface affiche.

```jsonc
"rdgf:certification": {
  "type": "rdgf:Certification",
  "rdgf:certificationLevel": "certified",
  "prov:wasAttributedTo": { "id": "…#organisation" },
  "dct:issued": "2026-08-13",
  "dct:conformsTo": { "id": "…/v1", "dct:version": "1.2.0" },
  "description": "Résultats certifiés sur les faits déclarés, à la version indiquée."
}
```

| Niveau | Ce que l'organisme dit | Ce que le profil exige |
|---|---|---|
| `certified` | « je réponds des résultats sur les faits déclarés, à cette version » | la nature de chaque entrée, des cas de tests avec enveloppe |
| `self-assessed` | « je publie le code et les tests, à ce commit » | un dépôt désigné à un commit, une suite de tests native référencée |

L'absence du nœud signifie que la règle est référencée. Le badge « résultats testés » est établi par le registre (ADR-0006). L'interface affiche le nœud sous « Garantie du producteur ».

### Conséquences

* Bon, parce que l'organisme, la date, la version et le périmètre sont dans la fiche.
* Bon, parce que le nom peut passer à `rdgf:assurance` à structure identique, et qu'un niveau s'ajoute par une valeur.
* Mauvais, parce que le mot « certification » évoque parfois une certification par un tiers ; l'interface affiche « Garantie du producteur ».

### Confirmation

Le contrôle de contrat exige, selon le niveau, la nature des entrées et les cas de tests, ou le dépôt et la suite native.
