<template>
  <main
    class="min-h-[calc(100vh-5rem)] bg-(--color-background) px-6 pt-8 pb-12 min-[560px]:px-8 min-[1024px]:px-12 min-[1280px]:px-20"
  >
    <PageLoader v-if="isLoading" />
    <section v-else-if="games.length > 0">
      <GameCardGrid
        :games="games"
        :favorite-ids="favoriteIds"
        :pending-favorite-ids="pendingFavoriteIds"
        :basket-ids="basketIds"
        :pending-basket-ids="pendingBasketIds"
        :owned-ids="libraryIds"
        @basket-toggle="handleBasketToggle"
        @favorite-toggle="handleFavoriteToggle"
      />
    </section>
    <RetryState
      v-else-if="loadError"
      :title="t('mainPage.loadErrorTitle')"
      :message="getMessage(loadError.message)"
      :action-label="t('mainPage.retry')"
      @retry="handleRetry"
    />
    <section v-else>
      <div
        class="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center gap-3 text-center"
      >
        <h1 class="text-2xl font-bold text-(--color-on-surface)">
          {{ t('mainPage.emptyTitle') }}
        </h1>
        <p class="text-sm leading-6 text-(--color-on-surface-variant)">
          {{ t('mainPage.emptyDescription') }}
        </p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useAuth, useAuthPrompt } from '@/modules/auth'
import { useBasket, type BasketGame } from '@/modules/basket'
import { useFavorites, type FavoriteGameId } from '@/modules/favorite'
import { GameCardGrid, useGames } from '@/modules/game'
import { useLibrary } from '@/modules/library'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { PageLoader, RetryState } from '@/shared/ui'
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { getGames, games, isLoading, loadError } = useGames()
const { isAuthenticated, isSessionInitialized } = useAuth()
const { requestAuthPrompt } = useAuthPrompt()
const { clearFavorites, favoriteIds, getFavoriteIds, pendingFavoriteIds, toggleFavorite } =
  useFavorites()
const {
  basketIds,
  clearBasketState,
  getBasketIds,
  hasBasketIdsLoaded,
  isBasketIdsLoading,
  pendingBasketIds,
  toggleBasketItem,
} = useBasket()
const { clearLibraryState, getLibraryIds, libraryIds } = useLibrary()

const { showApiError } = useApiErrorToast()
const { getMessage } = useI18nMessage()

const favoriteIdSet = computed(() => new Set(favoriteIds.value))
const basketIdSet = computed(() => new Set(basketIds.value))
let userMarksLoaded = false

const loadBasketIdsIfNeeded = async (): Promise<void> => {
  if (hasBasketIdsLoaded.value || isBasketIdsLoading.value) {
    return
  }

  await getBasketIds()
}

const loadUserMarks = async (): Promise<void> => {
  if (!isSessionInitialized.value) {
    return
  }

  if (!isAuthenticated.value) {
    userMarksLoaded = false
    clearFavorites()
    clearBasketState()
    clearLibraryState()
    return
  }

  if (userMarksLoaded) {
    return
  }

  await Promise.all([getFavoriteIds(), loadBasketIdsIfNeeded(), getLibraryIds()])
  userMarksLoaded = true
}

const loadMainPage = async (): Promise<void> => {
  try {
    await getGames()
    await loadUserMarks()
  } catch (error: unknown) {
    showApiError(error)
  }
}

const handleRetry = (): void => {
  loadMainPage()
}

const handleFavoriteToggle = async (game: { id: FavoriteGameId }): Promise<void> => {
  if (!isAuthenticated.value) {
    requestAuthPrompt()
    return
  }

  try {
    await toggleFavorite(game.id, favoriteIdSet.value.has(game.id))
  } catch (error: unknown) {
    showApiError(error)
  }
}

onMounted(() => {
  loadMainPage()
})

watch([isSessionInitialized, isAuthenticated], async ([sessionInitialized, authenticated]) => {
  if (!sessionInitialized) {
    return
  }

  if (!authenticated) {
    userMarksLoaded = false
    clearFavorites()
    clearBasketState()
    clearLibraryState()
    return
  }

  try {
    await loadUserMarks()
  } catch (error: unknown) {
    showApiError(error)
  }
})

const handleBasketToggle = async (game: Pick<BasketGame, 'id' | 'price'>): Promise<void> => {
  if (!isAuthenticated.value) {
    requestAuthPrompt()
    return
  }

  try {
    await toggleBasketItem(game, basketIdSet.value.has(game.id))
  } catch (error: unknown) {
    showApiError(error)
  }
}
</script>
