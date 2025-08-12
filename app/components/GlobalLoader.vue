<template>
  <transition name="fade" mode="out-in">
    <div
        v-if="show"
        class="fixed inset-0 z-[9999] flex items-center justify-center
             backdrop-blur-md bg-white/40 dark:bg-black/40"
        aria-live="polite"
        aria-busy="true"
        role="status"
    >
      <div class="flex flex-col items-center gap-3">
        <!-- Спиннер -->
        <span class="inline-block w-12 h-12 animate-spin rounded-full
                     border-[3px] border-current
                     border-r-transparent text-[#f52216]" />
        <p class="text-sm opacity-80">Загружаем…</p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
const show = useState<boolean>('isRouteLoading')
</script>

<style scoped>
.fade-enter-active,.fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from,.fade-leave-to { opacity: 0; }
</style>
