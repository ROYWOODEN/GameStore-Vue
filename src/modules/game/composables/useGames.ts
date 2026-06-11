import { storeToRefs } from 'pinia'
import type { ApiMeta } from '@/shared/api/api'
import { toApiError } from '@/shared/api/error'
import { fetchGamesPage } from '../api/games.api'
import { useGameStore } from '../stores/game.store'
import type { GameListParams, GamePaginationState } from '../types/game'

type LoadOptions = {
  append?: boolean
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

export const useGames = () => {
  const gameStore = useGameStore()
  const { games, isLoading, isLoadingMore, loadError, pagination } = storeToRefs(gameStore)

  const getGames = async (
    params: GameListParams = { limit: defaultPaginationState.limit, page: 1 },
    options: LoadOptions = {},
  ): Promise<void> => {
    if (isLoading.value || isLoadingMore.value) {
      return
    }

    try {
      if (options.append) {
        gameStore.setLoadingMore(true)
      } else {
        gameStore.setLoading(true)
        gameStore.setLoadError(null)
      }

      const result = await fetchGamesPage(params)
      if (options.append) {
        gameStore.appendGames(result.data)
      } else {
        gameStore.setGames(result.data)
      }
      gameStore.setPagination(toPaginationState(result.meta, result.data.length))
    } catch (error: unknown) {
      const apiError = toApiError(error)
      if (!options.append) {
        gameStore.setLoadError(apiError)
      }
      throw apiError
    } finally {
      if (options.append) {
        gameStore.setLoadingMore(false)
      } else {
        gameStore.setLoading(false)
      }
    }
  }

  return {
    games,
    getGames,
    isLoading,
    isLoadingMore,
    loadError,
    pagination,
    resetGames: gameStore.resetGames,
  }
}
