---
status: accepted
date: 2026-09-12
decision-makers: équipe du registre
informed: dépôt data, ICTU
scope: registre
---
# L'enveloppe d'un cas de test est dans la fiche, les résultats d'exécution du registre s'écrivent en EARL

## Contexte et problème

Un cas de test est écrit dans le format de son moteur et constitue la référence (ADR-0001). Le registre a besoin d'une enveloppe qui indique ce que le cas vérifie, son origine, son validateur, sa date, sa tolérance, et d'un format pour publier le résultat daté de ses exécutions. Avec quels vocabulaires ?

## Facteurs de décision

* EARL, note W3C de 2017, décrit une assertion de test : sujet, test, résultat avec `earl:outcome` parmi `passed`, `failed`, `cantTell`, `inapplicable`, `untested`, assertor, date.
* Dublin Core, PROV et ADMS fournissent description, attribution, date, statut, format et source.
* CPRMV définit `TestCase` et `TestSet`, sans propriétés d'origine ni de validation.

## Options considérées

* Une enveloppe propre au registre dans la fiche, et EARL pour les exécutions.
* EARL pour l'enveloppe aussi, en l'étendant de l'origine, du validateur et de la tolérance.

## Décision

Option retenue : enveloppe propre et EARL pour les exécutions, parce qu'EARL décrit une exécution et que l'origine, le validateur et la tolérance sont des informations que seul le producteur détient.

```jsonc
"rdgf:testCase": [{
  "type": "rdgf:TestCase",
  "id": "…/v1#test-agent-seul-30000",
  "title": "Agent seul, 30 000 € de revenu, 2 enfants",
  "rdgf:origin": "administration",
  "prov:wasAttributedTo": { "id": "…#organisation" },
  "dct:date": "2026-08-13",
  "adms:status": "valid",
  "dct:format": "catala-assert",
  "dct:source": { "id": "github.com/betagouv/prestagri/tree/478b3cc…/catala" },
  "cv:hasLegalResource": { "id": "…" },
  "rdgf:tolerance": "0.01"
}]
```

`rdgf:origin` vaut `administration`, `case-law`, `circular`, `anonymised-case` ou `community` ; `adms:status` vaut `valid`, `pending` ou `failing` ; `dct:source` désigne le test natif.

Le registre publie une assertion EARL par cas exécuté :

```jsonc
{
  "type": "earl:Assertion",
  "earl:assertor": { "id": "https://regles.data.gouv.fr" },
  "earl:subject": { "id": "github.com/betagouv/prestagri/tree/478b3cc…" },
  "earl:test": { "id": "…/v1#test-agent-seul-30000" },
  "earl:result": { "earl:outcome": "earl:passed", "dct:date": "2026-08-13" },
  "earl:mode": "earl:automatic"
}
```

### Conséquences

* Bon, parce que le badge « résultats testés » est calculé à partir des assertions et qu'un `earl:failed` affiche l'écart sur la fiche.
* Bon, parce que le fichier d'assertions est régénéré à chaque exécution ; un changement de vocabulaire de sortie ne modifie aucune fiche.
* Mauvais, parce qu'EARL reste une note W3C sans évolution depuis 2017.

### Confirmation

Une règle `certified` contient au moins un cas avec enveloppe ; une règle `self-assessed` référence sa suite native par `dct:source`. Le contexte déclare `earl` et type `dct:date` en `xsd:date`.
