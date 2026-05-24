import { api } from '@/shared/api/http'
import { apiRequest } from '@/shared/api/request'
import type { GameReview, GameReviewPayload } from '../types/review'

export const fetchGameReviews = async (gameId: string): Promise<GameReview[]> => {
  return await apiRequest<GameReview[]>(api.get(`/games/${gameId}/reviews`))
}

export const fetchMyGameReview = async (gameId: string): Promise<GameReview | null> => {
  return await apiRequest<GameReview | null>(api.get(`/games/${gameId}/reviews/me`))
}

export const fetchCreateGameReview = async (
  gameId: string,
  payload: GameReviewPayload,
): Promise<GameReview> => {
  return await apiRequest<GameReview>(api.post(`/games/${gameId}/reviews`, payload))
}

export const fetchUpdateMyGameReview = async (
  gameId: string,
  payload: Partial<GameReviewPayload>,
): Promise<GameReview> => {
  return await apiRequest<GameReview>(api.patch(`/games/${gameId}/reviews/me`, payload))
}

export const fetchDeleteMyGameReview = async (gameId: string): Promise<void> => {
  return await apiRequest<void>(api.delete(`/games/${gameId}/reviews/me`))
}
