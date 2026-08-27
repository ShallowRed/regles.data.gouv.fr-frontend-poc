<script setup lang="ts">
useHead({ title: 'Référencer ses règles | Catalogue des règles publiques' })

const { withBaseURL } = useBaseUrl()

/* --- Le parcours de référencement, en quatre temps --- */
const steps = [
  { num: '1', label: 'Vous décrivez la règle', desc: 'Intitulé, base légale, organisme producteur, domaine. Le minimum pour la rendre découvrable.' },
  { num: '2', label: 'Vous reliez les textes', desc: 'Les articles de loi, décrets ou conventions qui la fondent, liés à leur source Légifrance.' },
  { num: '3', label: 'Vous publiez ce que vous pouvez', desc: 'Du simple référencement à la modélisation exécutable : chaque niveau apporte sa valeur, à votre rythme.' },
  { num: '4', label: 'La règle est qualifiée', desc: 'Sa fiche signale ce qu\'elle offre - découverte, traçabilité, calcul - selon les preuves apportées.' },
]

/* --- Ce que le producteur garde vs. ce que le catalogue ajoute --- */
const ownership = [
  {
    icon: 'fr-icon-lock-line',
    title: 'Vous restez responsable',
    body: 'Le contenu de la règle, son exactitude et sa publication relèvent de votre administration. Le catalogue ne réinterprète rien.',
  },
  {
    icon: 'fr-icon-git-branch-line',
    title: 'Vous gardez la main',
    body: 'Vous publiez les versions à votre cadence, à chaque évolution réglementaire. L\'historique reste le vôtre.',
  },
  {
    icon: 'fr-icon-eye-line',
    title: 'Le catalogue rend visible',
    body: 'Découvrabilité, traçabilité jusqu\'au texte et réutilisation par d\'autres services : c\'est ce que le référencement ajoute.',
  },
]

/* --- Niveaux de référencement : du minimum à l'exécutable --- */
const levels = [
  {
    tag: 'Référencer',
    title: 'La règle existe et se trouve',
    body: 'Métadonnées et bases légales. La règle devient découvrable dans le catalogue et reliée à ses textes.',
    requirement: 'Accessible à toute administration, sans prérequis technique.',
  },
  {
    tag: 'Documenter',
    title: 'La règle s\'explique',
    body: 'La logique métier est décrite, éventuellement accompagnée de cas de test. La fiche gagne en traçabilité.',
    requirement: 'Demande de formaliser le barème ou les conditions, sans modèle exécutable obligatoire.',
  },
  {
    tag: 'Exécuter',
    title: 'La règle se calcule',
    body: 'La modélisation (Publicodes, OpenFisca, Catala ou moteur propriétaire) permet un calcul, exposé via API ou simulateur.',
    requirement: 'Suppose un moteur de calcul et une équipe pour le maintenir.',
  },
]

/* --- À qui s'adresse le référencement --- */
const audiences = [
  {
    pictogram: withBaseURL('/pictograms/city-hall.svg'),
    title: 'Administrations d\'État',
    body: 'CNAF, DGFiP, France Travail… Référencez les prestations et impôts que vous calculez pour les rendre traçables et réutilisables.',
    examples: ['prestations sociales', 'fiscalité', 'allocations'],
  },
  {
    pictogram: withBaseURL('/pictograms/justice.svg'),
    title: 'Collectivités territoriales',
    body: 'Régions, départements, métropoles, communes : vos aides locales gagnent en visibilité et en lisibilité aux côtés des dispositifs nationaux.',
    examples: ['tarifs solidaires', 'aides à la mobilité', 'subventions'],
  },
  {
    pictogram: withBaseURL('/pictograms/contract.svg'),
    title: 'Opérateurs et caisses',
    body: 'Organismes de sécurité sociale et opérateurs publics : exposez vos règles une fois, au lieu de les voir réinterprétées service par service.',
    examples: ['caisses de retraite', 'opérateurs', 'agences'],
  },
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
              { to: null, label: 'Référencer ses règles' },
            ]"
          />
          <header class="space-y-3 max-w-3xl">
            <h1 class="fr-h2 m-0">
              Publiez vos règles, gardez-en la maîtrise
            </h1>
            <p class="fr-text--lead text-gray-700 m-0">
              Votre administration applique des règles de calcul. Les référencer dans le
              catalogue les rend découvrables, traçables et réutilisables par les autres
              services publics.
            </p>
          </header>
        </div>
      </div>
    </BrandBackgroundContainer>

    <!-- ============ PARCOURS + NIVEAUX (bande rythmée) ============ -->
    <BrandBackgroundContainer
      variant="subtle"
      class="full-bleed border-b border-[#e3e3fd]"
    >
      <div class="fr-container py-12 md:py-16 space-y-12 md:space-y-16">
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
              Comment se passe un référencement
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              Le référencement commence par une fiche minimale, enrichie ensuite selon
              ce que vous pouvez publier.
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

        <!-- Niveaux de référencement -->
        <section
          aria-labelledby="niveaux"
          class="space-y-8"
        >
          <div class="max-w-3xl space-y-2">
            <h2
              id="niveaux"
              class="fr-h3 m-0"
            >
              Jusqu'où vous voulez aller
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              Une règle apporte déjà de la valeur dès qu'elle est référencée. Documenter puis
              rendre exécutable sont des étapes facultatives, franchies quand vous êtes prêts.
            </p>
          </div>

          <ol class="grid grid-cols-1 md:grid-cols-3 gap-6 list-none p-0 m-0">
            <li
              v-for="(level, i) in levels"
              :key="level.tag"
              class="flex flex-col rounded-lg border border-gray-200 bg-white p-6 space-y-3"
            >
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#f5f5fe] text-[#000091] fr-text--xs mb-0 font-bold tabular-nums">
                  {{ i + 1 }}
                </span>
                <span class="fr-badge fr-badge--sm fr-badge--blue-cumulus fr-badge--no-icon">{{ level.tag }}</span>
              </div>
              <h3 class="fr-h6 m-0">
                {{ level.title }}
              </h3>
              <p class="fr-text--sm text-gray-700 m-0">
                {{ level.body }}
              </p>
              <p class="fr-text--xs text-gray-600 m-0 pt-2 mt-auto border-t border-gray-100 flex items-start gap-1.5">
                <span
                  class="fr-icon-information-line fr-icon--xs text-[#000091] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{{ level.requirement }}</span>
              </p>
            </li>
          </ol>
        </section>

        <!-- Propriété préservée -->
        <section
          aria-labelledby="propriete"
          class="space-y-8"
        >
          <div class="max-w-3xl space-y-2">
            <h2
              id="propriete"
              class="fr-h3 m-0"
            >
              Ce que vous gardez, ce que le catalogue ajoute
            </h2>
            <p class="fr-text--lg text-gray-700 m-0">
              L'administration productrice reste maîtresse de sa règle&nbsp;;
              le catalogue l'expose.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              v-for="o in ownership"
              :key="o.title"
              class="rounded-lg border border-gray-200 bg-white p-6 space-y-3"
            >
              <span
                :class="o.icon"
                class="fr-icon--lg text-[#000091]"
                aria-hidden="true"
              />
              <h3 class="fr-h6 m-0">
                {{ o.title }}
              </h3>
              <p class="fr-text--sm text-gray-700 m-0">
                {{ o.body }}
              </p>
            </div>
          </div>
        </section>
      </div>
    </BrandBackgroundContainer>

    <!-- ============ À QUI ÇA S'ADRESSE (fond blanc) ============ -->
    <section
      aria-labelledby="audiences"
      class="fr-container py-12 md:py-16 space-y-8"
    >
      <div class="max-w-3xl space-y-2">
        <h2
          id="audiences"
          class="fr-h3 m-0"
        >
          Qui peut référencer
        </h2>
        <p class="fr-text--lg text-gray-700 m-0">
          Toute administration ou organisme qui produit des règles de calcul opposables aux
          usagers peut les référencer.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="a in audiences"
          :key="a.title"
          class="rounded-lg border border-gray-200 bg-white p-6 space-y-3"
        >
          <img
            :src="a.pictogram"
            alt=""
            width="64"
            height="64"
          >
          <h3 class="fr-h6 m-0">
            {{ a.title }}
          </h3>
          <p class="fr-text--sm text-gray-700 m-0">
            {{ a.body }}
          </p>
          <ul class="flex flex-wrap gap-1.5 list-none p-0 m-0 pt-1">
            <li
              v-for="ex in a.examples"
              :key="ex"
              class="fr-tag fr-tag--sm"
            >
              {{ ex }}
            </li>
          </ul>
        </div>
      </div>

      <p class="fr-text--sm text-gray-600 max-w-2xl m-0">
        Le référencement se fait aujourd'hui de façon accompagnée&nbsp;: l'équipe du catalogue
        cadre avec vous le périmètre, la base légale et le niveau de publication visé. Un
        espace d'administration en libre-service est en préfiguration.
      </p>
    </section>

    <!-- ============ APPEL À RÉFÉRENCER ============ -->
    <BrandBackgroundContainer
      variant="contrast"
      class="full-bleed"
    >
      <div class="fr-container py-12 md:py-14">
        <div class="max-w-2xl space-y-3">
          <h2 class="fr-h4 m-0 text-white">
            Vous appliquez des règles de calcul ?
          </h2>
          <p class="fr-text--sm mb-0 text-white/90 m-0">
            Parlons de leur référencement&nbsp;: l'équipe du catalogue vous accompagne,
            de la fiche minimale à la règle exécutable.
          </p>
          <div class="flex flex-wrap gap-3 pt-2">
            <a
              href="mailto:catalogue-regles@beta.gouv.fr"
              class="fr-btn btn-on-dark--solid"
            >
              Référencer vos règles
            </a>
            <NuxtLink
              to="/mvp/regles/"
              class="fr-btn fr-btn--secondary btn-on-dark--ghost"
            >
              Voir les règles déjà référencées
            </NuxtLink>
          </div>
        </div>
      </div>
    </BrandBackgroundContainer>
  </div>
</template>
