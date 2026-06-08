<template>
  <Card
    class="h-full! w-full! overflow-hidden! rounded-xl! border border-(--color-outline-variant)! bg-[color-mix(in_srgb,var(--color-surface-container-low)_93%,var(--color-primary)_7%)]! text-(--color-on-surface)! shadow-[0_14px_34px_rgb(0_0_0/0.14)]!"
    :pt="{
      body: {
        class:
          'flex h-full! min-h-[15rem] flex-col gap-3 p-4! min-[560px]:min-h-[16rem] min-[560px]:gap-3.5 min-[560px]:p-5! min-[1280px]:min-h-[17.25rem]',
      },
      caption: {
        class: 'flex flex-col gap-2',
      },
      title: {
        class: 'p-0!',
      },
      subtitle: {
        class: 'p-0!',
      },
      content: {
        class: 'mt-auto p-0!',
      },
      footer: {
        class: 'p-0!',
      },
    }"
  >
    <template #header>
      <div
        class="relative h-36 overflow-hidden bg-(--color-surface-container) min-[560px]:h-40 min-[1280px]:h-44"
      >
        <img
          v-if="coverImageUrl"
          :src="coverImageUrl"
          :alt="coverImageAlt"
          class="h-full w-full object-cover"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-(--color-surface-container-high) text-5xl text-(--color-on-surface-variant)"
          :aria-label="t('game.coverPlaceholder')"
          role="img"
        >
          <VueIcon name="bs:image" />
        </div>
        <div
          class="absolute inset-x-0 bottom-0 h-22 bg-linear-to-b from-transparent to-[color-mix(in_srgb,var(--color-surface-container-low)_40%,var(--color-primary)_7%)]"
        ></div>
        <button
          class="absolute top-3 left-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/55 text-lg text-white backdrop-blur-sm transition-colors hover:border-(--color-primary) hover:bg-(--color-primary) hover:text-(--color-on-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
          :class="[
            isFavorite
              ? 'border-(--color-primary)! bg-(--color-primary)! text-(--color-on-primary)! shadow-[0_0_0_4px_var(--color-menu-active-bg)] hover:border-(--color-primary-strong)! hover:bg-(--color-primary-strong)!'
              : 'hover:border-(--color-primary) hover:bg-(--color-primary) hover:text-(--color-on-primary)',
            isFavoritePending ? 'cursor-wait! opacity-85' : '',
          ]"
          type="button"
          :aria-label="favoriteLabel"
          :aria-pressed="isFavorite"
          :disabled="isFavoritePending"
          @click.stop="emit('favoriteToggle', { id: game.id })"
        >
          <motion.span
            v-if="isFavorite"
            class="absolute inset-1 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_34%,transparent)]"
            :initial="{ scale: 0.35, opacity: 0.8 }"
            :animate="{ scale: 1.7, opacity: 0 }"
            :transition="{ duration: 0.48, ease: 'easeOut' }"
          />
          <motion.span
            :key="favoriteIconKey"
            class="relative z-10 flex"
            :initial="{ scale: 0.55, rotate: -16, opacity: 0 }"
            :animate="{ scale: 1, rotate: 0, opacity: 1 }"
            :transition="{ type: 'spring', stiffness: 520, damping: 19 }"
          >
            <i v-if="isFavoritePending" class="pi pi-spin pi-spinner text-base" />
            <VueIcon v-else :name="favoriteIconName" />
          </motion.span>
        </button>
        <span
          v-if="ageTag"
          class="absolute top-3 right-3 rounded-md border border-white/30 bg-black/55 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm"
        >
          {{ ageTag.name }}
        </span>
      </div>
    </template>

    <template #title>
      <div
        class="grid min-h-18 grid-cols-1 items-start gap-2 min-[560px]:min-h-20 min-[560px]:gap-2.5 min-[1280px]:min-h-22"
      >
        <span
          class="line-clamp-2 text-[1.45rem] leading-[1.15] font-extrabold text-(--color-on-surface) min-[560px]:text-[1.65rem] min-[1280px]:text-[1.85rem]"
        >
          {{ game.title }}
        </span>
        <span
          class="flex h-5 items-center gap-1.5 text-xs font-bold text-(--color-on-surface-variant)"
          :aria-label="ratingAriaLabel"
        >
          <VueIcon
            :name="hasRating ? 'bs:star-fill' : 'bs:star'"
            :class="hasRating ? 'text-(--color-primary)' : 'text-(--color-on-surface-variant)'"
          />
          <span>{{ ratingLabel }}</span>
        </span>
      </div>
    </template>

    <template #subtitle>
      <p
        class="line-clamp-2 min-h-10 text-[0.8125rem] leading-[1.45] text-(--color-on-surface-variant) min-[560px]:min-h-11 min-[560px]:text-sm"
      >
        {{ game.description }}
      </p>
    </template>

    <template #content>
      <div
        class="flex min-h-12 flex-wrap content-start gap-1.5 border-b border-(--color-outline-variant) pb-3 min-[560px]:min-h-14 min-[560px]:gap-2 min-[560px]:pb-4"
      >
        <Tag
          v-for="tag in cardTags"
          :key="tag.name"
          :value="tag.name"
          class="border border-(--color-outline-variant)! bg-(--color-surface-container-high)! px-2.5! py-1! text-[0.6875rem]! font-semibold! text-(--color-on-surface-variant)! min-[560px]:px-3! min-[560px]:py-1.5! min-[560px]:text-xs!"
        />
      </div>
    </template>

    <template #footer>
      <div class="grid gap-2">
        <div class="min-h-8">
          <div
            v-if="!isOwned"
            class="text-[1.15rem] leading-none font-bold text-(--color-on-surface) min-[560px]:text-[1.35rem]"
            :class="isFree ? 'text-(--color-primary)!' : ''"
          >
            {{ formattedPrice }}
          </div>
          <div
            v-else
            class="text-[1.15rem] leading-none font-bold opacity-0 min-[560px]:text-[1.35rem]"
            aria-hidden="true"
          >
            {{ formattedPrice }}
          </div>
        </div>

        <div class="grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div
            class="flex min-w-0 flex-wrap items-center gap-1.5"
            :aria-label="t('game.platforms')"
          >
            <span
              v-for="platform in platformTags"
              :key="platform.name"
              class="flex h-7 w-7 items-center justify-center rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) text-base text-(--color-on-surface-variant)"
              :aria-label="getPlatformLabel(platform.name)"
              :title="getPlatformLabel(platform.name)"
            >
              <VueIcon :name="getPlatformIcon(platform.name)" />
            </span>
          </div>

          <Button
            v-if="isOwned"
            class="min-w-28 justify-center! gap-1.5! rounded-lg! border-(--color-primary)! bg-(--color-primary)! px-3! py-2.5! text-[0.875rem]! font-semibold! text-(--color-on-primary)! hover:border-(--color-primary-strong)! hover:bg-(--color-primary-strong)! min-[560px]:min-w-32 min-[560px]:gap-2! min-[560px]:px-4! min-[560px]:py-3! min-[560px]:text-[0.95rem]!"
            type="button"
            :aria-label="t('game.play')"
            @click.stop
          >
            <VueIcon name="bs:play-fill" class="text-[1.25rem] min-[560px]:text-[1.45rem]" />
            <span>{{ t('game.play') }}</span>
          </Button>

          <Button
            v-else
            :class="[
              'min-w-28 justify-center! gap-1.5! rounded-lg! px-3! py-2.5! text-[0.875rem]! font-semibold! min-[560px]:min-w-32 min-[560px]:gap-2! min-[560px]:px-4! min-[560px]:py-3! min-[560px]:text-[0.95rem]!',
              isInBasket
                ? 'border-(--color-primary)! bg-(--color-surface-container-high)! text-(--color-primary)! hover:border-(--color-primary-strong)! hover:bg-(--color-surface-container-highest)!'
                : 'border-(--color-primary)! bg-(--color-primary)! text-(--color-on-primary)! hover:border-(--color-primary-strong)! hover:bg-(--color-primary-strong)!',
              isBasketPending ? 'cursor-wait! opacity-85' : '',
            ]"
            type="button"
            :aria-label="basketLabel"
            :disabled="isBasketPending"
            @click.stop="emit('basketToggle', { id: game.id, price: game.price })"
          >
            <AnimatePresence mode="wait">
              <motion.span
                :key="basketIconKey"
                class="flex"
                :initial="{ opacity: 0, y: 8, scale: 0.92 }"
                :animate="{ opacity: 1, y: 0, scale: 1 }"
                :exit="{ opacity: 0, y: -8, scale: 0.92 }"
                :transition="{ duration: 0.16, ease: 'easeOut' }"
              >
                <i v-if="isBasketPending" class="pi pi-spin pi-spinner text-base" />
                <VueIcon
                  v-else
                  :name="basketIconName"
                  class="text-[1.25rem] min-[560px]:text-[1.45rem]"
                />
              </motion.span>
            </AnimatePresence>
            <span>{{ basketButtonText }}</span>
          </Button>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { buildAssetUrl } from '@/shared/lib/url'
import { formatRubPrice, isFreePrice } from '@/shared/lib/price'
import { getPlatformIcon, getPlatformLabel } from '@/shared/lib/platforms'
import { AnimatePresence, motion } from 'motion-v'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatGameRating } from '../lib/rating'
import { getTagTypeName } from '../lib/tags'
import type { GameListItem, GameListTagType } from '../types/game'

const props = withDefaults(
  defineProps<{
    game: GameListItem
    isFavorite?: boolean
    isFavoritePending?: boolean
    isInBasket?: boolean
    isBasketPending?: boolean
    isOwned?: boolean
  }>(),
  {
    isBasketPending: false,
    isFavorite: false,
    isFavoritePending: false,
    isInBasket: false,
    isOwned: false,
  },
)

const emit = defineEmits<{
  basketToggle: [game: Pick<GameListItem, 'id' | 'price'>]
  favoriteToggle: [game: Pick<GameListItem, 'id'>]
}>()

const apiUrl = import.meta.env.VITE_API_URL
const { t } = useI18n()

const cardTagTypes: GameListTagType[] = ['genre', 'mode', 'theme']

const cardTags = computed(() =>
  props.game.tags.filter((tag) => cardTagTypes.includes(getTagTypeName(tag))).slice(0, 3),
)

const coverImage = computed(
  () =>
    [...props.game.media.images].sort(
      (first, second) => (first.sort_order ?? 0) - (second.sort_order ?? 0),
    )[0],
)
const coverImageUrl = computed(() => buildAssetUrl(coverImage.value?.url, apiUrl))
const coverImageAlt = computed(() => coverImage.value?.alt || props.game.title)
const isFree = computed(() => isFreePrice(props.game.price))
const formattedPrice = computed(() =>
  isFree.value ? t('game.free') : formatRubPrice(props.game.price),
)
const ratingAverage = computed(() => props.game.rating?.average ?? null)
const ratingCount = computed(() => props.game.rating?.count ?? 0)
const hasRating = computed(() => ratingAverage.value !== null && ratingCount.value > 0)
const formattedRatingAverage = computed(() =>
  hasRating.value && ratingAverage.value !== null ? formatGameRating(ratingAverage.value) : '',
)
const ratingLabel = computed(() =>
  hasRating.value
    ? `${formattedRatingAverage.value} (${ratingCount.value})`
    : t('game.rating.empty'),
)
const ratingAriaLabel = computed(() =>
  hasRating.value
    ? t('game.rating.label', { average: formattedRatingAverage.value, count: ratingCount.value })
    : t('game.rating.empty'),
)

const ageTag = computed(() => props.game.tags.find((tag) => getTagTypeName(tag) === 'age'))
const platformTags = computed(() =>
  props.game.tags.filter((tag) => getTagTypeName(tag) === 'platforma'),
)
const favoriteIconName = computed(() => (props.isFavorite ? 'bs:heart-fill' : 'bs:heart'))
const favoriteIconKey = computed(() =>
  props.isFavoritePending ? 'favorite-pending' : favoriteIconName.value,
)
const favoriteLabel = computed(() =>
  props.isFavorite ? t('game.removeFromFavorites') : t('game.addToFavorites'),
)
const basketIconName = computed(() => (props.isInBasket ? 'bs:cart-check-fill' : 'bs:cart-plus'))
const basketIconKey = computed(() =>
  props.isBasketPending ? 'basket-pending' : basketIconName.value,
)
const basketButtonText = computed(() => {
  if (props.isBasketPending) {
    return t('game.cartUpdating')
  }

  return props.isInBasket ? t('game.inCart') : t('game.addToCart')
})
const basketLabel = computed(() =>
  props.isInBasket ? t('game.removeFromCart') : t('game.addToCart'),
)
</script>
