<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'

type Tag = { name: string; color: string }
type Tech = { name: string; icon: string; color: string }
type Project = {
  id: string
  slug: string
  title: string
  shortDescription: string
  fullDescription: string
  tags: Tag[]
  images: string[]
  tech: Tech[]
  featured: boolean
  links?: { demo?: string; repo?: string; repo2?: string }
  createdAt?: string
  updatedAt?: string
  status?: 'done' | 'wip' | 'archived'
}

const route = useRoute()
const slug = route.params.slug as string

const { data: project, pending, error } = await useAsyncData<Project>(() => $fetch(`/api/projects/${slug}`))

useHead(() => ({
  title: project.value?.title ? `${project.value.title} — Проект` : 'Проект',
  meta: [{ name: 'description', content: project.value?.shortDescription ?? '' }]
}))

const goToTag = (name: string) => {
  navigateTo(`/projects?tags=${encodeURIComponent(name)}`)
}

/** Галерея: индекс текущего изображения */
const currentIndex = ref(0)

/** Удобные вычислимые геттеры для массива изображений и текущего */
const images = computed<string[]>(() => project.value?.images ?? [])
const currentImage = computed<string | null>(() => images.value.length ? images.value[currentIndex.value] : null)

/** При смене проекта/списка изображений — валидируем индекс */
watch(images, (arr) => {
  if (!arr.length) {
    currentIndex.value = 0
  } else if (currentIndex.value > arr.length - 1) {
    currentIndex.value = 0
  }
})

/** Выбор изображения по клику на миниатюру */
const selectImage = (i: number) => {
  if (i >= 0 && i < images.value.length) currentIndex.value = i
}
</script>

<template>
  <div class="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 min-h-screen">
    <section class="container mx-auto px-4 sm:px-6 lg:px-12 py-12">
      <!-- Верхняя навигация -->
      <div class="flex justify-between items-center mb-6 gap-3">
        <NuxtLink
            to="/projects"
            class="px-4 py-2 rounded-lg ring-1 ring-black/10 dark:ring-white/10 transition
                 hover:bg-black/10 dark:hover:bg-white/15
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f52216]/60"
        >
          ← Назад
        </NuxtLink>
        <NuxtLink
            to="/#contact"
            class="px-4 py-2 rounded-lg bg-[#f52216] text-white transition
                 hover:bg-[#d41812] active:bg-[#b3140f]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f52216]/60"
        >
          Хочу что-то похожее
        </NuxtLink>
      </div>

      <div v-if="pending" class="py-10">Загружаю…</div>
      <div v-else-if="error || !project" class="py-10 text-red-500">Проект не найден.</div>

      <div v-else>
        <!-- Заголовок -->
        <h1 class="text-3xl sm:text-4xl font-bold mb-3">{{ project.title }}</h1>
        <p class="text-base sm:text-lg opacity-80 mb-6">{{ project.shortDescription }}</p>

        <!-- Изображения -->
        <div v-if="images.length" class="mb-8">
          <!-- Большое изображение (выбранное) -->
          <img
              v-if="currentImage"
              :src="currentImage"
              :alt="project.title"
              class="w-full aspect-[16/9] object-cover rounded-xl ring-1 ring-black/10 dark:ring-white/10 select-none"
              draggable="false"
          />

          <!-- Миниатюры (если изображений > 1) -->
          <div v-if="images.length > 1" class="mt-3 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            <button
                v-for="(img, i) in images"
                :key="i"
                type="button"
                class="group relative rounded-lg overflow-hidden ring-1 transition
                     ring-black/10 dark:ring-white/10
                     hover:ring-black/30 dark:hover:ring-white/30
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f52216]/60"
                :aria-current="currentIndex === i ? 'true' : 'false'"
                :aria-label="`Показать изображение ${i+1}`"
                @click="selectImage(i)"
            >
              <img
                  :src="img"
                  :alt="`${project.title} — ${i+1}`"
                  class="w-full aspect-video object-cover"
                  draggable="false"
              />
              <!-- Индикатор выбранного -->
              <span
                  v-if="currentIndex === i"
                  class="pointer-events-none absolute inset-0 ring-2 ring-offset-2 ring-[#f52216] ring-offset-white dark:ring-offset-neutral-950 rounded-lg"
              />
            </button>
          </div>
        </div>

        <!-- Полное описание -->
        <article class="prose prose-neutral dark:prose-invert max-w-none">
          <p>{{ project.fullDescription }}</p>
        </article>

        <!-- Технологии (цветные плашки с маской иконки) -->
        <div class="mt-8">
          <h3 class="text-xl font-semibold mb-3">Использованные технологии</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div
                v-for="tech in project.tech"
                :key="tech.name"
                class="flex items-center gap-3 rounded-lg p-3 ring-1 transition"
                :style="{
                backgroundColor: `color-mix(in srgb, ${tech.color} 15%, transparent)`,
                borderColor: `color-mix(in srgb, ${tech.color} 55%, transparent)`
              }"
            >
              <div
                  class="w-7 h-7 rounded-md"
                  :style="{
                  backgroundColor: tech.color,
                  mask: `url('${tech.icon}') center / 60% no-repeat`,
                  WebkitMask: `url('${tech.icon}') center / 60% no-repeat`
                }"
              />
              <span class="text-sm font-medium" :style="{ color: tech.color }">{{ tech.name }}</span>
            </div>
          </div>
        </div>

        <!-- Теги (кликабельные → фильтр на /projects) -->
        <div class="mt-6">
          <h3 class="text-xl font-semibold mb-3">Теги</h3>
          <div class="flex flex-wrap gap-2">
            <button
                v-for="t in project.tags"
                :key="t.name"
                class="px-3 py-1 rounded-full text-sm font-medium transition ring-1
                     hover:brightness-110
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f52216]/60"
                :style="{ color: t.color, borderColor: t.color, backgroundColor: `color-mix(in srgb, ${t.color} 12%, transparent)` }"
                @click="goToTag(t.name)"
            >
              {{ t.name }}
            </button>
          </div>
        </div>

        <!-- Ссылки -->
        <div v-if="project.links?.demo || project.links?.repo || project.links?.repo2" class="mt-8 flex flex-wrap gap-3">
          <a
              v-if="project.links?.demo"
              :href="project.links.demo"
              target="_blank" rel="noopener"
              class="inline-flex items-center px-4 py-2 rounded-lg font-medium bg-[#f52216] text-white transition
                   hover:bg-[#d41812] active:bg-[#b3140f]
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f52216]/60"
          >
            Демо
          </a>
          <a
              v-if="project.links?.repo"
              :href="project.links.repo"
              target="_blank" rel="noopener"
              class="inline-flex items-center px-4 py-2 rounded-lg font-medium transition
                   ring-1 ring-black/10 dark:ring-white/10
                   hover:bg-black/10 dark:hover:bg-white/15
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f52216]/60"
          >
            Репозиторий
          </a>
          <a
              v-if="project.links?.repo2"
              :href="project.links.repo2"
              target="_blank" rel="noopener"
              class="inline-flex items-center px-4 py-2 rounded-lg font-medium transition
                   ring-1 ring-black/10 dark:ring-white/10
                   hover:bg-black/10 dark:hover:bg-white/15
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f52216]/60"
          >
            Репозиторий
          </a>
        </div>

        <!-- CTA внизу -->
        <div class="mt-10 text-center">
          <NuxtLink
              to="/#contact"
              class="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-[#f52216] text-white transition
                   hover:bg-[#d41812] active:bg-[#b3140f]
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f52216]/60"
          >
            Хочу похожий проект себе
          </NuxtLink>
        </div>

        <!-- Мета -->
        <div class="mt-6 text-xs opacity-70">
          <span v-if="project.updatedAt">Обновлён: {{ new Date(project.updatedAt).toLocaleDateString() }}</span>
          <span v-else-if="project.createdAt">Создан: {{ new Date(project.createdAt).toLocaleDateString() }}</span>
          <span v-if="project.status"> • Статус: {{ project.status }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.prose :where(p):not(:where(.not-prose *)) { margin-top: .8rem; margin-bottom: .8rem; }
</style>
