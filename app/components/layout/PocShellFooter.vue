<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
  <footer
    class="fr-footer"
    role="contentinfo"
  >
    <div class="fr-container">
      <div class="fr-footer__body">
        <div class="fr-footer__brand fr-enlarge-link">
          <NuxtLink
            :to="localePath('/mvp')"
            :title="$t('site.footerHomeTitle')"
          >
            <p class="fr-logo">
              République<br>française
            </p>
          </NuxtLink>
        </div>
        <div class="fr-footer__content">
          <p class="fr-footer__content-desc">
            {{ $t('footer.description') }}
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
            <span class="fr-footer__bottom-link">{{ $t('footer.accessibility') }}</span>
          </li>
          <li class="fr-footer__bottom-item">
            <span class="fr-footer__bottom-link">{{ $t('footer.legalNotice') }}</span>
          </li>
          <li class="fr-footer__bottom-item">
            <span class="fr-footer__bottom-link">{{ $t('footer.personalData') }}</span>
          </li>
          <li class="fr-footer__bottom-item">
            <NuxtLink
              :to="localePath('/a-propos')"
              class="fr-footer__bottom-link"
            >
              {{ $t('footer.about') }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>
