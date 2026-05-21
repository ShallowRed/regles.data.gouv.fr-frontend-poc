<template>
  <footer
    class="fr-footer"
    role="contentinfo"
  >
    <div class="fr-container">
      <div class="fr-footer__body">
        <div class="fr-footer__brand fr-enlarge-link">
          <NuxtLink
            to="/mvp"
            title="Retour à l'accueil du Catalogue des règles publiques"
          >
            <p class="fr-logo">
              République<br>française
            </p>
          </NuxtLink>
        </div>
        <div class="fr-footer__content">
          <p class="fr-footer__content-desc">
            Le catalogue des règles publiques référence les modélisations informatiques
            des règles de droit produites par les administrations françaises, pour les
            rendre lisibles, traçables et réutilisables.
          </p>
          <ul class="fr-footer__content-list">
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://www.data.gouv.fr"
                target="_blank"
                rel="noopener"
              >data.gouv.fr</a>
            </li>
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://www.legifrance.gouv.fr"
                target="_blank"
                rel="noopener"
              >legifrance.gouv.fr</a>
            </li>
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                href="https://www.systeme-de-design.gouv.fr"
                target="_blank"
                rel="noopener"
              >systeme-de-design.gouv.fr</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="fr-footer__bottom">
        <ul class="fr-footer__bottom-list">
          <li class="fr-footer__bottom-item">
            <span class="fr-footer__bottom-link">Accessibilité : non conforme</span>
          </li>
          <li class="fr-footer__bottom-item">
            <span class="fr-footer__bottom-link">Mentions légales</span>
          </li>
          <li class="fr-footer__bottom-item">
            <span class="fr-footer__bottom-link">Données personnelles</span>
          </li>
          <li class="fr-footer__bottom-item">
            <NuxtLink
              to="/a-propos"
              class="fr-footer__bottom-link"
            >
              À propos de cette préfiguration
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>
