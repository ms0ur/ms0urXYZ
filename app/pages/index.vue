<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onBeforeUnmount, ref } from 'vue'
import SafeAvatar from '~/components/SafeAvatar.vue'

useSeoMeta({
  title: 'Разработка сайтов и веб-приложений в Москве - ms0ur',
  description: 'Быстрые, надёжные и адаптивные сайты и веб-приложения на Nuxt/Vue или React/Next под ключ. Бэкенд на Nitro/Express. Договор, портфолио, сопровождение. Дёшево.',
  ogTitle: 'ms0ur - веб-разработчик',
  ogDescription: 'Сайты и веб-приложения: быстро, аккуратно, под ключ.',
  ogType: 'website',
  ogUrl: 'https://ms0ur.space/',
  ogImage: 'https://ms0ur.space/og/home.png',
  twitterCard: 'summary_large_image'
})

useSchemaOrg([
  defineWebSite({ name: 'ms0ur — сайт разработчика', url: 'https://ms0ur.space' }),
  definePerson({
    name: 'Максим Суслов',
    url: 'https://ms0ur.space',
    sameAs: ['https://t.me/ms0ur', 'https://github.com/ms0ur']
  }),
  definePerson({
    name: 'Maksim Suslov',
    url: 'https://ms0ur.space',
    sameAs: ['https://t.me/ms0ur', 'https://github.com/ms0ur']
  }),
  // если как услуга в регионе:
  defineOrganization({
    '@type': 'ProfessionalService',
    name: 'Веб-разработка — ms0ur',
    areaServed: 'RU',
    url: 'https://ms0ur.space'
  })
])

const METRIKA_ID = 103744142 // замените на ваш

function reachGoal(goal: string, params?: Record<string, any>) {
  window.ym?.(METRIKA_ID, 'reachGoal', goal, params)
}

// трекинг клика по email
function trackEmail() {
  reachGoal('EMAIL_CLICK', { method: 'email', place: 'contact_box' })
  // далее стандартное поведение ссылки:
  window.location.href = 'mailto:maksimsuslov7142@gmail.com'
}

// трекинг клика по Телеге
function trackTelegram() {
  reachGoal('TELEGRAM_CLICK', { method: 'telegram', place: 'contact_box' })
  window.open('https://t.me/ms0ur', '_blank')
}

// 🔹 Разбиваем тяжёлые компоненты на чанки
const FloatingShapesBackground = defineAsyncComponent(() => import('~/components/FloatingShapesBackground.vue'))
const AboutStack               = defineAsyncComponent(() => import('~/components/AboutStack.vue'))
const PricingPlans             = defineAsyncComponent(() => import('~/components/PricingPlans.vue'))
const ProcessStep              = defineAsyncComponent(() => import('~/components/ProcessStep.vue'))
const ProjectCard              = defineAsyncComponent(() => import('~/components/ProjectCard.vue'))
const ThemeToggle              = defineAsyncComponent(() => import('~/components/ThemeToggle.vue'))

definePageMeta({ title: 'pages.title.index' })

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const { tm, rt } = useI18n()

const availableLocales = computed(() => locales.value.filter(i => i.code !== locale.value))

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
  links?: { demo?: string; repo?: string }
  createdAt?: string
  updatedAt?: string
  status?: 'done' | 'wip' | 'archived'
}
type Step = { title: string; text: string; color?: string }

const stepsFromI18n = computed(() => tm('steps') as Step[])

// Различимые цвета
function generateDistinctColors(n: number, seedHue = 210): string[] {
  const colors: string[] = []
  const goldenAngle = 137.508
  for (let i = 0; i < n; i++) {
    const h = Math.round((seedHue + i * goldenAngle) % 360)
    const s = 75, l = 52
    colors.push(hslToHex(h, s, l))
  }
  return colors
}
function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}
const steps = computed<Step[]>(() => {
  const src = stepsFromI18n.value ?? []
  const auto = generateDistinctColors(src.length, 210)
  let i = 0
  return src.map(s => s.color ? s : { ...s, color: auto[i++] })
})

// избранные проекты (SSR-friendly)
const { data: featuredResp, pending: featuredPending, error: featuredError } =
    await useFetch<{ items: Project[] }>('/api/projects/featured')
const featured = computed(() => featuredResp.value?.items ?? [])

/** =========================
 *  PERF + STABILITY
 *  ========================= */
const heroEl = ref<HTMLElement | null>(null)
const projectsEl = ref<HTMLElement | null>(null)

const heroBgVisible = ref(false)
const projectsVisible = ref(false)

let heroIO: IntersectionObserver | null = null
let projIO: IntersectionObserver | null = null

onMounted(() => {
  // Если reduce motion — всё равно показываем фон (но у компонента можно понизить качество/движение изнутри)
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  // HERO
  if (heroEl.value) {
    const schedule = (fn: () => void) => {
      // @ts-ignore
      const ric = window.requestIdleCallback || ((f: any) => setTimeout(f, 50))
      ric(fn, { timeout: 500 })
    }
    schedule(() => {
      if (prefersReducedMotion) {
        heroBgVisible.value = true
        return
      }
      heroIO = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            heroBgVisible.value = true
            heroIO?.disconnect()
            heroIO = null
            break
          }
        }
      }, { root: null, rootMargin: '150px', threshold: 0.01 })
      heroIO.observe(heroEl.value!)
    })
  }

  // PROJECTS
  if (projectsEl.value) {
    projIO = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          projectsVisible.value = true
          projIO?.disconnect()
          projIO = null
          break
        }
      }
    }, { root: null, rootMargin: '200px', threshold: 0.01 })
    projIO.observe(projectsEl.value!)
  }
})

onBeforeUnmount(() => {
  heroIO?.disconnect()
  projIO?.disconnect()
  heroIO = projIO = null
})
</script>

<template>
  <div class="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
    <!-- HERO -->
    <section ref="heroEl" class="relative min-h-[100svh] overflow-hidden">
      <!-- фон -->
      <ClientOnly>
        <FloatingShapesBackground
            v-if="heroBgVisible"
            :count="40"
            :speedMin="0.22"
            :speedMax="0.50"
            :repelRadius="2.6"
            :repelStrength="6"
            quality="low"
            theme="auto"
            :fixed="false"
            class="z-0 will-change-transform"
        />
      </ClientOnly>

      <div
          class="pointer-events-none absolute inset-0 z-10 opacity-90
               bg-gradient-to-tr from-white/70 via-white/30 to-transparent
               dark:from-black/60 dark:via-black/30 dark:to-transparent"
      />
      <div
          class="relative z-20 container mx-auto
               px-4 sm:px-6 lg:px-12
               py-16 sm:py-20 lg:py-24
               min-h-[100svh] flex items-center"
      >
        <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <!-- Левая колонка -->
          <div
              class="rounded-2xl p-5 sm:p-7 lg:p-8
                   bg-white/60 dark:bg-black/40
                   backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10
                   shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)]
                   text-center md:text-left"
          >
            <p class="text-base sm:text-lg mb-2 opacity-80">{{ $t('pages.string.index.welcome') }}</p>
            <h1 class="text-[28px] sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
              {{ $t('pages.string.index.name') }}
            </h1>
            <h2 class="text-xl sm:text-2xl lg:text-3xl font-medium mb-5 sm:mb-6">
              {{ $t('pages.string.index.role') }}
            </h2>

            <p class="text-base sm:text-lg max-w-xl mx-auto md:mx-0 mb-6 opacity-90 leading-relaxed">
              {{ $t('pages.string.index.description1') }} <br />
              {{ $t('pages.string.index.description2') }} <br />
              {{ $t('pages.string.index.description3') }} <br />
              {{ $t('pages.string.index.description4') }}
            </p>

            <!-- Кнопки -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4" aria-label="Навигация по разделам сайта">
              <NuxtLink to="/#pricing"   class="btn-primary">{{ $t('pages.string.index.button.pricing') }}</NuxtLink>
              <NuxtLink to="/#about"     class="btn-secondary">{{ $t('pages.string.index.button.about') }}</NuxtLink>
              <NuxtLink to="/#portfolio" class="btn-outline">{{ $t('pages.string.index.button.portfolio') }}</NuxtLink>
              <NuxtLink to="/#contact"   class="btn-outline">{{ $t('pages.string.index.button.contact') }}</NuxtLink>
            </div>
          </div>

          <!-- Правая колонка -->
          <SafeAvatar />
        </div>

        <!-- Тумблер темы -->
        <div class="fixed top-6 right-6">
          <ClientOnly>
            <ThemeToggle />
          </ClientOnly>
        </div>
      </div>
    </section>

    <!-- ОБО МНЕ / СТЕК -->
    <section class="relative py-16 sm:py-20 lg:py-24 section-visible">
      <div class="container mx-auto px-4 sm:px-6 lg:px-12">
        <AboutStack />
      </div>
    </section>

    <!-- ИЗБРАННЫЕ ПРОЕКТЫ -->
    <section ref="projectsEl" id="portfolio" class="relative py-16 sm:py-20 lg:py-24 section-visible">
      <div class="container mx-auto px-4 sm:px-6 lg:px-12">
        <div class="mb-8 sm:mb-10 flex items-end justify-between gap-4">
          <div>
            <h3 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
              {{ $t('pages.string.projects.featured.title1') }}
            </h3>
            <p class="text-sm sm:text-base opacity-80">
              {{ $t('pages.string.projects.featured.subtitle1') }}
            </p>
          </div>
          <NuxtLink
              to="/projects"
              class="hidden sm:inline-flex items-center px-4 py-2 rounded-lg font-medium
                   ring-1 ring-black/10 dark:ring-white/10 hover:bg-black/5 dark:hover:bg-white/10"
          >
            {{ $t('pages.string.projects.featured.button') }}
          </NuxtLink>
        </div>

        <!-- Показываем спиннер/скелетон до видимости секции (не "пусто") -->
        <div v-if="featuredPending && !projectsVisible" class="py-8 text-center opacity-60">
          {{ $t('pages.string.projects.featured.loading') }}
        </div>

        <div v-else-if="featuredError && projectsVisible" class="py-8 text-center text-red-500">
          {{ $t('pages.string.projects.featured.error') }}
        </div>

        <!-- Рендерим карточки когда секция близко к вьюпорту -->
        <div v-else-if="projectsVisible" class="grid gap-6 sm:gap-7 lg:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <NuxtLink v-for="p in featured" :key="p.id" :to="`/projects/${p.slug}`" class="contents">
            <ProjectCard
                :title="p.title"
                :description="p.shortDescription"
                :image="p.images?.[0] || 'https://placehold.co/600x400/png'"
                :tags="p.tags?.map(t => ({ label: t.name, color: t.color }))"
            />
          </NuxtLink>
        </div>

        <!-- Фолбэк: если по каким-то причинам projectsVisible не сработал, всё равно что-то показываем -->
        <div v-else class="py-8 text-center opacity-60">
          {{ $t('pages.string.projects.featured.loading') }}
        </div>

        <div class="mt-8 sm:mt-10 flex sm:hidden">
          <NuxtLink
              to="/projects"
              class="mx-auto inline-flex items-center justify-center px-5 sm:px-6 py-3 rounded-lg font-medium
                   bg-neutral-900 text-white hover:bg-black
                   dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400
                   w-full sm:w-auto"
          >
            {{ $t('pages.string.projects.featured.button') }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ПРОЦЕСС -->
    <section id="process" class="relative py-16 sm:py-20 lg:py-24 section-visible">
      <div class="container mx-auto px-4 sm:px-6 lg:px-12">
        <div class="mb-8 sm:mb-10">
          <h3 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
            {{ $t('pages.string.process.title') }}
          </h3>
          <p class="opacity-80">
            {{ $t('pages.string.process.subtitle') }}
          </p>
        </div>

        <ol class="relative border-s border-neutral-200 dark:border-neutral-700 space-y-8 sm:space-y-10 ps-6">
          <ProcessStep
              v-for="(s, i) in steps"
              :key="i"
              :title="$rt(s.title)"
              :text="$rt(s.text)"
              :color="s.color"
          />
        </ol>
        <p class="opacity-50 mt-4 text-sm">При желании могу рассмотреть другой формат работы - как вам будет удобнее</p>
      </div>
    </section>

    <!-- ТАРИФЫ -->
    <section id="pricing" class="relative py-16 sm:py-20 lg:py-24 section-visible">
      <div class="container mx-auto px-4 sm:px-6 lg:px-12">
        <PricingPlans />
      </div>
    </section>

    <!-- КОНТАКТ -->
    <section id="contact" class="relative py-16 sm:py-20 lg:py-24 section-visible">
      <div class="container mx-auto px-4 sm:px-6 lg:px-12">
        <div
            class="rounded-2xl p-6 sm:p-8 lg:p-10
                 bg-gradient-to-br from-white/70 via-white/40 to-white/20
                 dark:from-white/10 dark:via-white/5 dark:to-white/[0.03]
                 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10"
        >
          <h3 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{{ $t('pages.string.contact.title') }}</h3>
          <p class="text-sm sm:text-base opacity-80 mb-6 sm:mb-8">
            {{ $t('pages.string.contact.subtitle') }}
          </p>
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div class="flex flex-col items-start">
              <a href="mailto:maksimsuslov7142@gmail.com" @click.prevent="trackEmail" class="btn-primary relative">
                {{ $t('pages.string.contact.emailButton') }}
                <span class="absolute -top-2 -right-2 bg-[#f52216] text-white text-[12px] font-medium tracking-wide rounded-full px-2 py-0.5">
                  {{ $t('pages.string.contact.emailButtonTiming') }}
                </span>
              </a>
            </div>
            <div class="flex flex-col items-start">
              <a href="https://t.me/ms0ur" class="btn-secondary relative" @click.prevent="trackTelegram" target="_blank" rel="noopener" >
                {{ $t('pages.string.contact.telegramButton') }}
                <span class="absolute -top-2 -right-2 bg-[#f52216] text-white text-[12px] font-medium tracking-wide rounded-full px-2 py-0.5">
                  {{ $t('pages.string.contact.telegramButtonTiming') }}
                </span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Базовые кнопки: единый стиль + адаптивность + отсутствие сжатия на узких экранах */
.btn {
  @apply inline-flex items-center justify-center rounded-lg font-medium
  focus:outline-none focus-visible:ring-2 transition
  h-11 px-5 sm:px-6 whitespace-nowrap;
}
.btn-primary {
  @apply btn bg-[#f52216] text-white hover:bg-[#d41812] active:bg-[#b3140f]
  focus-visible:ring-[#f52216]/50;
}
.btn-secondary {
  @apply btn bg-white text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200
  dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white
  focus-visible:ring-[#f52216]/50;
}
.btn-outline {
  @apply btn bg-transparent hover:bg-[#f52216]/10
  ring-1 ring-[#f52216]/50
  text-neutral-900 dark:text-neutral-100
  focus-visible:ring-[#f52216]/50;
}

/* 🔹 Секционные оптимизации: не рендерим вне вьюпорта */
.section-visible {
  content-visibility: auto;
  contain-intrinsic-size: 800px 600px; /* примерные размеры, чтоб сетка не прыгала */
}

/* Графический фон героя чуть дешевле для композитинга */
.will-change-transform { will-change: transform; }
</style>
