<template>
  <main
    class="min-h-[calc(100vh-5rem)] bg-(--color-background) px-6 pt-8 pb-12 min-[560px]:px-8 min-[1024px]:px-12 min-[1280px]:px-20"
  >
    <button
      v-if="selectedGenre"
      class="fixed top-24 left-[calc(20%+1.5rem)] z-40 inline-flex w-fit items-center gap-2 rounded-lg border border-(--color-outline-variant) bg-(--color-surface-container-high)/90 px-3 py-2 text-sm font-semibold text-(--color-on-surface-variant) shadow-lg backdrop-blur transition-colors hover:border-(--color-primary) hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) max-[560px]:left-4"
      type="button"
      @click="backToShowcase"
    >
      <VueIcon name="bs:arrow-left" />
      <span>{{ t('catalog.back') }}</span>
    </button>

    <AnimatePresence mode="wait">
      <motion.section
        v-if="!selectedGenre"
        key="catalog-showcase"
        class="grid gap-7"
        :initial="{ opacity: 0, y: 18, scale: 0.985 }"
        :animate="{ opacity: 1, y: 0, scale: 1 }"
        :exit="{ opacity: 0, y: -18, scale: 0.985 }"
        :transition="{ duration: 0.28, ease: 'easeOut' }"
      >
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div class="grid gap-2">
            <h1 class="text-3xl font-black text-(--color-on-surface)">
              {{ t('catalog.title') }}
            </h1>
            <p class="max-w-2xl text-sm leading-6 text-(--color-on-surface-variant)">
              {{ t('catalog.subtitle') }}
            </p>
          </div>

          <RouterLink
            class="inline-flex h-11 items-center gap-2 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-4 text-sm font-extrabold text-(--color-on-surface) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
            :to="{ name: 'search' }"
          >
            <VueIcon name="bs:sliders" />
            <span>{{ t('catalog.advancedSearch') }}</span>
          </RouterLink>
        </div>

        <PageLoader v-if="isCatalogLoading" />
        <RetryState
          v-else-if="catalogLoadError"
          :title="t('catalog.loadErrorTitle')"
          :message="getMessage(catalogLoadError.message)"
          :action-label="t('catalog.retry')"
          @retry="loadCatalog"
        />

        <section v-else class="grid gap-4 min-[920px]:grid-cols-2">
          <motion.button
            v-for="genre in genres"
            :key="genre.id"
            class="group relative min-h-[18rem] cursor-pointer overflow-hidden rounded-md border border-(--color-outline-variant) text-left shadow-[0_18px_48px_rgb(0_0_0/0.18)] transition-colors hover:border-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-primary) min-[560px]:min-h-[21rem]"
            type="button"
            :initial="{ opacity: 0, y: 26, scale: 0.96 }"
            :animate="{ opacity: 1, y: 0, scale: 1 }"
            :while-hover="{ y: -6, scale: 1.01 }"
            :while-tap="{ scale: 0.985 }"
            :transition="{ duration: 0.22, ease: 'easeOut' }"
            @click="selectGenre(genre.id)"
          >
            <img
              v-if="getGenreCoverUrl(genre)"
              :src="getGenreCoverUrl(genre) ?? undefined"
              :alt="genre.cover?.alt || genre.name"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center bg-(--color-surface-container-high) text-6xl text-(--color-on-surface-variant)"
            >
              <VueIcon name="bs:image" />
            </div>

            <div
              class="absolute inset-0 bg-linear-to-t from-black/88 via-black/38 to-black/10"
            ></div>
            <div class="absolute inset-x-0 bottom-0 grid gap-3 p-5 text-white min-[560px]:p-7">
              <span
                class="w-fit rounded-md border border-white/25 bg-white/12 px-3 py-1 text-xs font-bold backdrop-blur-sm"
              >
                {{ getGamesCount(genre) }}
              </span>
              <span class="text-[clamp(2rem,4vw,3.8rem)] leading-none font-black">
                {{ genre.name }}
              </span>
            </div>
          </motion.button>
        </section>
      </motion.section>

      <motion.section
        v-else
        key="catalog-genre"
        class="grid gap-6"
        :initial="{ opacity: 0, x: 38, scale: 0.985 }"
        :animate="{ opacity: 1, x: 0, scale: 1 }"
        :exit="{ opacity: 0, x: -38, scale: 0.985 }"
        :transition="{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }"
      >
        <div class="h-10" aria-hidden="true"></div>

        <section
          class="relative min-h-72 overflow-hidden rounded-md border border-(--color-outline-variant) bg-(--color-surface-container)"
        >
          <img
            v-if="getGenreCoverUrl(selectedGenre)"
            :src="getGenreCoverUrl(selectedGenre) ?? undefined"
            :alt="selectedGenre.cover?.alt || selectedGenre.name"
            class="absolute inset-0 h-full w-full object-cover opacity-65"
          />
          <div class="absolute inset-0 bg-linear-to-r from-black/88 via-black/48 to-black/12"></div>
          <div class="relative grid min-h-72 content-end gap-3 p-6 text-white min-[720px]:p-8">
            <span
              class="w-fit rounded-md border border-white/25 bg-white/12 px-3 py-1 text-xs font-bold backdrop-blur-sm"
            >
              {{ getGamesCount(selectedGenre) }}
            </span>
            <h1 class="max-w-4xl text-4xl leading-none font-black min-[720px]:text-6xl">
              {{ selectedGenre.name }}
            </h1>
            <p class="max-w-2xl text-sm leading-6 text-white/78">
              {{ t('catalog.selectedSubtitle') }}
            </p>
          </div>
        </section>

        <PageLoader v-if="isLoading" />
        <RetryState
          v-else-if="loadError"
          :title="t('catalog.gamesLoadErrorTitle')"
          :message="getMessage(loadError.message)"
          :action-label="t('catalog.retry')"
          @retry="loadSelectedGenreGames"
        />
        <GameCardGrid
          v-else-if="games.length > 0"
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
        <section
          v-else
          class="flex min-h-60 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-(--color-outline-variant) bg-(--color-surface-container) px-6 text-center"
        >
          <VueIcon name="bs:emoji-neutral" class="text-4xl text-(--color-primary)" />
          <h2 class="text-xl font-extrabold text-(--color-on-surface)">
            {{ t('catalog.emptyTitle') }}
          </h2>
          <p class="max-w-md text-sm leading-6 text-(--color-on-surface-variant)">
            {{ t('catalog.emptyDescription') }}
          </p>
        </section>

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
            :label="t('catalog.retry')"
            @click="loadMoreGames"
          />
        </div>
      </motion.section>
    </AnimatePresence>
  </main>
</template>

<script setup lang="ts">
import { useAuth, useAuthPrompt } from '@/modules/auth'
import { useBasket, type BasketGame } from '@/modules/basket'
import { useFavorites, type FavoriteGameId } from '@/modules/favorite'
import { fetchCatalogGenres, GameCardGrid, useGameSearch, type CatalogGenre } from '@/modules/game'
import { useLibrary } from '@/modules/library'
import { toApiError } from '@/shared/api/error'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { buildAssetUrl } from '@/shared/lib/url'
import { PageLoader, RetryState } from '@/shared/ui'
import { AnimatePresence, motion } from 'motion-v'
import Button from 'primevue/button'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => void
}

const apiUrl = import.meta.env.VITE_API_URL
const pageLimit = 20
const scrollLoadThreshold = 520

const { t } = useI18n()
const router = useRouter()
const { getMessage } = useI18nMessage()
const { showApiError } = useApiErrorToast()
const { requestAuthPrompt } = useAuthPrompt()
const { isAuthenticated, isSessionInitialized } = useAuth()

const { games, isLoading, isLoadingMore, loadError, loadGames, pagination, reset } = useGameSearch()
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

const genres = ref<CatalogGenre[]>([])
const selectedGenreId = ref<string | null>(null)
const isCatalogLoading = ref(false)
const catalogLoadError = ref<ReturnType<typeof toApiError> | null>(null)
const loadMoreError = ref<string | null>(null)
let userMarksLoaded = false

const selectedGenre = computed(
  () => genres.value.find((genre) => genre.id === selectedGenreId.value) ?? null,
)
const favoriteIdSet = computed(() => new Set(favoriteIds.value))
const basketIdSet = computed(() => new Set(basketIds.value))
const loadMoreErrorMessage = computed(() =>
  loadMoreError.value ? getMessage(loadMoreError.value) : null,
)

const getGamesCount = (genre: CatalogGenre): string =>
  t('catalog.gamesCount', { count: genre.games_count ?? 0 })

const getGenreCoverUrl = (genre: CatalogGenre | null): string | null =>
  buildAssetUrl(genre?.cover?.url, apiUrl)

const loadCatalog = async (): Promise<void> => {
  try {
    isCatalogLoading.value = true
    catalogLoadError.value = null
    genres.value = await fetchCatalogGenres()
  } catch (error: unknown) {
    const apiError = toApiError(error)
    catalogLoadError.value = apiError
    showApiError(apiError)
  } finally {
    isCatalogLoading.value = false
  }
}

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

const loadSelectedGenreGames = async (): Promise<void> => {
  if (!selectedGenreId.value) {
    return
  }

  try {
    loadMoreError.value = null
    await loadGames({
      limit: pageLimit,
      page: 1,
      tagIds: [selectedGenreId.value],
      tagMode: 'all',
    })
    await loadUserMarks()
  } catch (error: unknown) {
    showApiError(error)
  } finally {
    queueScrollCheck()
  }
}

const loadMoreGames = async (): Promise<void> => {
  if (
    !selectedGenreId.value ||
    isLoading.value ||
    isLoadingMore.value ||
    !pagination.value.hasNextPage
  ) {
    return
  }

  try {
    loadMoreError.value = null
    await loadGames(
      {
        limit: pagination.value.limit || pageLimit,
        page: pagination.value.page + 1,
        tagIds: [selectedGenreId.value],
        tagMode: 'all',
      },
      { append: true },
    )
    queueScrollCheck()
  } catch (error: unknown) {
    const apiError = toApiError(error)
    loadMoreError.value = apiError.message
    showApiError(apiError)
  }
}

const selectGenre = (id: string): void => {
  selectedGenreId.value = id
  reset()
  window.scrollTo({ behavior: 'smooth', top: 0 })
  loadSelectedGenreGames()
}

const backToShowcase = (): void => {
  selectedGenreId.value = null
  loadMoreError.value = null
  reset()
  window.scrollTo({ behavior: 'smooth', top: 0 })
}

const queueScrollCheck = (): void => {
  window.requestAnimationFrame(handleWindowScroll)
}

const handleWindowScroll = (): void => {
  if (
    !selectedGenreId.value ||
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
    loadMoreGames()
  }
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

onMounted(() => {
  window.addEventListener('scroll', handleWindowScroll, { passive: true })
  loadCatalog()
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

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleWindowScroll)
})
</script>
