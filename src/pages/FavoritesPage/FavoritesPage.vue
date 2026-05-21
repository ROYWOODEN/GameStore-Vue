<template>
  <main
    class="min-h-[calc(100vh-5rem)] bg-(--color-background) px-6 pt-8 pb-12 min-[560px]:px-8 min-[1024px]:px-12 min-[1280px]:px-20"
  >
    <PageLoader v-if="isFavoritesLoading" />

    <section v-else-if="favorites.length > 0">
      <AnimatePresence
        mode="popLayout"
        as="div"
        class="relative grid auto-rows-fr grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),20rem))] justify-center gap-5"
      >
        <motion.div
          v-for="game in favorites"
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
            is-favorite
            :is-favorite-pending="pendingFavoriteIdSet.has(game.id)"
            @favorite-toggle="handleFavoriteToggle"
          />
        </motion.div>
      </AnimatePresence>
    </section>

    <RetryState
      v-else-if="favoritesLoadError"
      :title="t('favoritesPage.loadErrorTitle')"
      :message="getMessage(favoritesLoadError.message)"
      :action-label="t('favoritesPage.retry')"
      @retry="handleRetry"
    />

    <section v-else>
      <div
        class="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center gap-3 text-center"
      >
        <div
          class="mb-1 flex h-16 w-16 items-center justify-center rounded-full border border-(--color-outline-variant) bg-(--color-surface-container-high) text-3xl text-(--color-primary)"
          aria-hidden="true"
        >
          <VueIcon name="bs:heart" />
        </div>
        <h1 class="text-2xl font-bold text-(--color-on-surface)">
          {{ t('favoritesPage.emptyTitle') }}
        </h1>
        <p class="text-sm leading-6 text-(--color-on-surface-variant)">
          {{ t('favoritesPage.emptyDescription') }}
        </p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useFavorites, type FavoriteGameId } from '@/modules/favorite'
import { GameCardItem } from '@/modules/game'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { PageLoader, RetryState } from '@/shared/ui'
import { AnimatePresence, motion } from 'motion-v'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { showApiError } = useApiErrorToast()
const { getMessage } = useI18nMessage()
const {
  favorites,
  favoritesLoadError,
  getFavorites,
  isFavoritesLoading,
  pendingFavoriteIds,
  removeFavorite,
} = useFavorites()

const pendingFavoriteIdSet = computed(() => new Set(pendingFavoriteIds.value))

const loadFavoritesPage = async (): Promise<void> => {
  try {
    await getFavorites()
  } catch (error: unknown) {
    showApiError(error)
  }
}

const handleRetry = (): void => {
  loadFavoritesPage()
}

const handleFavoriteToggle = async (game: { id: FavoriteGameId }): Promise<void> => {
  try {
    await removeFavorite(game.id)
  } catch (error: unknown) {
    showApiError(error)
  }
}

onMounted(() => {
  loadFavoritesPage()
})
</script>
