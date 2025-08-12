<template>
  <div>
    <NuxtLoadingIndicator color="#f52216" :height="3" :throttle="100" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup lang="ts">
</script>
<style>
@custom-variant dark (&:where(.dark-mode, .dark-mode *));
</style>