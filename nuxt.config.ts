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
  modules: ['@nuxtjs/tailwindcss'],
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
      title: 'Catalogue des règles publiques',
      htmlAttrs: { lang: 'fr' },
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
      ],
    },
  },
  imports: {
    dirs: ['mocks'],
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
})
