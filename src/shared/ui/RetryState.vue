<template>
  <section
    class="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl flex-col items-center justify-center gap-4 text-center"
    role="alert"
  >
    <h1 class="text-2xl font-bold text-(--color-on-surface)">
      {{ title }}
    </h1>
    <p class="text-sm leading-6 text-(--color-on-surface-variant)">
      {{ message }}
    </p>
    <Button :label="actionLabel" severity="secondary" @click="$emit('retry')" />
  </section>
</template>

<script setup lang="ts">
import Button from 'primevue/button'

defineProps<{
  title: string
  message: string
  actionLabel: string
}>()

defineEmits<{
  retry: []
}>()
</script>
