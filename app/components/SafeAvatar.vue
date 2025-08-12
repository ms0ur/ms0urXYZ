<script setup lang="ts">
// Получаем краткоживущий URL (см. server/api/avatar-url.get.ts из прошлого ответа)
const { data } = await useFetch<{ url: string }>('/api/avatar-url', { method: 'GET' })
const avatarUrl = computed(() => data.value?.url || '')

const container = ref<HTMLElement | null>(null)

// Блокируем перетаскивание (в том числе как файла) и копирование внутри контейнера
function preventDrag(e: DragEvent) { e.preventDefault() }
function preventContext(e: MouseEvent) { e.preventDefault() }

onMounted(() => {
  const el = container.value
  if (!el) return

  // Локальный перехват копирования: если фокус/selection внутри контейнера — отменяем
  const onCopy = (e: ClipboardEvent) => {
    // Проверяем, что событие пришло из нашего блока
    if (!el.contains(document.activeElement)) {
      // Дополнительно проверяем выделение
      const sel = window.getSelection?.()
      if (!sel || sel.rangeCount === 0) return
      const range = sel.getRangeAt(0)
      if (!el.contains(range.commonAncestorContainer as Node)) return
    }
    e.preventDefault() // гасим копирование внутри аватар-блока
  }

  el.addEventListener('copy', onCopy as EventListener, { capture: true })
  // Подстрахуемся на документе (некоторые браузеры не "бабблят" из img)
  document.addEventListener('copy', onCopy as EventListener, { capture: true })

  onBeforeUnmount(() => {
    el.removeEventListener('copy', onCopy as EventListener, { capture: true } as any)
    document.removeEventListener('copy', onCopy as EventListener, { capture: true } as any)
  })
})
</script>

<template>
  <div
      ref="container"
      class="hidden md:flex justify-center select-none"
      @contextmenu="preventContext"
      @dragstart="preventDrag"
  >
    <div
        class="rounded-2xl p-5 lg:p-6
             bg-white/40 dark:bg-white/10
             backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/10
             shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)]"
    >
      <div class="relative no-select no-drag">
        <!-- Прозрачная крышка: перехватывает клики/выделение/дрэг -->
        <div
            class="absolute inset-0 z-10"
            aria-hidden="true"
            style="pointer-events:auto"
            @mousedown.prevent
            @mousemove.prevent
            @mouseup.prevent
            @touchstart.prevent
            @touchmove.prevent
            @touchend.prevent
        />
        <!-- Важно: не <NuxtImg>, а приватный URL -->
        <img
            :src="avatarUrl"
            alt="Аватар разработчика"
            class="w-52 h-52 lg:w-72 lg:h-72 object-cover rounded-full border-4
                 border-white/50 dark:border-white/20 shadow-xl
                 transition-transform duration-300 hover:scale-[1.02]"
            loading="eager"
            decoding="async"
            draggable="false"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 1) Запрет выделения текста/узлов внутри контейнера (в т.ч. в Safari) */
.no-select, .no-select * {
  user-select: none;            /* MDN: запрет выделения */            /* :contentReference[oaicite:1]{index=1} */
  -webkit-user-select: none;
}

/* 2) Запрет "перетаскивания" картинки мышью (Chrome/Safari) */
.no-drag img {
  -webkit-user-drag: none;      /* MDN: drag & drop / user-drag */     /* :contentReference[oaicite:2]{index=2} */
}

/* 3) Кастом выделение на всякий случай (если где-то промажет) */
::selection {
  background: transparent;       /* делает «выделение» невидимым */     /* :contentReference[oaicite:3]{index=3} */
}

/* 4) Бонус: если захочешь отключить любые ховеры/клики у самого <img>,
   можно включить это — но тогда не будет и эффектов наведения.
   .no-drag img { pointer-events: none; }
   (MDN по pointer-events)                                               */
/* :contentReference[oaicite:4]{index=4} */
</style>
