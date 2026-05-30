import type { ApiError } from '@/shared/api/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GameListItem, GamePaginationState } from '../types/game'

const defaultPaginationState: GamePaginationState = {
  count: 0,
  hasNextPage: false,
  hasPreviousPage: false,
  limit: 20,
  page: 1,
  total: 0,
  totalPages: 0,
}

export const useGameStore = defineStore('game', () => {
  const games = ref<GameListItem[]>([])
  const pagination = ref<GamePaginationState>({ ...defaultPaginationState })
  const isLoading = ref<boolean>(false)
  const isLoadingMore = ref<boolean>(false)
  const loadError = ref<ApiError | null>(null)

  const setGames = (nextGames: GameListItem[]): void => {
    games.value = nextGames
  }

  const appendGames = (nextGames: GameListItem[]): void => {
    games.value = [...games.value, ...nextGames]
  }

  const setPagination = (nextPagination: GamePaginationState): void => {
    pagination.value = nextPagination
  }

  const setLoading = (nextLoading: boolean): void => {
    isLoading.value = nextLoading
  }

  const setLoadingMore = (nextLoading: boolean): void => {
    isLoadingMore.value = nextLoading
  }

  const setLoadError = (error: ApiError | null): void => {
    loadError.value = error
  }

  const resetGames = (): void => {
    games.value = []
    pagination.value = { ...defaultPaginationState }
    loadError.value = null
  }

  return {
    appendGames,
    games,
    isLoading,
    isLoadingMore,
    loadError,
    pagination,
    resetGames,
    setGames,
    setLoadError,
    setLoading,
    setLoadingMore,
    setPagination,
  }
})
