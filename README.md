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
├── layouts/default.vue # layout par défaut
├── mocks/              # données mockées, par démo
├── pages/
│   ├── index.vue       # page d'accueil des démos
│   ├── mvp/            # démos horizon 6 mois (préfixe d'URL)
│   └── vision/         # démos horizon 3 ans (préfixe d'URL)
└── types/              # types métier (Rule, ...)
```
