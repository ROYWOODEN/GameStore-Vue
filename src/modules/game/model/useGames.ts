import { ref } from 'vue'
import { fetchGames } from '../api/games.api'
import type { GameListItem } from '../types/game'
import type { ApiError } from '@/shared/api/api'
import { toApiError } from '@/shared/api/error'

export const useGames = () => {
  const isLoading = ref<boolean>(false)
  const loadError = ref<ApiError | null>(null)
  const games = ref<GameListItem[]>([])
  const getGames = async () => {
    try {
      isLoading.value = true
      loadError.value = null
      games.value = await fetchGames()
    } catch (error: unknown) {
      const apiError = toApiError(error)
      loadError.value = apiError
      throw apiError
    } finally {
      isLoading.value = false
    }
  }
  return { getGames, games, isLoading, loadError }
}
