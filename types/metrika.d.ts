// types/metrika.d.ts
export {}

declare global {
    interface Window {
        ym?: (...args: any[]) => void
        dataLayer?: any[]
        __ym_inited?: boolean
    }
}
