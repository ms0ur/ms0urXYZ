<script setup lang="ts">
import { computed } from 'vue'

type Tag = string | { label: string; color?: string; textColor?: string }

interface Props {
  title: string
  description: string
  image: string
  tags?: Tag[]
}
const props = defineProps<Props>()

function hexToRgb(hex: string) {
  const m = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return null
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

const normTags = computed(() =>
    (props.tags ?? []).map(t => typeof t === 'string' ? ({ label: t }) : t)
)

function tagStyle(tag: { color?: string; textColor?: string }) {
  if (!tag?.color) return {}
  const rgb = hexToRgb(tag.color)
  if (!rgb) return { color: tag.textColor ?? tag.color }
  return {
    color: tag.textColor ?? tag.color,
    backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
    borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`
  }
}
</script>

<template>
  <article
      class="group rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10
           bg-white/70 dark:bg-white/5 backdrop-blur-sm
           hover:shadow-xl transition-shadow"
  >
    <div class="aspect-[16/10] overflow-hidden">
      <img
          :src="image"
          :alt="title"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
    <div class="p-5">
      <h4 class="text-xl font-semibold mb-2">{{ title }}</h4>
      <p class="text-sm opacity-80 mb-4">
        {{ description }}
      </p>
      <div v-if="normTags.length" class="flex flex-wrap gap-2 text-xs">
        <span
            v-for="(tag, i) in normTags"
            :key="i"
            class="px-2 py-1 rounded border"
            :style="tagStyle(tag as any)"
        >
          {{ (tag as any).label }}
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
</style>
