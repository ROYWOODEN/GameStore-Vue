<template>
  <main
    class="min-h-[calc(100vh-5rem)] bg-(--color-background) px-6 pt-8 pb-12 min-[560px]:px-8 min-[1024px]:px-12 min-[1280px]:px-20"
  >
    <motion.section
      class="grid gap-6"
      :initial="{ opacity: 0, y: 16 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.24, ease: 'easeOut' }"
    >
      <div class="grid gap-2">
        <h1 class="text-3xl font-black text-(--color-on-surface)">
          {{ t('search.page.title') }}
        </h1>
        <p class="max-w-2xl text-sm leading-6 text-(--color-on-surface-variant)">
          {{ t('search.page.subtitle') }}
        </p>
      </div>

      <GameSearchFilters
        :key="filtersResetKey"
        v-model:query="query"
        v-model:selected-tag-ids="selectedTagIds"
        v-model:sort-mode="sortMode"
        v-model:tag-mode="tagMode"
        :is-tags-loading="isTagsLoading"
        :tag-types="tagTypes"
        @reset="resetFilters"
      />

      <PageLoader v-if="isLoading" />
      <RetryState
        v-else-if="loadError"
        :title="t('search.results.loadErrorTitle')"
        :message="getMessage(loadError.message)"
        :action-label="t('search.results.retry')"
        @retry="loadPage"
      />

      <section v-else-if="games.length > 0" class="grid gap-1">
        <GameCardGrid
          :games="visibleGames"
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
            :label="t('search.results.retry')"
            @click="loadMoreGames"
          />
        </div>
      </section>

      <section
        v-else
        class="flex min-h-80 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-(--color-outline-variant) bg-(--color-surface-container) px-6 text-center"
      >
        <span
          class="flex h-12 w-12 items-center justify-center rounded-md bg-(--color-menu-active-bg) text-2xl text-(--color-primary)"
        >
          <VueIcon name="bs:search" />
        </span>
        <h2 class="text-xl font-extrabold text-(--color-on-surface)">
          {{ t('search.results.emptyTitle') }}
        </h2>
        <p class="max-w-md text-sm leading-6 text-(--color-on-surface-variant)">
          {{ t('search.results.emptyDescription') }}
        </p>
      </section>
    </motion.section>
  </main>
</template>

<script setup lang="ts">
import { useAuth, useAuthPrompt } from '@/modules/auth'
import { useBasket, type BasketGame } from '@/modules/basket'
import { useFavorites, type FavoriteGameId } from '@/modules/favorite'
import { GameCardGrid, GameSearchFilters, useGameSearch } from '@/modules/game'
import { useLibrary } from '@/modules/library'
import { toApiError } from '@/shared/api/error'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { PageLoader, RetryState } from '@/shared/ui'
import { motion } from 'motion-v'
import Button from 'primevue/button'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

type TagMode = 'all' | 'any'
type SortMode = 'created_desc' | 'created_asc'
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => void
}

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { getMessage } = useI18nMessage()
const { showApiError } = useApiErrorToast()

const {
  games,
  isLoading,
  isLoadingMore,
  isTagsLoading,
  loadError,
  loadGames,
  loadTagTypes,
  pagination,
  tagTypes,
} = useGameSearch()
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

const query = ref('')
const selectedTagIds = ref<string[]>([])
const tagMode = ref<TagMode>('all')
const sortMode = ref<SortMode>('created_desc')
const loadMoreError = ref<string | null>(null)
const filtersResetKey = ref(0)
const pageLimit = 20
const scrollLoadThreshold = 520
let searchTimer: ReturnType<typeof setTimeout> | undefined
let userMarksLoaded = false

const favoriteIdSet = computed(() => new Set(favoriteIds.value))
const basketIdSet = computed(() => new Set(basketIds.value))
const loadMoreErrorMessage = computed(() =>
  loadMoreError.value ? getMessage(loadMoreError.value) : null,
)
const visibleGames = computed(() =>
  [...games.value].sort((first, second) => {
    if (sortMode.value === 'created_asc') {
      return getDateTime(first.created_at) - getDateTime(second.created_at)
    }

    return getDateTime(second.created_at) - getDateTime(first.created_at)
  }),
)

const getRouteString = (value: unknown): string => (typeof value === 'string' ? value : '')

const getRouteStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
  }

  return typeof value === 'string' && value.length > 0 ? value.split(',').filter(Boolean) : []
}

const getDateTime = (value: string | undefined): number => {
  if (!value) {
    return 0
  }

  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const areStringListsEqual = (first: string[], second: string[]): boolean =>
  first.length === second.length && first.every((item, index) => item === second[index])

const syncFiltersFromRoute = (): void => {
  const nextQuery = getRouteString(route.query.q)
  const nextSelectedTagIds = getRouteStringList(route.query.tags)
  const nextTagMode = route.query.mode === 'any' ? 'any' : 'all'
  const nextSortMode = route.query.sort === 'created_asc' ? 'created_asc' : 'created_desc'

  if (query.value !== nextQuery) {
    query.value = nextQuery
  }

  if (!areStringListsEqual(selectedTagIds.value, nextSelectedTagIds)) {
    selectedTagIds.value = nextSelectedTagIds
  }

  if (tagMode.value !== nextTagMode) {
    tagMode.value = nextTagMode
  }

  if (sortMode.value !== nextSortMode) {
    sortMode.value = nextSortMode
  }
}

const syncRouteFromFilters = (): void => {
  router.replace({
    name: 'search',
    query: {
      ...(query.value.trim() ? { q: query.value.trim() } : {}),
      ...(selectedTagIds.value.length > 0 ? { tags: selectedTagIds.value.join(',') } : {}),
      ...(tagMode.value === 'any' ? { mode: tagMode.value } : {}),
      ...(sortMode.value === 'created_asc' ? { sort: sortMode.value } : {}),
    },
  })
}

const buildSearchParams = (page: number) => ({
  limit: pageLimit,
  page,
  search: query.value.trim() || undefined,
  tagIds: selectedTagIds.value,
  tagMode: tagMode.value,
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

const loadPage = async (): Promise<void> => {
  loadMoreError.value = null

  try {
    await loadGames(buildSearchParams(1))
    await loadUserMarks()
  } catch (error: unknown) {
    showApiError(error)
  } finally {
    queueScrollCheck()
  }
}

const loadMoreGames = async (): Promise<void> => {
  if (isLoading.value || isLoadingMore.value || !pagination.value.hasNextPage) {
    return
  }

  try {
    loadMoreError.value = null
    await loadGames(
      {
        ...buildSearchParams(pagination.value.page + 1),
        limit: pagination.value.limit || pageLimit,
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

const resetFilters = (): void => {
  query.value = ''
  selectedTagIds.value = []
  tagMode.value = 'all'
  sortMode.value = 'created_desc'
  filtersResetKey.value += 1
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

syncFiltersFromRoute()

onMounted(() => {
  window.addEventListener('scroll', handleWindowScroll, { passive: true })
  loadPage()
  loadTagTypes().catch(showApiError)
})

watch(
  [query, selectedTagIds, tagMode, sortMode],
  () => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }

    searchTimer = setTimeout(() => {
      syncRouteFromFilters()
      loadPage()
    }, 360)
  },
  { deep: true },
)

watch(
  () => route.query,
  () => {
    syncFiltersFromRoute()
  },
)

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
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  window.removeEventListener('scroll', handleWindowScroll)
})
</script>
