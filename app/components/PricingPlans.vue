<!-- components/PricingPlans.vue -->
<script setup lang="ts">
interface Plan {
  name: string
  price: string
  description: string
  features: string[]
}

const { t } = useI18n()

const plans = computed<Plan[]>(() => [
  {
    name: t('pages.string.pricing.basic.landing.name'),
    price: t('pages.string.pricing.basic.landing.priceRUB'),
    description: t('pages.string.pricing.basic.landing.description'),
    features: [
      t('pages.string.pricing.basic.landing.features.1'),
      t('pages.string.pricing.basic.landing.features.2'),
      t('pages.string.pricing.basic.landing.features.3'),
      t('pages.string.pricing.basic.landing.features.4'),
      t('pages.string.pricing.basic.landing.features.5')
    ]
  },
  {
    name: t('pages.string.pricing.basic.standard.name'),
    price: t('pages.string.pricing.basic.standard.priceRUB'),
    description: t('pages.string.pricing.basic.standard.description'),
    features: [
      t('pages.string.pricing.basic.standard.features.1'),
      t('pages.string.pricing.basic.standard.features.2'),
      t('pages.string.pricing.basic.standard.features.3'),
      t('pages.string.pricing.basic.standard.features.4'),
      t('pages.string.pricing.basic.standard.features.5'),
      t('pages.string.pricing.basic.standard.features.6')
    ]
  },
  {
    name: t('pages.string.pricing.basic.creative.name'),
    price: t('pages.string.pricing.basic.creative.priceRUB'),
    description: t('pages.string.pricing.basic.creative.description'),
    features: [
      t('pages.string.pricing.basic.creative.features.1'),
      t('pages.string.pricing.basic.creative.features.2'),
      t('pages.string.pricing.basic.creative.features.3'),
      t('pages.string.pricing.basic.creative.features.4'),
      t('pages.string.pricing.basic.creative.features.5'),
      t('pages.string.pricing.basic.creative.features.6'),
      t('pages.string.pricing.basic.creative.features.7'),
      t('pages.string.pricing.basic.creative.features.8'),
      t('pages.string.pricing.basic.creative.features.9')
    ]
  }
])

const extras = computed<Plan[]>(() => [
  {
    name: t('pages.string.pricing.additional.hourly.name'),
    price: t('pages.string.pricing.additional.hourly.priceRUB'),
    description: t('pages.string.pricing.additional.hourly.description'),
    features: [
      t('pages.string.pricing.additional.hourly.features.1'),
      t('pages.string.pricing.additional.hourly.features.2'),
      t('pages.string.pricing.additional.hourly.features.3'),
      t('pages.string.pricing.additional.hourly.features.4')
    ]
  },
  {
    name: t('pages.string.pricing.additional.maintenance.name'),
    price: t('pages.string.pricing.additional.maintenance.priceRUB'),
    description: t('pages.string.pricing.additional.maintenance.description'),
    features: [
      t('pages.string.pricing.additional.maintenance.features.1'),
      t('pages.string.pricing.additional.maintenance.features.2'),
      t('pages.string.pricing.additional.maintenance.features.3'),
      t('pages.string.pricing.additional.maintenance.features.4'),
      t('pages.string.pricing.additional.maintenance.features.5'),
      t('pages.string.pricing.additional.maintenance.features.6')
    ]
  }
])
</script>

<template>
  <section id="pricing" class="relative py-16 sm:py-20 lg:py-24">
    <div class="container mx-auto px-4 sm:px-6 lg:px-12">
      <div class="mb-8 sm:mb-10 text-center">
        <h3 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
          {{$t('pages.string.pricing.title')}}
        </h3>
        <p class="text-sm sm:text-base opacity-80 max-w-2xl mx-auto">
          {{$t('pages.string.pricing.subtitle')}}
        </p>
      </div>

      <!-- Основные пакеты -->
      <div class="grid gap-6 sm:gap-8 lg:grid-cols-3">
        <div
            v-for="plan in plans"
            :key="plan.name"
            class="rounded-2xl p-6 sm:p-8 bg-white/60 dark:bg-neutral-900/60
                 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10
                 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)]
                 hover:shadow-lg transition-shadow
                 flex flex-col"
        >
          <h4 class="text-xl font-semibold mb-2">{{ plan.name }}</h4>
          <div class="text-3xl font-bold mb-4">{{ plan.price }}</div>
          <p class="text-sm opacity-80 mb-5">{{ plan.description }}</p>
          <ul class="space-y-2 text-sm flex-1">
            <li v-for="f in plan.features" :key="f">• {{ f }}</li>
          </ul>
          <div class="mt-6">
            <a
                href="#contact"
                class="inline-flex items-center justify-center px-5 py-3 rounded-lg font-medium
                     bg-[#f52216] text-white hover:bg-[#d41812] active:bg-[#b3140f]
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f52216]/50 w-full transition"
            >
              {{$t('pages.string.pricing.button')}}
            </a>
          </div>
        </div>
      </div>

      <!-- Отдельная категория: почасовая и обслуживание -->
      <div class="mt-12">
        <h4 class="text-xl sm:text-2xl font-semibold mb-4">
          {{$t('pages.string.pricing.addTitle')}}
        </h4>
        <div class="grid gap-6 sm:gap-8 sm:grid-cols-2">
          <div
              v-for="extra in extras"
              :key="extra.name"
              class="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-white/70 via-white/40 to-white/20
                   dark:from-white/10 dark:via-white/5 dark:to-white/[0.03]
                   backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 shadow-md
                   hover:shadow-lg transition-shadow"
          >
            <h5 class="text-lg sm:text-xl font-semibold mb-2">{{ extra.name }}</h5>
            <div class="text-2xl font-bold mb-4">{{ extra.price }}</div>
            <p class="text-sm opacity-80 mb-5">{{ extra.description }}</p>
            <ul class="space-y-2 text-sm">
              <li v-for="f in extra.features" :key="f">• {{ f }}</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
/* всё на утилитах Tailwind; отдельные классы не требуются */
</style>
