// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default <Config>{
    darkMode: 'class', // ключевой момент
    content: [
        './app.vue',
        './components/**/*.{vue,js,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
    ],
    theme: { extend: {} },
    plugins: []
}
