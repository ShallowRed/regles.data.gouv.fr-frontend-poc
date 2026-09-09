// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2026-05-21',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  srcDir: 'app/',
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
  components: [
    { path: '~/components', pathPrefix: false },
  ],
  css: [
    '@gouvfr/dsfr/dist/dsfr.main.min.css',
    '@gouvfr/dsfr/dist/utility/utility.main.min.css',
    '~/assets/css/main.css',
  ],
  app: {
    // GitHub Pages serves project sites under /<repo>/, configurable via env.
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
      ],
    },
  },
  i18n: {
    defaultLocale: 'fr',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
      { code: 'en', language: 'en-GB', name: 'English', file: 'en.json' },
    ],
    // The locale comes from the URL alone. The site is static and serves as a demo:
    // a browser-driven redirect would move visitors off the link they opened.
    detectBrowserLanguage: false,
  },
  imports: {
    dirs: ['mocks'],
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      // Unlisted page: no link points to it, so the crawler cannot reach it.
      routes: ['/mvp/api-service'],
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
})
