import { ref } from 'vue'
import { fetchGames } from '../api/games.api'
import type { GameListItem } from '../types/game'
import type { ApiError } from '@/shared/api/api'

export const useGames = () => {
  const isLoading = ref<boolean>(false)
  const loadError = ref<ApiError | null>(null)
  const games = ref<GameListItem[]>([])
  const getGames = async () => {
    try {
      isLoading.value = true
      loadError.value = null
      games.value = await fetchGames()
    } catch (err) {
      const apiError = err as ApiError
      loadError.value = apiError
      throw apiError
    } finally {
      isLoading.value = false
    }
  }
  return { getGames, games, isLoading, loadError }
}
