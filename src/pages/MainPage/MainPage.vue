<template>
  <main
    class="min-h-[calc(100vh-5rem)] bg-(--color-background) px-6 pt-8 pb-12 min-[560px]:px-8 min-[1024px]:px-12 min-[1280px]:px-20"
  >
    <PageLoader v-if="isLoading" />
    <section v-else-if="games.length > 0" class="grid gap-4">
      <GameCardGrid
        :games="games"
        :favorite-ids="favoriteIds"
        :pending-favorite-ids="pendingFavoriteIds"
        :basket-ids="basketIds"
        :pending-basket-ids="pendingBasketIds"
        :owned-ids="libraryIds"
        @basket-toggle="handleBasketToggle"
        @favorite-toggle="handleFavoriteToggle"
        @game-select="openGame"
      />

      <PageLoader v-if="isLoadingMore" compact />
      <div
        v-else-if="loadMoreErrorMessage"
        class="flex flex-wrap items-center justify-center gap-3 py-6 text-sm font-semibold text-(--color-error)"
        role="alert"
      >
        <span class="inline-flex items-center gap-2">
          <i class="pi pi-exclamation-triangle" />
          <span>{{ loadMoreErrorMessage }}</span>
        </span>
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          size="small"
          :label="t('mainPage.retry')"
          @click="loadMoreGames"
        />
      </div>
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
import { toApiError } from '@/shared/api/error'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { PageLoader, RetryState } from '@/shared/ui'
import Button from 'primevue/button'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => void
}

const { t } = useI18n()
const router = useRouter()

const { getGames, games, isLoading, isLoadingMore, loadError, pagination } = useGames()
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
const loadMoreError = ref<string | null>(null)
const pageLimit = 20
const scrollLoadThreshold = 520
let userMarksLoaded = false

const loadMoreErrorMessage = computed(() =>
  loadMoreError.value ? getMessage(loadMoreError.value) : null,
)

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
  loadMoreError.value = null

  try {
    await getGames({
      limit: pageLimit,
      page: 1,
    })
    await loadUserMarks()
  } catch (error: unknown) {
    showApiError(error)
  } finally {
    queueScrollCheck()
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
  window.addEventListener('scroll', handleWindowScroll, { passive: true })
  loadMainPage()
})

const queueScrollCheck = (): void => {
  window.requestAnimationFrame(handleWindowScroll)
}

const handleWindowScroll = (): void => {
  if (
    isLoading.value ||
    isLoadingMore.value ||
    loadMoreError.value ||
    !pagination.value.hasNextPage
  ) {
    return
  }

  const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
  const scrollPosition = window.scrollY + window.innerHeight

  if (scrollPosition >= documentHeight - scrollLoadThreshold) {
    void loadMoreGames()
  }
}

const loadMoreGames = async (): Promise<void> => {
  if (isLoading.value || isLoadingMore.value || !pagination.value.hasNextPage) {
    return
  }

  try {
    loadMoreError.value = null
    await getGames(
      {
        limit: pagination.value.limit || pageLimit,
        page: pagination.value.page + 1,
      },
      {
        append: true,
      },
    )
    queueScrollCheck()
  } catch (error: unknown) {
    const apiError = toApiError(error)
    loadMoreError.value = apiError.message
    showApiError(apiError)
  }
}

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

const openGame = (id: string): void => {
  const navigate = () => router.push({ name: 'game-details', params: { id } })
  const transitionDocument = document as ViewTransitionDocument

  if (transitionDocument.startViewTransition) {
    transitionDocument.startViewTransition(navigate)
    return
  }

  navigate()
}

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleWindowScroll)
})
</script>
