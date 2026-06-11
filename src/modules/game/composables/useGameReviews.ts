import { toApiError } from '@/shared/api/error'
import { computed, ref } from 'vue'
import {
  fetchCreateGameReview,
  fetchDeleteMyGameReview,
  fetchGameReviews,
  fetchMyGameReview,
  fetchUpdateMyGameReview,
} from '../api/reviews.api'
import type { GameReview, GameReviewPayload } from '../types/review'
import type { ApiError } from '@/shared/api/api'

export const useGameReviews = () => {
  const reviews = ref<GameReview[]>([])
  const myReview = ref<GameReview | null>(null)
  const isReviewsLoading = ref(false)
  const isMyReviewLoading = ref(false)
  const isReviewSaving = ref(false)
  const isReviewDeleting = ref(false)
  const reviewsLoadError = ref<ApiError | null>(null)
  const myReviewLoadError = ref<ApiError | null>(null)

  const hasMyReview = computed(() => Boolean(myReview.value))

  const getGameReviews = async (gameId: string): Promise<void> => {
    if (isReviewsLoading.value) {
      return
    }

    try {
      isReviewsLoading.value = true
      reviewsLoadError.value = null
      reviews.value = await fetchGameReviews(gameId)
    } catch (error: unknown) {
      const apiError = toApiError(error)
      reviewsLoadError.value = apiError
      throw apiError
    } finally {
      isReviewsLoading.value = false
    }
  }

  const getMyGameReview = async (gameId: string): Promise<void> => {
    if (isMyReviewLoading.value) {
      return
    }

    try {
      isMyReviewLoading.value = true
      myReviewLoadError.value = null
      myReview.value = await fetchMyGameReview(gameId)
    } catch (error: unknown) {
      const apiError = toApiError(error)
      myReviewLoadError.value = apiError
      throw apiError
    } finally {
      isMyReviewLoading.value = false
    }
  }

  const createGameReview = async (gameId: string, payload: GameReviewPayload): Promise<void> => {
    if (isReviewSaving.value) {
      return
    }

    try {
      isReviewSaving.value = true
      myReview.value = await fetchCreateGameReview(gameId, payload)
    } catch (error: unknown) {
      throw toApiError(error)
    } finally {
      isReviewSaving.value = false
    }
  }

  const updateMyGameReview = async (
    gameId: string,
    payload: Partial<GameReviewPayload>,
  ): Promise<void> => {
    if (isReviewSaving.value) {
      return
    }

    try {
      isReviewSaving.value = true
      myReview.value = await fetchUpdateMyGameReview(gameId, payload)
    } catch (error: unknown) {
      throw toApiError(error)
    } finally {
      isReviewSaving.value = false
    }
  }

  const deleteMyGameReview = async (gameId: string): Promise<void> => {
    if (isReviewDeleting.value) {
      return
    }

    try {
      isReviewDeleting.value = true
      await fetchDeleteMyGameReview(gameId)
      myReview.value = null
    } catch (error: unknown) {
      throw toApiError(error)
    } finally {
      isReviewDeleting.value = false
    }
  }

  const resetGameReviews = (): void => {
    reviews.value = []
    myReview.value = null
    reviewsLoadError.value = null
    myReviewLoadError.value = null
  }

  const clearMyReview = (): void => {
    myReview.value = null
    myReviewLoadError.value = null
  }

  return {
    clearMyReview,
    createGameReview,
    deleteMyGameReview,
    getGameReviews,
    getMyGameReview,
    hasMyReview,
    isMyReviewLoading,
    isReviewDeleting,
    isReviewSaving,
    isReviewsLoading,
    myReview,
    myReviewLoadError,
    resetGameReviews,
    reviews,
    reviewsLoadError,
    updateMyGameReview,
  }
}
