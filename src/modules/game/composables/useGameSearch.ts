import type { ApiMeta } from '@/shared/api/api'
import { toApiError } from '@/shared/api/error'
import { ref } from 'vue'
import { fetchGamesPage, fetchGameTagTypes } from '../api/games.api'
import type {
  GameListItem,
  GameListParams,
  GamePaginationState,
  GameTagTypeWithTags,
} from '../types/game'

type LoadOptions = {
  append?: boolean
  silent?: boolean
}

const defaultPaginationState: GamePaginationState = {
  count: 0,
  hasNextPage: false,
  hasPreviousPage: false,
  limit: 20,
  page: 1,
  total: 0,
  totalPages: 0,
}

const toPaginationState = (
  meta: ApiMeta | undefined,
  fallbackCount: number,
): GamePaginationState => ({
  count: meta?.count ?? fallbackCount,
  hasNextPage: meta?.hasNextPage ?? false,
  hasPreviousPage: meta?.hasPreviousPage ?? false,
  limit: meta?.limit ?? defaultPaginationState.limit,
  page: meta?.page ?? 1,
  total: meta?.total ?? meta?.count ?? fallbackCount,
  totalPages: meta?.totalPages ?? (fallbackCount > 0 ? 1 : 0),
})

export const useGameSearch = () => {
  const games = ref<GameListItem[]>([])
  const tagTypes = ref<GameTagTypeWithTags[]>([])
  const pagination = ref<GamePaginationState>({ ...defaultPaginationState })
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isTagsLoading = ref(false)
  const loadError = ref<ReturnType<typeof toApiError> | null>(null)
  const tagsLoadError = ref<ReturnType<typeof toApiError> | null>(null)

  const loadGames = async (
    params: GameListParams = {},
    options: LoadOptions = {},
  ): Promise<void> => {
    try {
      if (options.append) {
        isLoadingMore.value = true
      } else if (!options.silent) {
        isLoading.value = true
      }

      if (!options.append) {
        loadError.value = null
      }

      const result = await fetchGamesPage(params)
      games.value = options.append ? [...games.value, ...result.data] : result.data
      pagination.value = toPaginationState(result.meta, result.data.length)
    } catch (error: unknown) {
      const apiError = toApiError(error)
      if (!options.append) {
        loadError.value = apiError
      }
      throw apiError
    } finally {
      if (options.append) {
        isLoadingMore.value = false
      } else if (!options.silent) {
        isLoading.value = false
      }
    }
  }

  const loadTagTypes = async (options: LoadOptions = {}): Promise<void> => {
    try {
      if (!options.silent) {
        isTagsLoading.value = true
      }

      tagsLoadError.value = null
      const result = await fetchGameTagTypes()
      tagTypes.value = result.data.map((type) => ({
        ...type,
        tags: type.tags ?? [],
      }))
    } catch (error: unknown) {
      const apiError = toApiError(error)
      tagsLoadError.value = apiError
      throw apiError
    } finally {
      if (!options.silent) {
        isTagsLoading.value = false
      }
    }
  }

  const reset = (): void => {
    games.value = []
    pagination.value = { ...defaultPaginationState }
    loadError.value = null
  }

  return {
    games,
    isLoading,
    isLoadingMore,
    isTagsLoading,
    loadError,
    loadGames,
    loadTagTypes,
    pagination,
    reset,
    tagTypes,
    tagsLoadError,
  }
}
