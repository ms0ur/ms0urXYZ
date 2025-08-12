<!-- components/FooterNav.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isTaxInfoOpen = ref(false)

const openTaxInfo = () => { isTaxInfoOpen.value = true }
const closeTaxInfo = () => { isTaxInfoOpen.value = false }

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeTaxInfo()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <footer
      class="w-full border-t border-neutral-200/70 dark:border-neutral-800
           bg-neutral-50 dark:bg-neutral-950"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <!-- Верхняя часть: акцентные кнопки (единый цвет #f52216) -->
      <nav aria-label="Основная навигация футера">
        <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <li>
            <NuxtLink
                to="/#contact"
                class="inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-center text-base font-semibold
                     bg-[#f52216]/90 text-white shadow-sm ring-1 ring-transparent transition
                     hover:bg-[#f52216] hover:shadow-md focus:outline-none
                     focus-visible:ring-2 focus-visible:ring-[#f52216]"
            >
              Связаться со мной
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
                to="/#pricing"
                class="inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-center text-base font-semibold
                     bg-[#f52216]/90 text-white shadow-sm ring-1 ring-transparent transition
                     hover:bg-[#f52216] hover:shadow-md focus:outline-none
                     focus-visible:ring-2 focus-visible:ring-[#f52216]"
            >
              Тарифы на разработку и цены
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
                to="/#about"
                class="inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-center text-base font-semibold
                     bg-[#f52216]/90 text-white shadow-sm ring-1 ring-transparent transition
                     hover:bg-[#f52216] hover:shadow-md focus:outline-none
                     focus-visible:ring-2 focus-visible:ring-[#f52216]"
            >
              Стек и подход
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
                to="/#portfolio"
                class="inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-center text-base font-semibold
                     bg-[#f52216]/90 text-white shadow-sm ring-1 ring-transparent transition
                     hover:bg-[#f52216] hover:shadow-md focus:outline-none
                     focus-visible:ring-2 focus-visible:ring-[#f52216]"
            >
              Реализованные проекты
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Разделитель -->
      <div class="mt-8 mb-6 h-px bg-neutral-200/70 dark:bg-neutral-800"></div>

      <!-- Нижняя часть: доп. кнопки + копирайт -->
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-wrap items-center gap-3">
          <button
              type="button"
              @click="openTaxInfo"
              class="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium
                   border border-neutral-300/70 dark:border-neutral-700
                   text-neutral-800 dark:text-neutral-100
                   hover:bg-neutral-100/70 dark:hover:bg-neutral-900
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f52216]"
              aria-haspopup="dialog"
              :aria-expanded="isTaxInfoOpen ? 'true' : 'false'"
          >
            Информация о самозанятом
          </button>

          <a
              href="/dogovorExample.pdf"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium
                   border border-neutral-300/70 dark:border-neutral-700
                   text-neutral-800 dark:text-neutral-100
                   hover:bg-neutral-100/70 dark:hover:bg-neutral-900
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f52216]"
          >
            Пример договора (PDF)
          </a>
        </div>

        <p class="text-xs text-neutral-600 dark:text-neutral-400">
          © {{ new Date().getFullYear() }}. Все права защищены.
        </p>
      </div>
    </div>

    <!-- Модалка (через Teleport в <body>, чтобы центрировалась по экрану) -->
    <Teleport to="body">
      <transition
          enter-active-class="transition ease-out duration-150"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition ease-in duration-100"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
      >
        <div
            v-if="isTaxInfoOpen"
            class="fixed inset-0 z-[1000] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tax-info-title"
            @click.self="closeTaxInfo"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

          <div
              class="relative z-10 w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800
                   bg-white dark:bg-neutral-900 p-6 shadow-2xl"
          >
            <div class="flex items-start justify-between gap-4">
              <h3 id="tax-info-title" class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Информация о самозанятом
              </h3>
              <button
                  type="button"
                  @click="closeTaxInfo"
                  class="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:text-neutral-400"
                  aria-label="Закрыть"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                     fill="currentColor" class="h-5 w-5">
                  <path fill-rule="evenodd"
                        d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                        clip-rule="evenodd" />
                </svg>
              </button>
            </div>

            <div class="mt-4 space-y-3 text-sm">
              <div class="rounded-lg bg-neutral-50 dark:bg-neutral-800 p-4 border border-neutral-200 dark:border-neutral-700">
                <p class="text-neutral-700 dark:text-neutral-200">
                  <span class="font-medium">ФИО:</span> - Суслов Максим Никитич
                </p>
                <p class="text-neutral-700 dark:text-neutral-200">
                  <span class="font-medium">ИНН:</span> - 772881868769
                </p>
              </div>
              <p class="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                Исполнитель зарегистрирован в ФНС в качестве налогоплательщика налога на профессиональный доход
                в соответствии с Федеральным законом от 27.11.2018 № 422-ФЗ.
              </p>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                  type="button"
                  @click="closeTaxInfo"
                  class="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium
                       border border-neutral-300/70 dark:border-neutral-700
                       text-neutral-800 dark:text-neutral-100
                       hover:bg-neutral-100/70 dark:hover:bg-neutral-800
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f52216]"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </footer>
</template>
