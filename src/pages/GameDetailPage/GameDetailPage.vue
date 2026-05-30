<template>
  <main
    class="min-h-[calc(100vh-4.5rem)] overflow-hidden bg-(--color-background) pb-12 text-(--color-on-surface)"
  >
    <PageLoader v-if="isLoading" />

    <RetryState
      v-else-if="loadError"
      class="mx-auto mt-18 max-w-2xl px-6"
      :title="t('gameDetails.loadErrorTitle')"
      :message="getMessage(loadError.message)"
      :action-label="t('mainPage.retry')"
      @retry="loadGame"
    />

    <template v-else-if="game">
      <RouterLink
        class="fixed top-24 left-[calc(20%+1.5rem)] z-40 inline-flex w-fit items-center gap-2 rounded-lg border border-(--color-outline-variant) bg-(--color-surface-container-high)/90 px-3 py-2 text-sm font-semibold text-(--color-on-surface-variant) shadow-lg backdrop-blur transition-colors hover:border-(--color-primary) hover:text-(--color-primary) max-[560px]:left-4"
        to="/"
      >
        <VueIcon name="bs:arrow-left" />
        <span>{{ t('gameDetails.back') }}</span>
      </RouterLink>

      <motion.section
        layout
        :initial="{ opacity: 0, scale: 0.96, y: 26 }"
        :animate="{ opacity: 1, scale: 1, y: 0 }"
        :transition="{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }"
        class="relative"
      >
        <div class="absolute inset-x-0 top-0 h-[34rem] overflow-hidden">
          <video
            v-if="backgroundVideoUrl"
            class="h-full w-full object-cover opacity-55"
            :src="backgroundVideoUrl"
            autoplay
            muted
            loop
            playsinline
          ></video>
          <img
            v-else-if="heroImageUrl"
            class="h-full w-full object-cover opacity-50"
            :src="heroImageUrl"
            :alt="heroImageAlt"
          />
          <div
            class="absolute inset-0 bg-linear-to-b from-black/25 via-(--color-background)/58 to-(--color-background)"
          ></div>
        </div>

        <div
          class="relative mx-auto grid max-w-7xl gap-6 px-6 pt-24 min-[560px]:px-8 min-[1024px]:grid-cols-[minmax(0,1fr)_22rem] min-[1024px]:px-12 min-[1280px]:px-20"
        >
          <section class="grid gap-5">
            <motion.div
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.34, delay: 0.08, ease: 'easeOut' }"
              class="grid gap-3"
            >
              <div class="flex flex-wrap items-center gap-2">
                <GameTagPill v-for="tag in primaryTags" :key="tag.name" :tag="tag" />
              </div>
              <h1 class="max-w-4xl text-4xl leading-none font-black min-[560px]:text-6xl">
                {{ game.title }}
              </h1>
              <p class="max-w-3xl text-base leading-7 text-(--color-on-surface-variant)">
                {{ game.description }}
              </p>
            </motion.div>

            <GameMediaGallery :items="mediaItems" @select="selectMedia" />
            <GameReviews
              :can-review="canReview"
              :is-authenticated="isAuthenticated"
              :is-deleting="isReviewDeleting"
              :is-loading="isReviewsLoading"
              :is-owned="isCurrentGameOwned"
              :is-saving="isReviewSaving"
              :my-review="myReview"
              :reviews="reviews"
              @delete="handleReviewDelete"
              @submit="handleReviewSubmit"
            />
          </section>

          <GamePurchasePanel
            :is-basket-pending="isCurrentGameBasketPending"
            :is-favorite="isCurrentGameFavorite"
            :is-favorite-pending="isCurrentGameFavoritePending"
            :is-in-basket="isCurrentGameInBasket"
            :is-owned="isCurrentGameOwned"
            :price="game.price"
            :rating="ratingAverage"
            :rating-count="ratingCount"
            :tag-groups="tagGroups"
            @basket-toggle="handleBasketToggle"
            @favorite-toggle="handleFavoriteToggle"
          />
        </div>

        <GameMediaDialog v-model:visible="isMediaDialogVisible" :media="selectedMedia" />
      </motion.section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { useAuth, useAuthPrompt } from '@/modules/auth'
import { useBasket, type BasketGame } from '@/modules/basket'
import { useFavorites, type FavoriteGameId } from '@/modules/favorite'
import {
  useGame,
  useGameReviews,
  type Game,
  type GameDetailMediaItem,
  type GameListTag,
  type GameReviewPayload,
} from '@/modules/game'
import { getTagTypeName } from '@/modules/game/lib/tags'
import GameMediaDialog from '@/modules/game/ui/details/GameMediaDialog.vue'
import GameMediaGallery from '@/modules/game/ui/details/GameMediaGallery.vue'
import GamePurchasePanel from '@/modules/game/ui/details/GamePurchasePanel.vue'
import GameReviews from '@/modules/game/ui/details/GameReviews.vue'
import GameTagPill from '@/modules/game/ui/details/GameTagPill.vue'
import { useLibrary } from '@/modules/library'
import { buildAssetUrl } from '@/shared/lib/url'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { PageLoader, RetryState } from '@/shared/ui'
import { motion } from 'motion-v'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const { t } = useI18n()
const { game, getGame, isLoading, loadError } = useGame()
const {
  clearMyReview,
  createGameReview,
  deleteMyGameReview,
  getGameReviews,
  getMyGameReview,
  isReviewDeleting,
  isReviewSaving,
  isReviewsLoading,
  myReview,
  resetGameReviews,
  reviews,
  updateMyGameReview,
} = useGameReviews()
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
const { clearLibraryState, getLibraryIds, hasLibraryIdsLoaded, isLibraryIdsLoading, libraryIds } =
  useLibrary()
const { showApiError } = useApiErrorToast()
const { getMessage } = useI18nMessage()

const selectedMediaId = ref<string | null>(null)
const isMediaDialogVisible = ref(false)
const apiUrl = import.meta.env.VITE_API_URL
let userMarksLoaded = false
let isPageActive = true

const routeGameId = computed(() => {
  if (route.name !== 'game-details') {
    return null
  }

  const id = route.params.id
  return typeof id === 'string' ? id : null
})
const mediaItems = computed<GameDetailMediaItem[]>(() =>
  game.value ? buildMediaItems(game.value, apiUrl) : [],
)

const selectedMedia = computed(
  () => mediaItems.value.find((item) => item.id === selectedMediaId.value) ?? mediaItems.value[0],
)
const heroImage = computed(() => mediaItems.value.find((item) => item.type === 'image'))
const heroImageUrl = computed(() => heroImage.value?.url)
const heroImageAlt = computed(() => heroImage.value?.alt ?? game.value?.title ?? '')
const backgroundVideoUrl = computed(
  () => mediaItems.value.find((item) => item.type === 'video' && item.isPlayable)?.url,
)
const ratingAverage = computed(() => game.value?.rating?.average ?? null)
const ratingCount = computed(() => game.value?.rating?.count ?? 0)
const favoriteIdSet = computed(() => new Set(favoriteIds.value))
const basketIdSet = computed(() => new Set(basketIds.value))
const libraryIdSet = computed(() => new Set(libraryIds.value))
const currentGameId = computed(() => game.value?.id)
const isCurrentGameFavorite = computed(
  () => !!currentGameId.value && favoriteIdSet.value.has(currentGameId.value),
)
const isCurrentGameFavoritePending = computed(
  () => !!currentGameId.value && pendingFavoriteIds.value.includes(currentGameId.value),
)
const isCurrentGameInBasket = computed(
  () => !!currentGameId.value && basketIdSet.value.has(currentGameId.value),
)
const isCurrentGameBasketPending = computed(
  () => !!currentGameId.value && pendingBasketIds.value.includes(currentGameId.value),
)
const isCurrentGameOwned = computed(
  () => !!currentGameId.value && libraryIdSet.value.has(currentGameId.value),
)
const canReview = computed(() => isAuthenticated.value && isCurrentGameOwned.value)
const primaryTags = computed(() =>
  (game.value?.tags ?? [])
    .filter((tag) => ['genre', 'mode', 'theme'].includes(getTagTypeName(tag)))
    .slice(0, 5),
)
const tagGroups = computed(() => {
  const groups = new Map<string, GameListTag[]>()

  for (const tag of game.value?.tags ?? []) {
    const groupName = getTagTypeName(tag)
    groups.set(groupName, [...(groups.get(groupName) ?? []), tag])
  }

  return [...groups.entries()].map(([name, tags]) => ({ name, tags }))
})

const selectMedia = (id: string): void => {
  selectedMediaId.value = id
  isMediaDialogVisible.value = true
}

const showPageApiError = (error: unknown): void => {
  if (isPageActive) {
    showApiError(error)
  }
}

const loadGame = async (): Promise<void> => {
  if (!routeGameId.value) {
    return
  }

  try {
    await getGame(routeGameId.value)
  } catch (error: unknown) {
    showPageApiError(error)
  }
}

const loadGameReviews = async (): Promise<void> => {
  if (!routeGameId.value) {
    return
  }

  try {
    await getGameReviews(routeGameId.value)

    if (isAuthenticated.value) {
      await getMyGameReview(routeGameId.value)
    } else {
      clearMyReview()
    }
  } catch (error: unknown) {
    showPageApiError(error)
  }
}

const loadBasketIdsIfNeeded = async (): Promise<void> => {
  if (hasBasketIdsLoaded.value || isBasketIdsLoading.value) {
    return
  }

  await getBasketIds()
}

const loadLibraryIdsIfNeeded = async (): Promise<void> => {
  if (hasLibraryIdsLoaded.value || isLibraryIdsLoading.value) {
    return
  }

  await getLibraryIds()
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

  await Promise.all([getFavoriteIds(), loadBasketIdsIfNeeded(), loadLibraryIdsIfNeeded()])
  userMarksLoaded = true
}

const loadUserMarksSafely = async (): Promise<void> => {
  try {
    await loadUserMarks()
  } catch (error: unknown) {
    showPageApiError(error)
  }
}

const refreshAfterReviewMutation = async (): Promise<void> => {
  await Promise.all([loadGame(), loadGameReviews()])
}

const handleFavoriteToggle = async (): Promise<void> => {
  if (!game.value) {
    return
  }

  if (!isAuthenticated.value) {
    requestAuthPrompt()
    return
  }

  try {
    await toggleFavorite(game.value.id as FavoriteGameId, isCurrentGameFavorite.value)
  } catch (error: unknown) {
    showPageApiError(error)
  }
}

const handleBasketToggle = async (): Promise<void> => {
  if (!game.value) {
    return
  }

  if (!isAuthenticated.value) {
    requestAuthPrompt()
    return
  }

  try {
    await toggleBasketItem(
      { id: game.value.id, price: game.value.price } satisfies Pick<BasketGame, 'id' | 'price'>,
      isCurrentGameInBasket.value,
    )
  } catch (error: unknown) {
    showPageApiError(error)
  }
}

const handleReviewSubmit = async (payload: GameReviewPayload): Promise<void> => {
  if (!routeGameId.value) {
    return
  }

  if (!isAuthenticated.value) {
    requestAuthPrompt()
    return
  }

  if (!canReview.value) {
    return
  }

  try {
    if (myReview.value) {
      await updateMyGameReview(routeGameId.value, payload)
    } else {
      await createGameReview(routeGameId.value, payload)
    }

    await refreshAfterReviewMutation()
  } catch (error: unknown) {
    showPageApiError(error)
  }
}

const handleReviewDelete = async (): Promise<void> => {
  if (!routeGameId.value) {
    return
  }

  if (!myReview.value) {
    return
  }

  try {
    await deleteMyGameReview(routeGameId.value)
    await refreshAfterReviewMutation()
  } catch (error: unknown) {
    showPageApiError(error)
  }
}

const isDirectVideoUrl = (url: string): boolean => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)

const buildMediaItems = (currentGame: Game, apiBaseUrl: string): GameDetailMediaItem[] => {
  const images = currentGame.media.images
    .map((image, index) => ({
      id: `image-${image.id ?? index}`,
      type: 'image' as const,
      url: buildAssetUrl(image.url, apiBaseUrl) ?? '',
      alt: image.alt || currentGame.title,
      isPlayable: true,
      title: image.alt || currentGame.title,
      sortOrder: image.sort_order ?? index,
    }))
    .filter((item) => item.url)

  const videos = (currentGame.media.videos ?? [])
    .map((video, index) => ({
      id: `video-${video.id ?? index}`,
      type: 'video' as const,
      url: buildAssetUrl(video.url, apiBaseUrl) ?? '',
      alt: video.title || currentGame.title,
      isPlayable: isDirectVideoUrl(video.url),
      title: video.title || currentGame.title,
      sortOrder: 1000 + index,
    }))
    .filter((item) => item.url)

  return [...images, ...videos].sort((first, second) => first.sortOrder - second.sortOrder)
}

onMounted(() => {
  loadGame()
  loadGameReviews()
  loadUserMarksSafely()
})

onBeforeUnmount(() => {
  isPageActive = false
})

watch([isSessionInitialized, isAuthenticated], async () => {
  if (!routeGameId.value) {
    return
  }

  await loadUserMarksSafely()
  await loadGameReviews()
})

watch(routeGameId, () => {
  if (!routeGameId.value) {
    return
  }

  selectedMediaId.value = null
  isMediaDialogVisible.value = false
  resetGameReviews()
  loadGame()
  loadGameReviews()
})
</script>
