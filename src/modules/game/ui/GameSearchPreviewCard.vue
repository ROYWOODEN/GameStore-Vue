<template>
  <RouterLink
    class="group/search-card grid min-h-20 grid-cols-[4.75rem_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-transparent p-2 text-left transition-colors hover:border-(--color-primary) hover:bg-(--color-surface-container-highest) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
    :to="{ name: 'game-details', params: { id: game.id } }"
    @click="emit('select')"
  >
    <div
      class="flex h-16 w-19 overflow-hidden rounded-md bg-(--color-surface-container-high) text-(--color-on-surface-variant)"
    >
      <img
        v-if="coverImageUrl"
        :src="coverImageUrl"
        :alt="coverImageAlt"
        class="h-full w-full object-cover transition-transform duration-300 group-hover/search-card:scale-105"
      />
      <span v-else class="flex h-full w-full items-center justify-center text-xl">
        <VueIcon name="bs:image" />
      </span>
    </div>

    <span class="grid min-w-0 gap-1">
      <span class="truncate text-sm font-extrabold text-(--color-on-surface)">
        {{ game.title }}
      </span>
      <span class="line-clamp-2 text-xs leading-5 text-(--color-on-surface-variant)">
        {{ game.description }}
      </span>
    </span>

    <span
      class="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-black text-(--color-primary)"
      :class="isOwned ? 'border border-(--color-primary) bg-(--color-primary)/12' : ''"
    >
      <VueIcon v-if="isOwned" name="bs:check-circle-fill" />
      <span>{{ priceLabel }}</span>
    </span>
  </RouterLink>
</template>

<script setup lang="ts">
import { formatRubPrice, isFreePrice } from '@/shared/lib/price'
import { buildAssetUrl } from '@/shared/lib/url'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GameListItem } from '../types/game'

const props = defineProps<{
  game: GameListItem
  isOwned?: boolean
}>()

const emit = defineEmits<{
  select: []
}>()

const apiUrl = import.meta.env.VITE_API_URL
const { t } = useI18n()

const coverImage = computed(
  () =>
    [...props.game.media.images].sort(
      (first, second) => (first.sort_order ?? 0) - (second.sort_order ?? 0),
    )[0],
)
const coverImageUrl = computed(() => buildAssetUrl(coverImage.value?.url, apiUrl))
const coverImageAlt = computed(() => coverImage.value?.alt || props.game.title)
const isFree = computed(() => isFreePrice(props.game.price))
const priceLabel = computed(() => {
  if (props.isOwned) {
    return t('game.owned')
  }

  return isFree.value ? t('game.free') : formatRubPrice(props.game.price)
})
</script>
