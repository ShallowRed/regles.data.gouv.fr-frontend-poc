# POC frontend du catalogue des règles publiques

Préfiguration du catalogue des règles publiques data.gouv.fr.

## Démarrer

Prérequis : Node 24, pnpm 10.

```bash
pnpm install
pnpm dev
```

L'application est servie sur http://localhost:3000.

## Stack

- Nuxt 4 (Vue 3, SSR)
- TypeScript strict
- `@datagouv/components-next` (lib npm extraite de cdata)
- DSFR officiel (`@gouvfr/dsfr`)
- Tailwind CSS configuré sur tokens DSFR

## Structure du code

```
app/
├── app.vue
├── assets/css/         # styles globaux + overrides
├── components/
│   ├── business/       # composants métier (RuleCard, MaturityBadge, EngineTag, ...)
│   └── layout/         # shell (header, footer, bannière horizon)
├── data/
│   ├── jsonld/         # fiches metadata.jsonld synchronisées depuis le dépôt data (ne pas éditer)
│   └── catalog.json    # index de catalogue généré (pnpm sync:data)
├── layouts/default.vue # layout par défaut
├── mocks/              # données des entrées (branche demo-resserree : sourcées, pas inventées)
├── pages/
│   ├── index.vue       # page d'accueil des démos
│   ├── mvp/            # démos horizon 6 mois (préfixe d'URL)
│   └── vision/         # démos horizon 3 ans (préfixe d'URL)
├── types/              # types métier (Rule, ...)
└── utils/jsonld-adapter.ts  # adaptateur metadata.jsonld → Rule (+ écarts de profil)
```

## Contrat d'interface avec le dépôt data (`datagouv/regles.data.gouv.fr`)

Le dossier [contrat-interface/](contrat-interface/) porte la proposition de contrat entre ce
front et le dépôt data de Quentin : profil de métadonnées (socle CPSV-AP constaté +
extensions « couche confiance » `rdgf:`), conventions de slugs/URI, spécification de l'index,
rapport de conformité généré, et deux fiches de proposition sur des cas réels.

```bash
pnpm sync:data [chemin-du-clone]   # synchronise les fiches + génère l'index et le rapport
pnpm check:contrat                 # indicateur de convergence (écarts de profil restants)
```
