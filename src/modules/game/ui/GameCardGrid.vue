<template>
  <AnimatePresence
    mode="popLayout"
    as="div"
    class="relative grid auto-rows-fr grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),20rem))] justify-center gap-5"
  >
    <motion.div
      v-for="game in games"
      :key="game.id"
      layout="position"
      :initial="{ opacity: 0, y: 28, scale: 0.96 }"
      :animate="{ opacity: 1, y: 0, scale: 1 }"
      :exit="{ opacity: 0, y: 16, scale: 0.92 }"
      :while-hover="{ y: -8, scale: 1.015 }"
      :while-tap="{ scale: 0.985 }"
      :transition="{
        layout: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.22, ease: 'easeOut' },
        y: { duration: 0.28, ease: 'easeOut' },
        scale: { duration: 0.18, ease: 'easeOut' },
      }"
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
}>()

const basketIdSet = computed(() => new Set(props.basketIds))
const favoriteIdSet = computed(() => new Set(props.favoriteIds))
const ownedIdSet = computed(() => new Set(props.ownedIds))
const pendingBasketIdSet = computed(() => new Set(props.pendingBasketIds))
const pendingFavoriteIdSet = computed(() => new Set(props.pendingFavoriteIds))
</script>
