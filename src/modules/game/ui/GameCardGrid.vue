<template>
  <AnimatePresence
    mode="popLayout"
    as="div"
    class="relative grid auto-rows-fr grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),20rem))] justify-center gap-5"
  >
    <motion.div
      v-for="game in games"
      :key="game.id"
      class="mobile-motion-layer cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-primary)"
      layout="position"
      role="button"
      tabindex="0"
      :initial="cardInitial"
      :while-in-view="cardInView"
      :viewport="cardViewport"
      :exit="cardExit"
      :while-hover="cardHover"
      :while-tap="{ scale: 0.985 }"
      :transition="cardTransition"
      @click="emit('gameSelect', game.id)"
      @keydown.enter.prevent="emit('gameSelect', game.id)"
      @keydown.space.prevent="emit('gameSelect', game.id)"
    >
      <GameCardItem
        :game="game"
        :is-favorite="favoriteIdSet.has(game.id)"
        :is-favorite-pending="pendingFavoriteIdSet.has(game.id)"
        :is-in-basket="basketIdSet.has(game.id)"
        :is-basket-pending="pendingBasketIdSet.has(game.id)"
        :is-owned="forceOwned || ownedIdSet.has(game.id)"
        @basket-toggle="emit('basketToggle', $event)"
        @favorite-toggle="emit('favoriteToggle', $event)"
      />
    </motion.div>
  </AnimatePresence>
</template>

<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'
import type { GameListItem } from '../types/game'
import GameCardItem from './GameCardItem.vue'

type GameId = GameListItem['id']

const props = withDefaults(
  defineProps<{
    basketIds?: GameId[]
    forceOwned?: boolean
    games: GameListItem[]
    favoriteIds?: GameId[]
    ownedIds?: GameId[]
    pendingBasketIds?: GameId[]
    pendingFavoriteIds?: GameId[]
  }>(),
  {
    basketIds: () => [],
    favoriteIds: () => [],
    forceOwned: false,
    ownedIds: () => [],
    pendingBasketIds: () => [],
    pendingFavoriteIds: () => [],
  },
)

const emit = defineEmits<{
  basketToggle: [game: Pick<GameListItem, 'id' | 'price'>]
  favoriteToggle: [game: Pick<GameListItem, 'id'>]
  gameSelect: [id: GameId]
}>()

const isMobileViewport = useMediaQuery('(max-width: 760px)')
const cardInitial = computed(() =>
  isMobileViewport.value ? { opacity: 0, y: 16 } : { opacity: 0, y: 28, scale: 0.96 },
)
const cardInView = computed(() =>
  isMobileViewport.value ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 },
)
const cardExit = computed(() =>
  isMobileViewport.value ? { opacity: 0, y: 10 } : { opacity: 0, y: 16, scale: 0.92 },
)
const cardHover = computed(() => (isMobileViewport.value ? { y: 0 } : { y: -8, scale: 1.015 }))
const cardViewport = computed(() => ({
  once: true,
  amount: isMobileViewport.value ? 0.08 : 0.16,
  margin: isMobileViewport.value ? '0px 0px -12% 0px' : '0px',
}))
const cardTransition = computed(() => ({
  layout: {
    duration: isMobileViewport.value ? 0.24 : 0.32,
    ease: [0.22, 1, 0.36, 1] as const,
  },
  opacity: { duration: isMobileViewport.value ? 0.24 : 0.22, ease: 'easeOut' as const },
  y: { duration: isMobileViewport.value ? 0.24 : 0.28, ease: 'easeOut' as const },
  scale: { duration: isMobileViewport.value ? 0.12 : 0.18, ease: 'easeOut' as const },
}))
const basketIdSet = computed(() => new Set(props.basketIds))
const favoriteIdSet = computed(() => new Set(props.favoriteIds))
const ownedIdSet = computed(() => new Set(props.ownedIds))
const pendingBasketIdSet = computed(() => new Set(props.pendingBasketIds))
const pendingFavoriteIdSet = computed(() => new Set(props.pendingFavoriteIds))
</script>
