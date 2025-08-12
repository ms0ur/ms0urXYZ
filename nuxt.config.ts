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
    '@nuxtjs/robots',
    '@tresjs/nuxt',
    '@nuxtjs/color-mode'
  ],

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
  }

})