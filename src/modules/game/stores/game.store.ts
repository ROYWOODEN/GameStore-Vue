import type { ApiError } from '@/shared/api/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GameListItem } from '../types/game'

export const useGameStore = defineStore('game', () => {
  const games = ref<GameListItem[]>([])
  const isLoading = ref<boolean>(false)
  const loadError = ref<ApiError | null>(null)

  const setGames = (nextGames: GameListItem[]): void => {
    games.value = nextGames
  }

  const setLoading = (nextLoading: boolean): void => {
    isLoading.value = nextLoading
  }

  const setLoadError = (error: ApiError | null): void => {
    loadError.value = error
  }

  const resetGames = (): void => {
    games.value = []
    loadError.value = null
  }

  return {
    games,
    isLoading,
    loadError,
    resetGames,
    setGames,
    setLoadError,
    setLoading,
  }
})
