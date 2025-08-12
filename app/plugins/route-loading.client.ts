export default defineNuxtPlugin((nuxtApp) => {
    const isRouteLoading = useState('isRouteLoading', () => false)

    nuxtApp.hook('page:start', () => {
        isRouteLoading.value = true
        // Опционально: визуально меняем курсор и блокируем клики через класс на <html>
        document.documentElement.classList.add('route-loading')
    })

    nuxtApp.hook('page:finish', () => {
        isRouteLoading.value = false
        document.documentElement.classList.remove('route-loading')
    })
})
