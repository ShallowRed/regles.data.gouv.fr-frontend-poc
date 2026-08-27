<script setup lang="ts">
const home = '/mvp'

const nav = [
  { label: 'Catalogue', to: '/mvp/regles/' },
  { label: 'Référencer ses règles', to: '/mvp/comprendre/referencer-une-regle' },
  { label: 'Vérifier une règle', to: '/mvp/comprendre/verifier-une-regle' },
  { label: 'Réutiliser une règle', to: '/mvp/comprendre/reutiliser-une-regle' },
]
</script>

<template>
  <header
    role="banner"
    class="fr-header"
  >
    <div class="fr-header__body">
      <div class="fr-container">
        <div class="fr-header__body-row">
          <div class="fr-header__brand fr-enlarge-link">
            <div class="fr-header__brand-top">
              <div class="fr-header__logo">
                <p class="fr-logo">
                  République<br>française
                </p>
              </div>
            </div>
            <div class="fr-header__service">
              <NuxtLink
                :to="home"
                title="Accueil | Catalogue des règles publiques"
              >
                <p class="fr-header__service-title flex items-baseline gap-0">
                  <span class="fr-text--alt font-medium italic">
                    règles
                  </span>
                  <span class="ml-0.5">
                    .data.gouv
                  </span>
                  <span class="fr-text--alt font-medium italic">
                    .fr
                  </span>
                </p>
              </NuxtLink>
              <p class="fr-header__service-tagline">
                Règles publiques modélisées, ouvertes et réutilisables
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="fr-header__menu">
      <div class="fr-container">
        <nav
          class="fr-nav"
          role="navigation"
          aria-label="Menu principal"
        >
          <ul class="fr-nav__list">
            <li
              v-for="item in nav"
              :key="item.to"
              class="fr-nav__item"
            >
              <NuxtLink
                :to="item.to"
                class="fr-nav__link"
                exact-active-class="fr-nav__link--active"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>
</template>
