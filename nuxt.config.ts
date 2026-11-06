// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  extends: ['@datagouv/regles-site-gouv-fr'],
  records: { dir: '.registry' },
  pages: { pattern: ['**/*.vue'] },
  runtimeConfig: { public: { datapiUrl: 'http://localhost:8010' } },
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
      routes: ['/mvp/api-service', '/essayer/civique-droit-vote', '/essayer/prestagri-quotient-familial', '/essayer/openfisca-france-pass-culture'],
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
})
