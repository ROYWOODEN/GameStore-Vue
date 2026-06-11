<template>
  <main
    class="min-h-[calc(100vh-5rem)] bg-(--color-background) px-6 pt-8 pb-12 min-[560px]:px-8 min-[1024px]:px-12 min-[1280px]:px-20"
  >
    <PageLoader v-if="isFavoritesLoading" />

    <section v-else-if="favorites.length > 0">
      <GameCardGrid
        :games="favorites"
        :favorite-ids="favoriteIds"
        :pending-favorite-ids="pendingFavoriteIds"
        :basket-ids="basketIds"
        :pending-basket-ids="pendingBasketIds"
        :owned-ids="libraryIds"
        @basket-toggle="handleBasketToggle"
        @favorite-toggle="handleFavoriteToggle"
        @game-select="openGame"
      />
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
import { useBasket, type BasketGame } from '@/modules/basket'
import { useFavorites, type FavoriteGameId } from '@/modules/favorite'
import { GameCardGrid } from '@/modules/game'
import { useLibrary } from '@/modules/library'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { PageLoader, RetryState } from '@/shared/ui'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const { showApiError } = useApiErrorToast()
const { getMessage } = useI18nMessage()
const {
  favoriteIds,
  favorites,
  favoritesLoadError,
  getFavorites,
  isFavoritesLoading,
  pendingFavoriteIds,
  removeFavorite,
} = useFavorites()
const {
  basketIds,
  getBasketIds,
  hasBasketIdsLoaded,
  isBasketIdsLoading,
  pendingBasketIds,
  toggleBasketItem,
} = useBasket()
const { getLibraryIds, libraryIds } = useLibrary()

const basketIdSet = computed(() => new Set(basketIds.value))

const loadBasketIdsIfNeeded = async (): Promise<void> => {
  if (hasBasketIdsLoaded.value || isBasketIdsLoading.value) {
    return
  }

  await getBasketIds()
}

const loadFavoritesPage = async (): Promise<void> => {
  try {
    await Promise.all([getFavorites(), loadBasketIdsIfNeeded(), getLibraryIds()])
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

const handleBasketToggle = async (game: Pick<BasketGame, 'id' | 'price'>): Promise<void> => {
  try {
    await toggleBasketItem(game, basketIdSet.value.has(game.id))
  } catch (error: unknown) {
    showApiError(error)
  }
}

const openGame = (id: string): void => {
  router.push({ name: 'game-details', params: { id } })
}

onMounted(() => {
  loadFavoritesPage()
})
</script>
