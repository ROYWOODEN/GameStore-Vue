import type { ApiError } from '@/shared/api/api'
import { toApiError } from '@/shared/api/error'
import { ref } from 'vue'
import { fetchGame } from '../api/games.api'
import type { Game } from '../types/game'

export const useGame = () => {
  const game = ref<Game | null>(null)
  const isLoading = ref(false)
  const loadError = ref<ApiError | null>(null)

  const getGame = async (id: string) => {
    try {
      isLoading.value = true
      loadError.value = null
      game.value = await fetchGame({ id })
    } catch (error: unknown) {
      const apiError = toApiError(error)
      loadError.value = apiError
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  return { game, getGame, isLoading, loadError }
}
