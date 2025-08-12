<script setup lang="ts">
interface Props {
  title: string
  text: string
  color?: string // HEX или rgb(), например '#2563eb'
}
const props = withDefaults(defineProps<Props>(), {
  color: '#2563eb'
})
</script>

<template>
  <li class="relative ps-10">
    <!-- Точка шага -->
    <span
        class="absolute left-0 top-1 h-7 w-7 rounded-full ring-4 ring-white dark:ring-neutral-950"
        :style="{ backgroundColor: color as string }"
        aria-hidden="true"
    />
    <h4 class="text-xl font-semibold leading-snug">{{ title }}</h4>
    <p class="opacity-80 mt-1">{{ text }}</p>
  </li>
</template>

<style scoped>
</style>
