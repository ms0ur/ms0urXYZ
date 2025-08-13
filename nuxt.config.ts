// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },





  plugins: [
    '~/plugins/route-loading.client.ts',
  ],

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    '@tresjs/nuxt',
    '@nuxtjs/color-mode',
    'nuxt-og-image',
    '@nuxtjs/seo',
    'nuxt-gtag'
  ],

  site: {
    url: 'https://ms0ur.space', // важно для canonical/sitemap
    name: 'ms0ur — фронтенд/фулстек разработчик',
    indexable: true
  },

  sitemap: {
    autoLastmod: true,
    defaults: { changefreq: 'weekly', priority: 0.7 }
  },

  robots: {
    blockAiBots: true,
    blockNonSeoBots: true,
  },

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'ru',
    baseUrl: 'https://ms0ur.space',
    locales: [
      {
        code: 'ru',
        language: 'ru_RU',
        name: 'Русский',
        file: 'ru-RU.json'
      },
      // {
      //   code: 'en',
      //   language: 'en-US',
      //   name: 'English',
      //   file: 'en-US.json'
      // }
    ]
  },
  colorMode: {
    preference: 'system',   // стартовая тема: 'system' | 'dark' | 'light'
    fallback: 'dark',      // если не определится
    classSuffix: '',        // важно: пусто, чтобы использовать именно 'dark'
    storageKey: 'theme'     // под это имя сохранится выбор (localStorage)
  },
  nitro: {
    routeRules: {
      '/icons/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/**/*.webp': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } }
    }
  },
  gtag: {
    id: 'G-BTBCYZRN97',
  }
})