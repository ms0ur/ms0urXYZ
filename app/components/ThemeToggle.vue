<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

/**
 * Tailwind dark mode: класс 'dark' на <html>.
 * Сохраняем выбор в localStorage: 'dark' | 'light'.
 */

const isDark = ref(false)

function applyTheme(v: boolean) {
  document.documentElement.classList.toggle('dark-mode', v)
}

function toggle() {
  isDark.value = !isDark.value
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark-mode' || saved === 'light-mode') {
    isDark.value = saved === 'dark-mode'
  } else {
    isDark.value = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  }
  applyTheme(isDark.value)
})

watch(isDark, (v) => {
  applyTheme(v)
  localStorage.setItem('theme', v ? 'dark-mode' : 'light-mode')
})
</script>

<template>
  <!-- Кнопка-тумблер. Позиционируется СНАРУЖИ через классы/стили. -->
  <button
      @click="toggle"
      class="relative inline-flex w-20 h-10 p-1 rounded-full overflow-hidden
           ring-1 ring-black/10 dark:ring-white/10 backdrop-blur-md
           focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
           transition-shadow select-none"
      role="switch"
      :aria-checked="isDark"
      aria-label="Переключить тему"
  >
    <!-- Светлый фон -->
    <div
        class="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        :class="isDark ? 'opacity-0' : 'opacity-100'"
    >
      <div class="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,#ffffff_0%,#f1f5f9_45%,#e2e8f0_100%)]"></div>
      <div class="absolute -left-4 -top-6 w-24 h-24 rounded-full bg-white/60 blur-xl animate-pulse-slow"></div>
    </div>

    <!-- Тёмный фон -->
    <div
        class="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        :class="isDark ? 'opacity-100' : 'opacity-0'"
    >
      <div class="absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_100%,#0b0c0f_0%,#0f1115_45%,#12141a_100%)]"></div>
      <div class="absolute -right-4 -bottom-6 w-24 h-24 rounded-full bg-cyan-400/10 blur-2xl animate-pulse-slow"></div>
    </div>

    <!-- Бегунок -->
    <span
        class="absolute left-1 top-1 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full
             shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)] ring-1 ring-black/10 dark:ring-white/10
             transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)]
             bg-white/90 dark:bg-white/10 backdrop-blur"
        :style="{ transform: isDark ? 'translateX(40px)' : 'translateX(0px)' }"
    >
      <span class="absolute transition-opacity duration-200" :class="isDark ? 'opacity-0' : 'opacity-100'">🌙</span>
      <span class="absolute transition-opacity duration-200" :class="isDark ? 'opacity-100' : 'opacity-0'">☀️</span>
    </span>

    <!-- (опционально) gooey-фильтр -->
    <svg class="absolute w-0 h-0">
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix in="blur" mode="matrix"
                         values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 18 -7" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
  </button>
</template>

<style>
@keyframes pulse-slow {
  0%, 100% { transform: scale(1); opacity: .7; }
  50% { transform: scale(1.05); opacity: 1; }
}
.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}
</style>
