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
