<script setup lang="ts">
useHead({ title: 'Vérifier une règle | Catalogue des règles publiques' })

const { withBaseURL } = useBaseUrl()

const steps = [
  { num: '1', label: 'Le texte', desc: 'L\'article de loi ou le décret qui fonde la règle.' },
  { num: '2', label: 'La règle métier', desc: 'L\'interprétation administrative : le barème, les conditions.' },
  { num: '3', label: 'Le code', desc: 'La modélisation exécutable qui calcule le résultat.' },
  { num: '4', label: 'Le résultat', desc: 'Un montant ou une éligibilité, traçable jusqu\'à sa source.' },
]

const guarantees = [
  {
    pictogram: withBaseURL('/pictograms/justice.svg'),
    title: 'Chaque règle est reliée à son texte',
    body: 'Loi, décret, arrêté, convention ou délibération : la base légale de chaque règle est référencée et liée à sa source officielle (Légifrance, identifiants ELI et LEGIARTI).',
  },
  {
    pictogram: withBaseURL('/pictograms/document-search.svg'),
    title: 'L\'historique est conservé',
    body: 'À chaque évolution de la réglementation, une nouvelle version de la règle est publiée. On peut consulter l\'état du droit applicable à une date donnée.',
  },
  {
    pictogram: withBaseURL('/pictograms/contract.svg'),
    title: 'La fiabilité est qualifiée',
    body: 'Selon les preuves apportées par le producteur (code ouvert, cas de test, certification), la règle gagne en niveau de garantie, signalé clairement sur sa fiche.',
  },
]

/* --- Frise des versions de Prest'Agri, pour illustrer « l'état du droit à une date donnée » --- */
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long' })
const kindMeta: Record<string, { label: string, dot: string }> = {
  majeur: { label: 'Évolution majeure', dot: 'bg-[#6e445a]' },
  mineur: { label: 'Mise à jour', dot: 'bg-[#000091]' },
  correctif: { label: 'Correctif', dot: 'bg-[#716043]' },
  editorial: { label: 'Éditorial', dot: 'bg-gray-400' },
}
const rsaTimeline = computed(() =>
  ruleVersionsMock
    .filter(v => v.ruleId === 'prestagri')
    .map(v => ({
      ...v,
      date: dateFormatter.format(new Date(v.publishedAt)),
      meta: kindMeta[v.kind] ?? kindMeta.editorial,
    })),
)
</script>

<template>
  <div>
    <!-- ============ EN-TÊTE + CHIFFRES CLÉS ============ -->
    <BrandBackgroundContainer
      variant="soft"
      class="full-bleed border-b border-[#e3e3fd]"
    >
      <div class="fr-container pt-1 space-y-8 pb-8">
        <div class="space-y-4">
          <Breadcrumbs
            :items="[
              { to: '/mvp', label: 'Accueil' },
              { to: null, label: 'Vérifier une règle' },
            ]"
          />
          <header class="space-y-3 max-w-3xl">
            <h1 class="fr-h2 m-0">
              Du résultat affiché jusqu'au texte de loi
            </h1>
            <p class="fr-text--lead text-gray-700 m-0">
              Chaque décision algorithmique doit pouvoir être expliquée. Le catalogue
              relie chaque règle de calcul à la réglementation qui la fonde, pour que chacun
              puisse comprendre et vérifier d'où vient un droit.
            </p>
          </header>
        </div>
      </div>
    </BrandBackgroundContainer>

    <!-- ============ LA CHAÎNE + ARTEFACTS (bande rythmée) ============ -->
    <BrandBackgroundContainer
      variant="subtle"
      class="full-bleed border-b border-[#e3e3fd]"
    >
      <div class="fr-container py-12 md:py-16 space-y-12 md:space-y-16">
        <!-- La chaîne de traçabilité -->
        <section
          aria-labelledby="chaine"
          class="space-y-8"
        >
          <div class="max-w-3xl space-y-2">
            <h2
              id="chaine"
              class="fr-h3 m-0"
            >
              La chaîne qui relie la loi au calcul
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              Entre le texte voté et le montant affiché à l'usager, il y a plusieurs traductions.
              Le catalogue rend chacune d'elles visible et vérifiable.
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

        <!-- L'état du droit à une date donnée : frise de versions -->
        <section
          aria-labelledby="historique"
          class="space-y-8"
        >
          <div class="max-w-3xl space-y-2">
            <h2
              id="historique"
              class="fr-h3 m-0"
            >
              L'état du droit, à une date donnée
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              Chaque évolution réglementaire donne lieu à une nouvelle version, datée et reliée
              au texte qui l'a déclenchée. On peut ainsi savoir quelle règle s'appliquait à un instant précis.
            </p>
          </div>

          <div class="rounded-lg border border-gray-200 bg-white p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,145,0.04)]">
            <p class="fr-text--sm text-gray-700 m-0 mb-6">
              <span class="font-bold">Revenu de solidarité active - éligibilité</span>
              <span class="text-gray-500"> · produit par la CNAF</span>
            </p>
            <ol class="relative list-none p-0 pl-6 m-0 ml-2 space-y-6">
              <li
                v-for="v in rsaTimeline"
                :key="v.id"
                class="relative pl-6"
              >
                <span
                  class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white"
                  :class="v.meta!.dot"
                  aria-hidden="true"
                />
                <div class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span class="fr-text--sm mb-0 font-bold text-gray-900 tabular-nums">{{ formatRuleVersion(v.version) }}</span>
                  <span class="fr-text--xs mb-0 text-gray-500">{{ v.date }}</span>
                  <span class="fr-text--xs mb-0 text-gray-400">·</span>
                  <span class="fr-text--xs mb-0 text-gray-500">{{ v.meta!.label }}</span>
                </div>
                <p class="fr-text--sm mb-0 text-gray-700 m-0 mt-1">
                  {{ v.changelog }}
                </p>
              </li>
            </ol>
          </div>
        </section>
      </div>
    </BrandBackgroundContainer>

    <!-- ============ GARANTIES (fond blanc) ============ -->
    <section
      aria-labelledby="garanties"
      class="fr-container py-12 md:py-16 space-y-8"
    >
      <h2
        id="garanties"
        class="fr-h3 m-0 max-w-3xl"
      >
        Ce que le catalogue garantit
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="g in guarantees"
          :key="g.title"
          class="rounded-lg border border-gray-200 bg-white p-6 space-y-3"
        >
          <img
            :src="g.pictogram"
            alt=""
            width="64"
            height="64"
          >
          <h3 class="fr-h6 m-0">
            {{ g.title }}
          </h3>
          <p class="fr-text--sm mb-0 text-gray-700 m-0">
            {{ g.body }}
          </p>
        </div>
      </div>
    </section>

    <!-- ============ APPEL À EXPLORER ============ -->
    <BrandBackgroundContainer
      variant="contrast"
      class="full-bleed"
    >
      <div class="fr-container py-12 md:py-14">
        <div class="max-w-2xl space-y-3">
          <h2 class="fr-h4 m-0 text-white">
            Voir la traçabilité sur une règle réelle
          </h2>
          <p class="fr-text--sm mb-0 text-white/90 m-0">
            Ouvrez une fiche et explorez l'onglet « Bases légales » : chaque règle expose
            les textes qui la fondent et l'historique de ses versions.
          </p>
          <div class="flex flex-wrap gap-3 pt-2">
            <NuxtLink
              to="/mvp/regles/prestagri?tab=legal"
              class="fr-btn btn-on-dark--solid"
            >
              Exemple : Prest'Agri
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
