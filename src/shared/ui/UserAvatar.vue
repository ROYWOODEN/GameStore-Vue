<template>
  <span>
    <img
      v-if="resolvedSrc"
      :src="resolvedSrc"
      :alt="alt"
      class="h-full w-full object-cover"
      @error="handleImageError"
    />
    <span v-else>{{ fallback }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  alt: string
  fallback: string
  src: string | null
}>()

const hasImageError = ref(false)

const resolvedSrc = computed(() => (props.src && !hasImageError.value ? props.src : null))

const handleImageError = (): void => {
  hasImageError.value = true
}

watch(
  () => props.src,
  () => {
    hasImageError.value = false
  },
)
</script>
