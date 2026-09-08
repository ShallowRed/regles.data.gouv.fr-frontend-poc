<script setup lang="ts">
/**
 * Exécution d'une règle dans le registre : l'administration publie son code et un
 * manifeste, le registre l'exécute et expose une API. Contenu statique (extraits de
 * manifeste et d'appels), sans dépendance à un service d'exécution en ligne.
 */
useHead({ title: 'Exécuter une règle dans le registre | Catalogue des règles publiques' })

const route = useRoute()

const qualifiedTags = [
  {
    axis: 'exécution',
    value: 'dans le registre',
    tone: 'blue',
    hint: 'Le registre héberge le code publié par l\'administration et l\'exécute à la version enregistrée.',
  },
  {
    axis: 'langages',
    value: 'Python, Catala',
    tone: 'neutral',
    hint: 'Un adaptateur par langage charge le code et lui transmet l\'entrée validée.',
  },
  {
    axis: 'accès',
    value: 'jeton d\'API',
    tone: 'grey',
    hint: 'Chaque appel porte un jeton d\'accès dans l\'en-tête Authorization.',
  },
] as const

/* --- Les trois lieux d'exécution d'une règle, chacun énoncé sur la fiche --- */
const places = [
  {
    icon: 'fr-icon-bank-line',
    title: 'Chez le producteur',
    body: 'L\'administration opère sa propre API. Le registre documente l\'appel, exécute les cas de tests et date chaque contrôle.',
    example: 'Prest\'Agri, API du ministère de l\'Agriculture',
    to: '/mvp/regles/prestagri?tab=api',
    linkLabel: 'Voir l\'API Prest\'Agri',
    current: false,
  },
  {
    icon: 'fr-icon-smartphone-line',
    title: 'Chez le réutilisateur',
    body: 'Le code de la règle est épinglé à une version et exécuté dans le navigateur ou sur le terminal de l\'usager, avec son explication.',
    example: 'Crédit d\'impôt innovation, règles Publicodes',
    to: '/mvp/regles/entreprise-innovation?tab=simulation',
    linkLabel: 'Voir le calcul en navigateur',
    current: false,
  },
  {
    icon: 'fr-icon-server-line',
    title: 'Dans le registre',
    body: 'L\'administration publie son code et un manifeste. Le registre l\'exécute et expose une API prête à appeler ; l\'administration garde son code, ses versions et sa responsabilité.',
    example: 'Quotient familial, module Catala compilé',
    to: null,
    linkLabel: null,
    current: true,
  },
]

/* --- Le parcours, en quatre temps --- */
const steps = [
  { num: '1', label: 'Publier le code', desc: 'Un module Python, ou un programme Catala compilé en Python avant publication. Le module généré est ce qui est déployé.' },
  { num: '2', label: 'Décrire la règle dans un manifeste', desc: 'Identifiant, langage, point d\'entrée, schémas d\'entrée et de sortie, délai maximal, fichiers sources.' },
  { num: '3', label: 'Enregistrer le manifeste', desc: 'Un appel HTTP. Le registre conserve le manifeste sous son identifiant.' },
  { num: '4', label: 'Appeler l\'API', desc: 'Une situation en JSON. Le registre valide l\'entrée, exécute le code et renvoie le résultat avec sa provenance.' },
]

/* --- Onglets : manifeste, enregistrement, exécution, adaptateurs --- */
type TabKey = 'manifeste' | 'enregistrement' | 'execution' | 'adaptateurs'

const tabs: { key: TabKey, label: string, icon: string }[] = [
  { key: 'manifeste', label: 'Manifeste', icon: 'fr-icon-file-text-line' },
  { key: 'enregistrement', label: 'Enregistrement', icon: 'fr-icon-upload-2-line' },
  { key: 'execution', label: 'Exécution', icon: 'fr-icon-play-line' },
  { key: 'adaptateurs', label: 'Adaptateurs', icon: 'fr-icon-stack-line' },
]

const activeTab = computed<TabKey>(() => {
  const requested = String(route.query.tab ?? 'manifeste')
  return tabs.some(t => t.key === requested) ? requested as TabKey : 'manifeste'
})

const manifestFields = [
  { name: 'id', role: 'Identifiant unique dans le registre, repris dans l\'URL d\'exécution.' },
  { name: 'runtime.language', role: '« python » ou « catala » : sélectionne l\'adaptateur qui exécute le code.' },
  { name: 'entrypoint', role: 'Comment charger et appeler le code : un type (« python:class », « catala:scope ») et une cible « module:attribut ».' },
  { name: 'input_schema', role: 'JSON Schema de l\'entrée. Chaque appel est validé contre ce schéma avant exécution.' },
  { name: 'output_schema', role: 'JSON Schema du résultat renvoyé.' },
  { name: 'resources.timeout_seconds', role: 'Délai maximal d\'une exécution.' },
  { name: 'source', role: 'Fichiers sources de la règle, pour la traçabilité.' },
  { name: 'sample_inputs', role: 'Un exemple d\'entrée valide, pour tester l\'enregistrement.' },
]

const manifestExample = `{
  "id": "examples.sample.quotient_familial_catala",
  "name": "Example Quotient Familial (Catala)",
  "org": "local.examples",
  "runtime": { "language": "catala", "version": "dev", "primary": true },
  "entrypoint": {
    "type": "catala:scope",
    "target": "examples.catala.generated.Quotient_familial:quotient_familial"
  },
  "input_schema": {
    "type": "object",
    "required": ["agent_revenu", "agent_enfants", "conjoint_revenu"],
    "properties": {
      "agent_revenu": { "type": "number" },
      "agent_enfants": { "type": "integer" },
      "conjoint_revenu": { "type": "number" }
    },
    "additionalProperties": false
  },
  "output_schema": {
    "type": "object",
    "required": ["valeur", "nombre_parts"],
    "properties": {
      "valeur": { "type": "number" },
      "nombre_parts": { "type": "integer" }
    }
  },
  "resources": { "timeout_seconds": 10 },
  "source": ["examples/catala/src/quotient_familial.catala_fr"],
  "sample_inputs": { "agent_revenu": 32000, "agent_enfants": 2, "conjoint_revenu": 0 }
}`

const registerRequest = `POST /catalog/register
Authorization: Bearer <jeton>
Content-Type: application/json

{
  "id": "examples.sample.quotient_familial_catala",
  "runtime": { "language": "catala", "version": "dev", "primary": true },
  "entrypoint": {
    "type": "catala:scope",
    "target": "examples.catala.generated.Quotient_familial:quotient_familial"
  },
  "input_schema": { "...": "..." },
  "output_schema": { "...": "..." }
}`

const registerResponse = `HTTP 200

{
  "status": "registered",
  "id": "examples.sample.quotient_familial_catala"
}`

const catalogRoutes = [
  { method: 'POST', path: '/catalog/register', role: 'Enregistre un manifeste, ou remplace celui qui porte le même identifiant.' },
  { method: 'GET', path: '/catalog', role: 'Liste les identifiants enregistrés.' },
  { method: 'GET', path: '/catalog/{id}', role: 'Renvoie le manifeste enregistré.' },
  { method: 'POST', path: '/catalog/infer-schema', role: 'Génère les schémas d\'entrée et de sortie depuis un module Catala compilé.' },
]

const executeRequest = `POST /execute/examples.sample.quotient_familial_catala
Authorization: Bearer <jeton>
Content-Type: application/json

{
  "agent_revenu": 32000,
  "agent_enfants": 2,
  "conjoint_revenu": 0
}`

const executeResponse = `HTTP 200

{
  "status": "success",
  "output": {
    "valeur": 10666.67,
    "nombre_parts": 3
  },
  "metrics": { "runtime_seconds": 0.002 },
  "provenance": {
    "adapter": "catala_adapter_v0.1",
    "module": "examples.catala.generated.Quotient_familial",
    "scope": "quotient_familial"
  }
}`

const outcomes = [
  { code: '200', status: 'success', tone: 'green', text: 'Résultat calculé, avec sa provenance : adaptateur, module et champ d\'application exécutés.' },
  { code: '200', status: 'failed', tone: 'yellow', text: 'La règle a refusé le calcul (valeur manquante, division par zéro, assertion). Le message vient du programme lui-même.' },
  { code: '200', status: 'error', tone: 'grey', text: 'Incident technique dans l\'adaptateur ou l\'infrastructure.' },
  { code: '400', status: 'entrée refusée', tone: 'grey', text: 'L\'entrée contredit le schéma du manifeste. Le code n\'a pas été exécuté.' },
  { code: '401 / 403', status: 'jeton', tone: 'grey', text: 'Jeton absent ou invalide.' },
] as const

const adapters = [
  {
    title: 'Python',
    entrypoints: ['python:function', 'python:class', 'python:regalgo_class'],
    body: 'Une fonction ou une classe importable par le service, appelée avec l\'entrée validée et attendue de renvoyer un objet JSON conforme au schéma de sortie.',
    detail: 'Un paquet conforme à la convention regalgo (méthode compute, entrée data + context) s\'enregistre tel quel.',
  },
  {
    title: 'Catala',
    entrypoints: ['catala:scope'],
    body: 'Le programme Catala est compilé en Python avant publication. L\'adaptateur importe le module généré et appelle la fonction du champ d\'application.',
    detail: 'L\'entrée JSON est convertie vers les types Catala (argent, entier, décimal, booléen, date, option, liste, structure) et la sortie renvoyée en JSON.',
  },
]

const catalaSource = `déclaration champ d'application QuotientFamilial:
  entrée agent_revenu contenu argent
  entrée agent_enfants contenu entier
  entrée conjoint_revenu contenu argent
  résultat valeur contenu argent
  résultat nombre_parts contenu entier

champ d'application QuotientFamilial:
  définition nombre_parts égal à
    agent_enfants + 1

  définition valeur égal à
    (agent_revenu + conjoint_revenu) / nombre_parts`

const catalaChain = [
  { icon: 'fr-icon-file-text-line', label: 'Source Catala', file: 'src/quotient_familial.catala_fr', desc: 'Le texte de la règle, lisible par un juriste, et sa transcription exécutable.' },
  { icon: 'fr-icon-settings-5-line', label: 'Compilation', file: 'clerk build', desc: 'Réalisée avant publication, avec la chaîne d\'outils Catala.' },
  { icon: 'fr-icon-code-s-slash-line', label: 'Module généré', file: 'generated/Quotient_familial.py', desc: 'Ce qui est déployé. Il ne dépend que de la bibliothèque standard Python.' },
  { icon: 'fr-icon-play-line', label: 'Exécution', file: 'quotient_familial(entrée)', desc: 'L\'adaptateur importe le module et appelle la fonction du champ d\'application.' },
]
</script>

<template>
  <div>
    <!-- ============ EN-TÊTE ============ -->
    <BrandBackgroundContainer
      variant="soft"
      class="full-bleed border-b border-[#e3e3fd]"
    >
      <div class="fr-container pt-1 space-y-8 pb-8">
        <div class="space-y-4">
          <Breadcrumbs
            :items="[
              { to: '/mvp', label: 'Accueil' },
              { to: '/mvp/comprendre/reutiliser-une-regle', label: 'Réutiliser une règle' },
              { to: null, label: 'Exécuter dans le registre' },
            ]"
          />
          <header class="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
            <div class="space-y-3 max-w-3xl">
              <h1 class="fr-h2 m-0">
                Une règle exécutée dans le registre, une API en service
              </h1>
              <p class="fr-text--lead text-gray-700 m-0">
                L'administration publie le code de sa règle et le décrit dans un manifeste.
                Le registre l'enregistre, l'exécute à la demande et expose une API documentée,
                prête à intégrer dans un service.
              </p>
            </div>
            <ul class="flex-1 flex flex-wrap md:justify-end items-end gap-2 list-none p-0 m-0">
              <li
                v-for="tag in qualifiedTags"
                :key="tag.axis"
              >
                <QualifiedTag
                  :axis="tag.axis"
                  :value="tag.value"
                  :tone="tag.tone"
                  :hint="tag.hint"
                />
              </li>
            </ul>
          </header>
        </div>
      </div>
    </BrandBackgroundContainer>

    <!-- ============ TROIS LIEUX + PARCOURS (bande rythmée) ============ -->
    <BrandBackgroundContainer
      variant="subtle"
      class="full-bleed border-b border-[#e3e3fd]"
    >
      <div class="fr-container py-12 md:py-16 space-y-12 md:space-y-16">
        <!-- Où s'exécute une règle -->
        <section
          aria-labelledby="lieux"
          class="space-y-8"
        >
          <div class="max-w-3xl space-y-2">
            <h2
              id="lieux"
              class="fr-h3 m-0"
            >
              Où s'exécute une règle
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              Chaque fiche indique où le calcul a lieu et ce que le registre en contrôle.
              Trois cas existent aujourd'hui.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              v-for="p in places"
              :key="p.title"
              class="flex flex-col rounded-lg border bg-white p-6 space-y-3"
              :class="p.current ? 'border-[#000091] shadow-[0_4px_24px_rgba(0,0,145,0.08)]' : 'border-gray-200'"
            >
              <div class="flex items-center justify-between gap-2">
                <span
                  :class="p.icon"
                  class="fr-icon--lg text-[#000091]"
                  aria-hidden="true"
                />
                <span
                  v-if="p.current"
                  class="fr-badge fr-badge--sm fr-badge--blue-cumulus fr-badge--no-icon"
                >Cette page</span>
              </div>
              <h3 class="fr-h6 m-0">
                {{ p.title }}
              </h3>
              <p class="fr-text--sm text-gray-700 m-0">
                {{ p.body }}
              </p>
              <div class="fr-text--xs text-gray-600 m-0 pt-2 mt-auto border-t border-gray-100 space-y-1">
                <p class="m-0 flex items-start gap-1.5">
                  <span
                    class="fr-icon-information-line fr-icon--xs text-[#000091] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{{ p.example }}</span>
                </p>
                <NuxtLink
                  v-if="p.to"
                  :to="p.to"
                  class="fr-link fr-text--xs fr-icon-arrow-right-line fr-link--icon-right"
                >
                  {{ p.linkLabel }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </section>

        <!-- Le parcours -->
        <section
          aria-labelledby="parcours"
          class="space-y-8"
        >
          <div class="max-w-3xl space-y-2">
            <h2
              id="parcours"
              class="fr-h3 m-0"
            >
              Comment une règle devient une API
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              Le code reste celui de l'administration. Le registre ajoute l'enregistrement,
              la validation des entrées et l'exécution.
            </p>
          </div>

          <ol class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 list-none p-0 m-0">
            <li
              v-for="(step, i) in steps"
              :key="step.num"
              class="relative rounded-lg border border-gray-200 bg-white p-5 marker:content-['']"
            >
              <span class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#000091] text-white font-bold">
                {{ step.num }}
              </span>
              <span
                v-if="i < steps.length - 1"
                class="hidden lg:block absolute top-7 -right-9 text-[#000091] fr-icon-arrow-right-line"
                aria-hidden="true"
              />
              <p class="fr-text--sm font-bold text-gray-900 mt-3 mb-1">
                {{ step.label }}
              </p>
              <p class="fr-text--xs text-gray-600 m-0">
                {{ step.desc }}
              </p>
            </li>
          </ol>
        </section>
      </div>
    </BrandBackgroundContainer>

    <!-- ============ MANIFESTE, ENREGISTREMENT, EXÉCUTION (onglets) ============ -->
    <section
      aria-labelledby="service"
      class="fr-container py-12 md:py-16 space-y-8"
    >
      <div class="max-w-3xl space-y-2">
        <h2
          id="service"
          class="fr-h3 m-0"
        >
          Le service d'exécution, appel par appel
        </h2>
        <p class="fr-text--lg text-gray-700 m-0">
          L'exemple suivi est un quotient familial écrit en Catala, compilé en Python et
          enregistré dans le registre.
        </p>
      </div>

      <div class="bg-white rounded-sm shadow-[0_4px_24px_rgba(0,0,145,0.08)] border border-gray-200/60">
        <nav
          aria-label="Étapes du service d'exécution"
          class="border-b border-gray-200 overflow-x-auto px-5 md:px-8"
        >
          <ul class="flex gap-1 list-none p-0 m-0 min-w-max">
            <li
              v-for="tab in tabs"
              :key="tab.key"
              class="pb-[1px]"
            >
              <NuxtLink
                :to="`/mvp/api-service?tab=${tab.key}`"
                class="inline-flex items-center gap-2 px-4 py-3 -mb-px border-b-2 font-medium transition-colors bg-none whitespace-nowrap"
                :class="activeTab === tab.key
                  ? 'border-[#000091] text-[#000091]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
              >
                <span
                  :class="tab.icon"
                  class="fr-icon--sm"
                  aria-hidden="true"
                />
                {{ tab.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="min-w-0 p-5 md:px-12 md:py-10">
          <!-- MANIFESTE -->
          <div
            v-if="activeTab === 'manifeste'"
            class="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-8 lg:gap-10 items-start"
          >
            <div class="space-y-4 min-w-0">
              <h3 class="fr-h5 m-0">
                Ce que le manifeste décrit
              </h3>
              <p class="fr-text--sm text-gray-700 m-0">
                Un document JSON, commun à tous les langages. Le langage et le point d'entrée
                déterminent l'adaptateur qui exécute le code ; les schémas fixent le contrat
                d'entrée et de sortie.
              </p>
              <ul class="list-none p-0 m-0 divide-y divide-gray-100 border-y border-gray-100">
                <li
                  v-for="field in manifestFields"
                  :key="field.name"
                  class="py-2.5 grid grid-cols-[minmax(0,11rem)_1fr] gap-3"
                >
                  <code class="fr-text--xs mb-0 text-[#000091] break-all">{{ field.name }}</code>
                  <span class="fr-text--xs mb-0 text-gray-700">{{ field.role }}</span>
                </li>
              </ul>
            </div>
            <div class="space-y-2 min-w-0">
              <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0">
                Manifeste du quotient familial (Catala)
              </p>
              <pre class="m-0 bg-[#1b1b35] text-gray-100 rounded-lg p-4 text-xs overflow-auto"><code>{{ manifestExample }}</code></pre>
            </div>
          </div>

          <!-- ENREGISTREMENT -->
          <div
            v-else-if="activeTab === 'enregistrement'"
            class="space-y-8"
          >
            <div class="max-w-2xl space-y-3">
              <h3 class="fr-h5 m-0">
                Enregistrer le manifeste
              </h3>
              <p class="fr-text--sm text-gray-700 m-0">
                Un appel authentifié dépose le manifeste. Le registre le conserve sous son
                identifiant et l'API d'exécution est ouverte à cette adresse.
              </p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-2 min-w-0">
                <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0">
                  Requête
                </p>
                <pre class="m-0 bg-[#1b1b35] text-gray-100 rounded-lg p-4 text-xs overflow-auto"><code>{{ registerRequest }}</code></pre>
              </div>
              <div class="space-y-2 min-w-0">
                <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0">
                  Réponse
                </p>
                <pre class="m-0 bg-[#1b1b35] text-gray-100 rounded-lg p-4 text-xs overflow-auto"><code>{{ registerResponse }}</code></pre>
              </div>
            </div>
            <div class="space-y-3">
              <h4 class="fr-h6 m-0">
                Routes du catalogue d'exécution
              </h4>
              <ul class="list-none p-0 m-0 divide-y divide-gray-100 border-y border-gray-100">
                <li
                  v-for="r in catalogRoutes"
                  :key="r.path"
                  class="py-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1"
                >
                  <span class="fr-badge fr-badge--sm fr-badge--blue-cumulus fr-badge--no-icon">{{ r.method }}</span>
                  <code class="fr-text--xs mb-0 text-gray-800">{{ r.path }}</code>
                  <span class="fr-text--xs mb-0 text-gray-600 basis-full sm:basis-auto">{{ r.role }}</span>
                </li>
              </ul>
              <p class="fr-text--xs text-gray-600 m-0 flex items-start gap-1.5">
                <span
                  class="fr-icon-lock-line fr-icon--xs text-[#000091] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>Toutes les routes exigent un jeton d'accès (en-tête <code class="fr-text--xs">Authorization: Bearer</code>).</span>
              </p>
            </div>
          </div>

          <!-- EXÉCUTION -->
          <div
            v-else-if="activeTab === 'execution'"
            class="space-y-8"
          >
            <div class="max-w-2xl space-y-3">
              <h3 class="fr-h5 m-0">
                Exécuter la règle
              </h3>
              <p class="fr-text--sm text-gray-700 m-0">
                La situation est envoyée en JSON à l'adresse de la règle. Le registre la valide
                contre le schéma d'entrée du manifeste, puis l'adaptateur exécute le code dans le
                délai déclaré.
              </p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-2 min-w-0">
                <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0">
                  Requête
                </p>
                <pre class="m-0 bg-[#1b1b35] text-gray-100 rounded-lg p-4 text-xs overflow-auto"><code>{{ executeRequest }}</code></pre>
              </div>
              <div class="space-y-2 min-w-0">
                <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0">
                  Réponse
                </p>
                <pre class="m-0 bg-[#1b1b35] text-gray-100 rounded-lg p-4 text-xs overflow-auto"><code>{{ executeResponse }}</code></pre>
              </div>
            </div>
            <div class="space-y-3">
              <h4 class="fr-h6 m-0">
                Ce que la réponse indique
              </h4>
              <ul class="list-none p-0 m-0 divide-y divide-gray-100 border-y border-gray-100">
                <li
                  v-for="o in outcomes"
                  :key="`${o.code}-${o.status}`"
                  class="py-2.5 grid grid-cols-1 sm:grid-cols-[minmax(0,14rem)_1fr] gap-x-4 gap-y-1 items-baseline"
                >
                  <span class="flex flex-wrap items-baseline gap-2">
                    <code class="fr-text--xs mb-0 text-gray-800 tabular-nums">{{ o.code }}</code>
                    <QualifiedTag
                      axis="statut"
                      :value="o.status"
                      :tone="o.tone"
                    />
                  </span>
                  <span class="fr-text--xs mb-0 text-gray-700">{{ o.text }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- ADAPTATEURS -->
          <div
            v-else
            class="space-y-8"
          >
            <div class="max-w-2xl space-y-3">
              <h3 class="fr-h5 m-0">
                Un adaptateur par langage
              </h3>
              <p class="fr-text--sm text-gray-700 m-0">
                Le champ <code class="fr-text--xs">runtime.language</code> du manifeste désigne
                l'adaptateur. Chacun valide l'entrée, charge le code depuis le point d'entrée,
                l'appelle et renvoie une réponse de même forme.
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="a in adapters"
                :key="a.title"
                class="flex flex-col rounded-lg border border-gray-200 bg-white p-6 space-y-3"
              >
                <div class="flex items-center gap-2">
                  <h4 class="fr-h6 m-0">
                    {{ a.title }}
                  </h4>
                  <EngineTag
                    v-if="a.title === 'Catala'"
                    engine="catala"
                  />
                </div>
                <ul class="flex flex-wrap gap-1.5 list-none p-0 m-0">
                  <li
                    v-for="e in a.entrypoints"
                    :key="e"
                  >
                    <code class="fr-text--xs mb-0 bg-gray-100 px-1.5 py-0.5 rounded">{{ e }}</code>
                  </li>
                </ul>
                <p class="fr-text--sm text-gray-700 m-0">
                  {{ a.body }}
                </p>
                <p class="fr-text--xs text-gray-600 m-0 pt-2 mt-auto border-t border-gray-100 flex items-start gap-1.5">
                  <span
                    class="fr-icon-information-line fr-icon--xs text-[#000091] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{{ a.detail }}</span>
                </p>
              </div>
            </div>
            <p class="fr-text--sm text-gray-600 max-w-2xl m-0">
              Pour Catala, les schémas d'entrée et de sortie se génèrent depuis les types du
              module compilé, avec un exemple d'entrée. Un type externe (énumération à charge
              utile en entrée) se traite par un court module Python, enregistré comme
              algorithme Python.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ L'EXEMPLE CATALA (bande rythmée) ============ -->
    <BrandBackgroundContainer
      variant="subtle"
      class="full-bleed border-y border-[#e3e3fd]"
    >
      <div class="fr-container py-12 md:py-16 space-y-8">
        <div class="max-w-3xl space-y-2">
          <h2
            id="catala"
            class="fr-h3 m-0"
          >
            L'exemple Catala, de la source au résultat
          </h2>
          <p class="fr-text--lg text-gray-700 m-0">
            Même chaîne que Prest'Agri : la règle est écrite en Catala, compilée avant
            publication, et le module généré est ce qui s'exécute.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div class="space-y-2 min-w-0">
            <p class="fr-text--xs uppercase tracking-wide text-gray-500 m-0">
              Source Catala · quotient_familial.catala_fr
            </p>
            <pre class="m-0 bg-[#1b1b35] text-gray-100 rounded-lg p-4 text-xs overflow-auto"><code>{{ catalaSource }}</code></pre>
            <p class="fr-text--xs text-gray-600 m-0">
              Le foyer compte une part par enfant en plus de celle de l'agent ; le revenu du
              foyer est divisé par ce nombre de parts. Pour 32 000 € et deux enfants, le
              quotient vaut 10 666,67 € sur trois parts.
            </p>
          </div>
          <ol class="list-none p-0 m-0 space-y-3">
            <li
              v-for="(c, i) in catalaChain"
              :key="c.label"
              class="relative rounded-lg border border-gray-200 bg-white p-4 flex items-start gap-3"
            >
              <span
                :class="c.icon"
                class="fr-icon--sm text-[#000091] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div class="min-w-0 space-y-0.5">
                <p class="fr-text--sm mb-0 font-bold text-gray-900 m-0">
                  {{ i + 1 }}. {{ c.label }}
                  <code class="fr-text--xs font-normal text-gray-600 ml-1 break-all">{{ c.file }}</code>
                </p>
                <p class="fr-text--xs text-gray-600 m-0">
                  {{ c.desc }}
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div class="flex flex-wrap gap-x-6 gap-y-2">
          <NuxtLink
            to="/mvp/regles/prestagri"
            class="fr-link fr-text--sm fr-icon-arrow-right-line fr-link--icon-right"
          >
            Prest'Agri, règle Catala en production
          </NuxtLink>
          <a
            href="https://github.com/qloridant/datapi"
            target="_blank"
            rel="noopener"
            class="fr-link fr-text--sm fr-icon-external-link-line fr-link--icon-right"
          >
            Code source du service d'exécution
          </a>
          <a
            href="https://github.com/qloridant/datapi/blob/main/docs/INTEGRATION.md"
            target="_blank"
            rel="noopener"
            class="fr-link fr-text--sm fr-icon-external-link-line fr-link--icon-right"
          >
            Guide d'intégration
          </a>
        </div>
      </div>
    </BrandBackgroundContainer>

    <!-- ============ APPEL À EXPLORER ============ -->
    <BrandBackgroundContainer
      variant="contrast"
      class="full-bleed"
    >
      <div class="fr-container py-12 md:py-14">
        <div class="max-w-2xl space-y-3">
          <h2 class="fr-h4 m-0 text-white">
            Comparer avec une API opérée par le producteur
          </h2>
          <p class="fr-text--sm mb-0 text-white/90 m-0">
            La fiche Prest'Agri documente l'API du ministère de l'Agriculture : adresse,
            paramètres, exemple de réponse et contrôles datés.
          </p>
          <div class="flex flex-wrap gap-3 pt-2">
            <NuxtLink
              to="/mvp/regles/prestagri?tab=api"
              class="fr-btn btn-on-dark--solid"
            >
              Voir l'API Prest'Agri
            </NuxtLink>
            <NuxtLink
              to="/mvp/regles/"
              class="fr-btn fr-btn--secondary btn-on-dark--ghost"
            >
              Parcourir le catalogue
            </NuxtLink>
          </div>
        </div>
      </div>
    </BrandBackgroundContainer>
  </div>
</template>
