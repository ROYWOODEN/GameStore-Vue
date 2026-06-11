<template>
  <div
    class="relative h-36 overflow-hidden rounded-md bg-(--color-surface-container-high) min-[560px]:h-44 min-[760px]:h-32"
  >
    <img
      v-if="coverImageUrl"
      :src="coverImageUrl"
      :alt="coverImageAlt"
      class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
    <div
      v-else
      class="flex h-full w-full items-center justify-center text-4xl text-(--color-on-surface-variant)"
      :aria-label="t('game.coverPlaceholder')"
      role="img"
    >
      <VueIcon name="bs:image" />
    </div>
    <div class="absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent to-black/55"></div>
    <span
      v-if="ageTag"
      class="absolute right-2 bottom-2 rounded-md border border-white/25 bg-black/55 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm"
    >
      {{ ageTag.name }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { buildAssetUrl } from '@/shared/lib/url'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BasketGame } from '../types/basket'

const props = defineProps<{
  game: BasketGame
}>()

const apiUrl = import.meta.env.VITE_API_URL
const { t } = useI18n()

const coverImage = computed(() => props.game.media.images[0])
const coverImageUrl = computed(() => buildAssetUrl(coverImage.value?.url, apiUrl))
const coverImageAlt = computed(() => coverImage.value?.alt || props.game.title)
const ageTag = computed(() => props.game.tags.find((tag) => tag.type === 'age'))
</script>
