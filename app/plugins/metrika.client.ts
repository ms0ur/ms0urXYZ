// plugins/metrika.client.ts
export default defineNuxtPlugin((nuxtApp) => {
    const METRIKA_ID = 103744142 // ваш ID

    // 0) Подготовка dataLayer (для ecommerce и/или унификации событий)
    window.dataLayer = window.dataLayer || []

    // 1) Не дублируем инициализацию
    if (window.ym && window.__ym_inited) {
        return
    }

    // 2) Грузим официальный tag.js (типобезопасно)
    const existing = Array.from(document.scripts).some(
        (s) => s.src.startsWith('https://mc.yandex.ru/metrika/tag.js')
    )
    if (!existing) {
        const s = document.createElement('script')
        s.async = true
        s.src = 'https://mc.yandex.ru/metrika/tag.js'
        const first = document.getElementsByTagName('script')[0]
        first?.parentNode?.insertBefore(s, first)
    }

    // 3) Создаём shim ym до загрузки скрипта (как в официальном сниппете)
    if (!window.ym) {
        const q: any[] = []
        const shim = (...args: any[]) => { q.push(args) }
        // @ts-expect-error присваиваем shim временно, до загрузки tag.js
        window.ym = shim as typeof window.ym
        // отметим «время инициализации» корректно
        // (в оригинале m[i].l = 1 * new Date(), что триггерит TS warning — используем Date.now())
        ;(window.ym as any).l = Date.now()
        // когда tag.js поднимет реальную ym, очередь будет считана самим скриптом
        // (поведение соответствует официальному коду тега)
    }

    // 4) Инициализация счётчика для SPA (важно: defer: true)
    window.ym!(METRIKA_ID, 'init', {
        defer: true,              // SPA: отключаем авто pageview, шлём hit вручную
        webvisor: true,
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        ecommerce: 'dataLayer'
    })
    window.__ym_inited = true

    // 5) Функция отправки page hit
    const sendHit = () => {
        const url = location.pathname + location.search + location.hash
        const ref = document.referrer || undefined
        window.ym!(METRIKA_ID, 'hit', url, {
            referer: ref,
            title: document.title
        })
    }

    // 6) Первый hit после монтирования приложения (initial client load)
    //    (page:finish триггерится только на последующих навигациях)
    //    https://github.com/nuxt/nuxt/issues/20681
    nuxtApp.hook('app:mounted', () => {
        sendHit()
    })

    // 7) hit на каждый переход страницы (после завершения навигации)
    //    Nuxt runtime hook page:finish
    nuxtApp.hook('page:finish', () => {
        sendHit()
    })
})
