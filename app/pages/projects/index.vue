<script setup lang="ts">


definePageMeta({
  title: 'pages.title.projects' // set resource key
})

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
  createdAt?: string
  updatedAt?: string
  status?: 'done' | 'wip' | 'archived'
}

type ProjectsResponse = {
  items: Project[]
  meta: { total: number; page: number; pages: number; limit: number }
}

const route = useRoute()
const router = useRouter()

const page = ref<number>(Number(route.query.page ?? 1) || 1)
const q = ref<string>(typeof route.query.q === 'string' ? route.query.q : '')
const tagsParam = ref<string>(typeof route.query.tags === 'string' ? route.query.tags : '')

watch([page, q, tagsParam], () => {
  router.replace({
    query: {
      page: page.value !== 1 ? page.value : undefined,
      q: q.value || undefined,
      tags: tagsParam.value || undefined
    }
  })
})

const { data, pending, error } = await useAsyncData<ProjectsResponse>(
    () =>
        $fetch('/api/projects', {
          query: {
            page: page.value,
            limit: 10,
            q: q.value,
            tags: tagsParam.value || undefined,
            sort: 'recent'
          }
        }),
    { watch: [page, q, tagsParam] }
)

const items = computed<Project[]>(() => data.value?.items ?? [])
const meta = computed(() => data.value?.meta ?? { total: 0, page: 1, pages: 1, limit: 10 })

const pagesToShow = computed<number[]>(() => {
  const total = meta.value.pages
  const cur = meta.value.page
  const span = 2
  const start = Math.max(1, cur - span)
  const end = Math.min(total, cur + span)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const goToPage = (n: number) => {
  if (n < 1 || n > meta.value.pages) return
  page.value = n
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 min-h-screen">
    <section class="container mx-auto px-4 sm:px-6 lg:px-12 py-12">
      <!-- Навигация -->
      <div class="flex justify-between items-center mb-6 gap-3">
        <NuxtLink
            to="/"
            class="px-4 py-2 rounded-lg ring-1 ring-black/10 dark:ring-white/10 hover:bg-black/5 dark:hover:bg-white/10"
        >
          ← Назад
        </NuxtLink>
        <NuxtLink
            to="/#contact"
            class="px-4 py-2 rounded-lg bg-[#f52216] text-white hover:bg-[#f52238]"
        >
          Связаться со мной
        </NuxtLink>
      </div>

      <div class="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-4 sm:items-end sm:justify-between">
        <div>
          <h1 class="text-3xl sm:text-4xl font-bold mb-2">Все проекты</h1>
          <p class="opacity-80 text-sm sm:text-base">По умолчанию — от новых к старым.</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div class="w-full sm:w-80">
            <label class="block text-sm mb-1 opacity-80">Поиск</label>
            <input
                v-model="q"
                type="search"
                placeholder="Название, теги, технологии…"
                class="w-full px-4 py-2 rounded-lg ring-1 ring-black/10 dark:ring-white/10 bg-white dark:bg-neutral-900"
            />
          </div>
          <div class="w-full sm:w-80">
            <label class="block text-sm mb-1 opacity-80">Фильтр по тегам (через запятую)</label>
            <input
                v-model="tagsParam"
                type="text"
                placeholder="Лендинг, SEO"
                class="w-full px-4 py-2 rounded-lg ring-1 ring-black/10 dark:ring-white/10 bg-white dark:bg-neutral-900"
            />
          </div>
        </div>
      </div>

      <div v-if="pending" class="py-10 text-center opacity-80">Загружаю…</div>
      <div v-else-if="error" class="py-10 text-center text-red-500">Не удалось загрузить список.</div>

      <div v-else>
        <div v-if="!items.length" class="py-10 text-center opacity-70">Ничего не найдено.</div>

        <div v-else class="grid gap-6 sm:gap-7 lg:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <NuxtLink v-for="p in items" :key="p.id" :to="`/projects/${p.slug}`" class="contents">
            <ProjectCard
                :title="p.title"
                :description="p.shortDescription"
                :image="p.images?.[0]"
                :tags="p.tags?.map(t => ({ label: t.name, color: t.color }))"
            />
          </NuxtLink>
        </div>

        <!-- Пагинация -->
        <nav v-if="meta.pages > 1" class="mt-10 flex items-center justify-center gap-2">
          <button
              class="px-3 py-2 rounded-md ring-1 ring-black/10 dark:ring-white/10 disabled:opacity-50"
              :disabled="meta.page <= 1"
              @click="goToPage(meta.page - 1)"
          >
            ‹ Пред
          </button>

          <button
              v-for="n in pagesToShow"
              :key="n"
              class="px-3 py-2 rounded-md ring-1 ring-black/10 dark:ring-white/10"
              :class="n === meta.page ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'hover:bg-black/5 dark:hover:bg-white/10'"
              @click="goToPage(n)"
          >
            {{ n }}
          </button>

          <button
              class="px-3 py-2 rounded-md ring-1 ring-black/10 dark:ring-white/10 disabled:opacity-50"
              :disabled="meta.page >= meta.pages"
              @click="goToPage(meta.page + 1)"
          >
            След ›
          </button>
        </nav>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* всё на утилитах */
</style>
