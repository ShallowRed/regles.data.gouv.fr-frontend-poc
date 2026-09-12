---
status: proposed
date: 2026-09-12
decision-makers: équipe du registre
consulted: dépôt data, producteurs
scope: fiche
---
# La base légale désigne l'article en ELI, le texte entier reste admis

## Contexte et problème

La base légale sert à trois usages : l'afficher sur la fiche, mettre un article en regard du fragment de code qui l'applique, dater une version de la règle par le texte qui l'a déclenchée. Les deux derniers demandent de désigner un article. Les fiches du dépôt data désignent aujourd'hui le texte entier et décrivent les articles en prose. À quel niveau ancrer la base légale ?

## Facteurs de décision

* ELI 1.5 désigne un article par `eli:LegalResourceSubdivision`, rattaché au texte par `eli:is_part_of`, daté par `eli:version_date` ; Légifrance expose une URI par article.
* Un référencement simple doit rester possible sans travail du producteur.

## Options considérées

* L'article en ELI, avec le texte entier admis.
* L'article obligatoire.

## Décision

Option retenue : l'article en ELI avec le texte entier admis, parce que chaque usage dispose du niveau qu'il exige et qu'une fiche minimale reste valide.

```jsonc
"cv:hasLegalResource": [{
  "id": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000…",
  "type": "eli:LegalResourceSubdivision",
  "title": "Article 244 quater B",
  "eli:is_part_of": { "id": "https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006069577/" },
  "eli:version_date": "2025-01-01"
}]
```

Une fiche qui désigne le texte entier est valide, avec `dct:coverage` en prose.

### Conséquences

* Bon, parce que la traçabilité et l'historique (ADR-0008) référencent une subdivision quand elle existe, et que l'interface affiche l'article quand il est connu.
* Bon, parce qu'un niveau plus fin, alinéa ou fragment, et les versions temporelles ELI d'un article s'ajoutent par le même mécanisme.
* Mauvais, parce que le passage des fiches existantes à l'article se fait avec chaque producteur.

### Confirmation

Le contrôle de contrat indique le niveau atteint, article ou texte. Le contexte déclare `eli` et type `eli:version_date` en `xsd:date`.
