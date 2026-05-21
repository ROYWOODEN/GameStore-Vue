import { api } from '@/shared/api/http'
import { apiRequest } from '@/shared/api/request'
import type { FavoriteGame, FavoriteGameId } from '../types/favorite'

export const fetchFavorites = async () => {
  return await apiRequest<FavoriteGame[]>(api.get('/favorites'))
}

export const fetchFavoriteIds = async () => {
  return await apiRequest<FavoriteGameId[]>(api.get('/favorites/ids'))
}

export const fetchAddFavorite = async (gameId: FavoriteGameId) => {
  return await apiRequest<void>(api.post(`/favorites/${gameId}`))
}

export const fetchRemoveFavorite = async (gameId: FavoriteGameId) => {
  return await apiRequest<void>(api.delete(`/favorites/${gameId}`))
}
