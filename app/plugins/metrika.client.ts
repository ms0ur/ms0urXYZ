// plugins/metrika.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  // === 0) БАЗА ===
  const METRIKA_ID = 103744142 as const

  // dataLayer для ecommerce
  // (Метрика использует "ecommerce: 'dataLayer'" — см. офиц. пример) 
  // https://stackoverflow.com/questions/75421131/how-to-use-yandex-metrica-ecommerce-layer-with-react
  ;(window as any).dataLayer = (window as any).dataLayer || []

  // Не дублируем инициализацию
  if ((window as any).__ym_inited) return

  // === 1) Правильный shim (как в официальном сниппете) ===
  // КРИТИЧНО: очередь должна лежать в window.ym.a, иначе tag.js её не считает.
  type YMFn = ((...args: any[]) => void) & { a?: any[]; l?: number }
  const w = window as any as { ym?: YMFn; __ym_inited?: boolean }

  if (!w.ym) {
    const ymShim: YMFn = function (...args: any[]) {
      // очередь должна быть именно на ym.a
      ;(ymShim.a = ymShim.a || []).push(args)
    } as YMFn
    ymShim.l = Date.now()
    w.ym = ymShim
  }

  // === 2) Грузим tag.js один раз ===
  const alreadyHasTag = Array.from(document.scripts).some((s) =>
    s.src.startsWith('https://mc.yandex.ru/metrika/tag.js')
  )
  if (!alreadyHasTag) {
    const s = document.createElement('script')
    s.async = true
    // Можно без ?id=..., т.к. ID передаём в ym(...,'init',...)
    s.src = 'https://mc.yandex.ru/metrika/tag.js'
    const first = document.getElementsByTagName('script')[0]
    first?.parentNode?.insertBefore(s, first)
  }

  // === 3) Инициализация счётчика ===
  // Для SPA ставим defer:true — отключаем авто-pageview и шлём hit вручную.
  // Поддержка опции defer подтверждается практикой и либами (react-yandex-metrika).
  // https://www.npmjs.com/package/@appigram/react-yandex-metrika
  w.ym!(METRIKA_ID, 'init', {
    defer: true,
    webvisor: true,
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    ecommerce: 'dataLayer',
  })

  w.__ym_inited = true

  // === 4) Функция отправки page hit ===
  const sendHit = () => {
    const url = location.pathname + location.search + location.hash
    const referer = document.referrer || undefined
    const title = document.title || undefined
    // Сигнатура: ym(ID, 'hit', url, { title, referer })
    // Подтверждение синтаксиса 'hit' с url/title/referer:
    // клуб Метрики и интеграционные доки
    // https://yandex.ru/blog/metrika-club/vopros-pro-metod-hit
    // https://www.rudderstack.com/docs/destinations/streaming-destinations/yandex-metrica/
    w.ym!(METRIKA_ID, 'hit', url, { title, referer })
  }

  // === 5) Первый хит после монтирования приложения ===
  // Nuxt-хуки: https://nuxt.com/docs/api/advanced/hooks
  nuxtApp.hook('app:mounted', () => {
    sendHit()
  })

  // === 6) Хит на каждую навигацию (после завершения) ===
  // page:finish — клиентский рантайм-хук Nuxt, срабатывает после рендера страницы
  // Дискуссия и подтверждение: https://github.com/nuxt/nuxt/issues/21721
  nuxtApp.hook('page:finish', () => {
    sendHit()
  })
})
