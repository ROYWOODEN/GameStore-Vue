import { storeToRefs } from 'pinia'
import { toApiError } from '@/shared/api/error'
import { fetchGames } from '../api/games.api'
import { useGameStore } from '../stores/game.store'

export const useGames = () => {
  const gameStore = useGameStore()
  const { games, isLoading, loadError } = storeToRefs(gameStore)

  const getGames = async (): Promise<void> => {
    if (isLoading.value) {
      return
    }

    try {
      gameStore.setLoading(true)
      gameStore.setLoadError(null)
      gameStore.setGames(await fetchGames())
    } catch (error: unknown) {
      const apiError = toApiError(error)
      gameStore.setLoadError(apiError)
      throw apiError
    } finally {
      gameStore.setLoading(false)
    }
  }

  return {
    games,
    getGames,
    isLoading,
    loadError,
    resetGames: gameStore.resetGames,
  }
}
