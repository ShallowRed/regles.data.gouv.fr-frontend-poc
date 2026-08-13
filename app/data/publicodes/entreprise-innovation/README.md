# Règles Publicodes — aides fiscales à l'innovation (CIR, CII, CICo, JEI, JEU, JEC)

Fichiers `.publicodes` vendorés depuis le dépôt public
[betagouv/publicodes-entreprise-innovation](https://github.com/betagouv/publicodes-entreprise-innovation),
au commit épinglé :

- **SHA** : `fc8e9a8ac572b03d75504a2aba39d5633c0b25ea`
- **Provenance** : `src/*.publicodes` (variables, helpers, explications) et
  `src/dispositifs/*.publicodes` (cico, cii, cir, jec, jei, jeu), aplatis dans ce dossier
- **Licence** : MIT (déclarée dans le `package.json` du dépôt source ; pas de fichier
  LICENSE à ce commit)

Ces fichiers sont chargés tels quels par `app/composables/usePublicodesEngine.ts`
(parse YAML + fusion + `new Engine(rules)`) pour l'aperçu de calcul exécuté dans le
navigateur sur la fiche `entreprise-innovation`. Ne pas les modifier à la main :
re-télécharger depuis le dépôt source en mettant à jour le SHA ci-dessus.

## Cas de test et vérification continue

L'enveloppe de cas (`app/mocks/rule-tests.ts`, ruleId `entreprise-innovation`) porte
quatre cas : barème CIR 30 %/5 % (100 k€ et 150 M€), non-éligibilité artisanale BNC,
et la situation CICo native du dépôt DGE (`situations/cico.publicodes`). Les valeurs
attendues sont des calculs réels du moteur embarqué (publicodes 1.10.1). Le rejeu
tourne dans `pnpm verify:rules` (mode `publicodes-node`, même chargement que le
front), la variable cible venant du champ `targetVariable` de l'enveloppe.

## Constats à remonter au producteur (DGE)

Relevés en construisant l'enveloppe, avec les règles au SHA ci-dessus :

1. **`cir . montant` calcule même hors éligibilité** : la somme des crédits ne
   dépend pas de `cir . eligibilite` (ex. artisanale BNC non éligible, 50 k€ de
   dépenses : montant 15 000 €). Un réutilisateur qui n'évalue que le montant
   afficherait un droit inexistant. L'aperçu du POC masque le montant quand
   l'éligibilité est fausse.
2. **Les explications rédigées sont inatteignables en cas de non-éligibilité** :
   `cir . eligibilite . explications` (mécanisme `texte`) est un enfant de
   `cir . eligibilite` ; quand celle-ci vaut `non`, le moteur désactive ses
   enfants et l'évaluation rend `null`. Les textes prévus par le producteur ne
   peuvent donc pas être servis par une évaluation standard, précisément dans le
   cas qu'ils documentent. L'aperçu du POC affiche à la place l'état des
   conditions nommées (`regimeFiscalReelOuConditionDExoneration`).
