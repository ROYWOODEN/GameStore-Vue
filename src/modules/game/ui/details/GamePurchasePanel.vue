<template>
  <motion.aside
    :initial="{ opacity: 0, x: 24 }"
    :animate="{ opacity: 1, x: 0 }"
    :transition="{ duration: 0.34, delay: 0.18, ease: 'easeOut' }"
    class="grid h-fit gap-5 rounded-xl border border-(--color-outline-variant) bg-(--color-surface-container-low)/95 p-5 shadow-[0_18px_44px_rgb(0_0_0/0.18)] backdrop-blur"
  >
    <div class="grid gap-2">
      <span class="text-sm font-semibold text-(--color-on-surface-variant)">
        {{ t('gameDetails.price') }}
      </span>
      <span
        v-if="isOwned"
        class="inline-flex w-fit items-center gap-2 rounded-md border border-(--color-primary) bg-(--color-primary)/12 px-3 py-2 text-base font-extrabold text-(--color-primary)"
      >
        <VueIcon name="bs:check-circle-fill" />
        <span>{{ t('game.owned') }}</span>
      </span>
      <span v-else class="text-4xl font-black" :class="isFree ? 'text-(--color-primary)' : ''">
        {{ formattedPrice }}
      </span>
    </div>

    <div class="grid gap-3">
      <Button
        v-if="isOwned"
        class="justify-center! gap-2! rounded-lg! border-(--color-primary)! bg-(--color-primary)! px-4! py-3! text-base! font-bold! text-(--color-on-primary)! hover:border-(--color-primary-strong)! hover:bg-(--color-primary-strong)!"
        type="button"
        :aria-label="t('game.play')"
      >
        <VueIcon name="bs:play-fill" class="text-xl" />
        <span>{{ t('game.play') }}</span>
      </Button>
      <Button
        v-else
        :class="[
          'justify-center! gap-2! rounded-lg! px-4! py-3! text-base! font-bold!',
          isInBasket
            ? 'border-(--color-primary)! bg-(--color-surface-container-high)! text-(--color-primary)! hover:border-(--color-primary-strong)! hover:bg-(--color-surface-container-highest)!'
            : 'border-(--color-primary)! bg-(--color-primary)! text-(--color-on-primary)! hover:border-(--color-primary-strong)! hover:bg-(--color-primary-strong)!',
          isBasketPending ? 'cursor-wait! opacity-85' : '',
        ]"
        type="button"
        :aria-label="basketLabel"
        :disabled="isBasketPending"
        @click="emit('basketToggle')"
      >
        <i v-if="isBasketPending" class="pi pi-spin pi-spinner text-base" />
        <VueIcon v-else :name="basketIconName" class="text-xl" />
        <span>{{ basketButtonText }}</span>
      </Button>
      <Button
        :class="[
          'justify-center! gap-2! rounded-lg! border-(--color-outline-variant)! bg-(--color-surface-container-high)! px-4! py-3! text-base! font-bold! hover:border-(--color-primary)!',
          isFavorite
            ? 'text-(--color-primary)!'
            : 'text-(--color-on-surface)! hover:text-(--color-primary)!',
          isFavoritePending ? 'cursor-wait! opacity-85' : '',
        ]"
        type="button"
        :aria-label="favoriteLabel"
        :aria-pressed="isFavorite"
        :disabled="isFavoritePending"
        outlined
        @click="emit('favoriteToggle')"
      >
        <i v-if="isFavoritePending" class="pi pi-spin pi-spinner text-base" />
        <VueIcon v-else :name="favoriteIconName" class="text-xl" />
        <span>{{ favoriteButtonText }}</span>
      </Button>
    </div>

    <div class="grid gap-3 border-t border-(--color-outline-variant) pt-4">
      <h2 class="text-xl font-bold">{{ t('gameDetails.rating.title') }}</h2>
      <div class="flex items-center gap-4">
        <span class="min-w-16 text-5xl font-black">{{ ratingScoreLabel }}</span>
        <div class="grid gap-1">
          <Rating class="game-rating" :model-value="ratingValue" readonly :cancel="false" />
          <span class="text-sm font-semibold text-(--color-on-surface-variant)">
            {{ ratingCountLabel }}
          </span>
        </div>
      </div>
      <p class="text-xs leading-5 text-(--color-on-surface-variant)">
        {{ t('gameDetails.rating.caption') }}
      </p>
    </div>

    <div class="grid gap-3 border-t border-(--color-outline-variant) pt-4">
      <div v-for="group in tagGroups" :key="group.name" class="grid gap-2">
        <span class="text-xs font-bold uppercase text-(--color-on-surface-variant)">
          {{ getTagGroupLabel(group.name) }}
        </span>
        <div class="flex flex-wrap gap-2">
          <GameTagPill
            v-for="tag in group.tags"
            :key="tag.name"
            :tag="tag"
            :icon-only="getTagTypeName(tag) === 'platforma'"
            size="lg"
          />
        </div>
      </div>
    </div>
  </motion.aside>
</template>

<script setup lang="ts">
import type { GameListTag } from '@/modules/game'
import { formatGameRating } from '@/modules/game/lib/rating'
import { getTagGroupLabel, getTagTypeName } from '@/modules/game/lib/tags'
import { formatRubPrice, isFreePrice } from '@/shared/lib/price'
import { motion } from 'motion-v'
import Button from 'primevue/button'
import Rating from 'primevue/rating'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GameTagPill from './GameTagPill.vue'

const props = defineProps<{
  isBasketPending: boolean
  isFavorite: boolean
  isFavoritePending: boolean
  isInBasket: boolean
  isOwned: boolean
  price: string
  rating: number | null
  ratingCount: number
  tagGroups: Array<{ name: string; tags: GameListTag[] }>
}>()

const emit = defineEmits<{
  basketToggle: []
  favoriteToggle: []
}>()

const { t } = useI18n()
const isFree = computed(() => isFreePrice(props.price))
const formattedPrice = computed(() => (isFree.value ? t('game.free') : formatRubPrice(props.price)))
const hasRating = computed(() => props.rating !== null && props.ratingCount > 0)
const ratingValue = computed(() => Math.min(5, Math.max(0, props.rating ?? 0)))
const ratingScoreLabel = computed(() =>
  hasRating.value && props.rating !== null ? formatGameRating(props.rating) : '-',
)
const ratingCountLabel = computed(() =>
  hasRating.value
    ? t('gameDetails.rating.count', { count: props.ratingCount.toLocaleString('ru-RU') })
    : t('gameDetails.rating.empty'),
)
const basketIconName = computed(() => (props.isInBasket ? 'bs:cart-check-fill' : 'bs:cart-plus'))
const basketButtonText = computed(() => {
  if (props.isBasketPending) {
    return t('game.cartUpdating')
  }

  return props.isInBasket ? t('game.inCart') : t('game.addToCart')
})
const basketLabel = computed(() =>
  props.isInBasket ? t('game.removeFromCart') : t('game.addToCart'),
)
const favoriteIconName = computed(() => (props.isFavorite ? 'bs:heart-fill' : 'bs:heart'))
const favoriteButtonText = computed(() =>
  props.isFavorite ? t('game.removeFromFavorites') : t('game.addToFavorites'),
)
const favoriteLabel = computed(() =>
  props.isFavorite ? t('game.removeFromFavorites') : t('game.addToFavorites'),
)
</script>

<style scoped>
.game-rating :deep(.p-rating-on-icon) {
  color: var(--color-primary);
}

.game-rating :deep(.p-rating-off-icon) {
  color: color-mix(in srgb, var(--color-on-surface) 34%, transparent);
}

.game-rating :deep(.p-rating-icon) {
  width: 1.15rem;
  height: 1.15rem;
}
</style>
