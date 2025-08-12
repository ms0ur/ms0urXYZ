<script setup lang="ts">
type Color = string

interface Tech {
  name: string
  icon: string
  color: Color
  note?: string
}

const techs: Tech[] = [
  { name: 'Nuxt 4',      icon: '/icons/nuxt.svg',     color: '#00DC82', note: 'tech.desc.nuxt' },
  { name: 'Vue 3',       icon: '/icons/vue.svg',      color: '#4FC08D', note: 'tech.desc.vue' },
  { name: 'Tailwind',    icon: '/icons/tailwind.svg', color: '#06B6D4', note: 'tech.desc.tailwind' },
  { name: 'React',       icon: '/icons/react.svg',    color: '#61DAFB', note: 'tech.desc.react' },
  { name: 'Next.js',     icon: '/icons/nextjs.svg',   color: '#00196c', note: 'tech.desc.next' },
  { name: 'Node.js',     icon: '/icons/nodejs.svg',   color: '#5FA04E', note: 'tech.desc.node' },
  { name: 'Express',     icon: '/icons/express.svg',  color: '#6B7280', note: 'tech.desc.express' },
  { name: 'Nitro',       icon: '/icons/nitro.svg',    color: '#ff6467', note: 'tech.desc.nitro' },
  { name: 'Flutter',     icon: '/icons/flutter.svg',  color: '#02569B', note: 'tech.desc.flutter' },
  { name: 'Prisma',      icon: '/icons/prisma.svg',   color: '#2D3748', note: 'tech.desc.prisma' },
  { name: 'REST & API',  icon: '/icons/axios.svg',    color: '#A78BFA', note: 'tech.desc.restapi' },
  { name: 'Docker',      icon: '/icons/docker.svg',   color: '#2496ED', note: 'tech.desc.docker' }
]

function hexToRgb(hex: string) {
  const m = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return null
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

function parseColor(c: string): { r: number; g: number; b: number } | null {
  if (c.startsWith('#')) return hexToRgb(c)
  const rgb = c.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i)
  if (rgb) return { r: +rgb[1], g: +rgb[2], b: +rgb[3] }
  return null
}

function makeTileVars(baseColor: Color, iconUrl: string) {
  const rgb = parseColor(baseColor) ?? { r: 160, g: 160, b: 160 }
  const bg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`
  const border = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.55)`
  return {
    '--tile-color': `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    '--tile-bg': bg,
    '--tile-border': border,
    '--icon-url': `url('${iconUrl}')`
  } as Record<string, string>
}
</script>

<template>
  <section id="about" class="relative py-16 sm:py-20 lg:py-24">
    <div class="container mx-auto px-4 sm:px-6 lg:px-12">
      <div class="mb-8 sm:mb-10">
        <h3 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
          {{$t('pages.string.about.title')}}
        </h3>
        <p class="text-sm sm:text-base opacity-80 max-w-3xl">
          {{$t('pages.string.about.subtitle')}}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <!-- Левая колонка -->
        <div
            class="rounded-2xl p-6 sm:p-7 lg:p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-md"
        >
          <h4 class="text-xl sm:text-2xl font-semibold mb-4">{{$t('pages.string.about.title1')}}</h4>
          <ul class="space-y-3 text-sm sm:text-base">
            <li>{{$t('pages.string.about.list.1')}}</li>
            <li>{{$t('pages.string.about.list.2')}}</li>
            <li>{{$t('pages.string.about.list.3')}}</li>
            <li>{{$t('pages.string.about.list.4')}}</li>
            <li>{{$t('pages.string.about.list.5')}}</li>
            <li>{{$t('pages.string.about.list.6')}}</li>
          </ul>

          <div class="mt-6">
            <a
                href="#contact"
                class="btn-primary bg-[#f52216]"
            >
              {{$t('pages.string.about.contactButton')}}
            </a>
          </div>
        </div>

        <!-- Правая колонка -->
        <div>
          <h4 class="text-xl sm:text-2xl font-semibold mb-4">{{$t('pages.string.about.title2')}}</h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
                v-for="t in techs"
                :key="t.name"
                class="rounded-lg p-4 flex flex-col justify-between lucid-tile shadow-sm hover:shadow-md transition-shadow focus-within:outline-none focus-within:ring-2 focus-within:ring-[#f52216]/40 hover:border-[#f52216]/60"
                :style="makeTileVars(t.color, t.icon)"
                tabindex="0"
            >
              <div class="lucid-icon"></div>
              <div class="text-sm font-medium">{{ t.name }}</div>
              <div class="text-xs opacity-70">{{ $t(t.note) }}</div>
            </div>
          </div>
          <p class="text-xs opacity-70 mt-4">
            {{$t('pages.string.about.smallText')}}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Акцентная кнопка под общий стиль проекта */
.btn-primary {
  @apply inline-flex items-center justify-center px-5 py-3 rounded-lg font-medium
  text-white hover:bg-[#d41812] active:bg-[#b3140f]
  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f52216]/50 transition;
}

/* Карточки технологий */
.lucid-tile {
  background: var(--tile-bg);
  border: 1px solid var(--tile-border);
  border-radius: 10px;
}

/* Иконка */
.lucid-icon {
  width: 36px;
  height: 36px;
  background-color: var(--tile-color);
  mask: var(--icon-url) center / contain no-repeat;
  -webkit-mask: var(--icon-url) center / contain no-repeat;
}
</style>
