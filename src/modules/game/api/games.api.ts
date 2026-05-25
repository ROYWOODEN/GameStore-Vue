import { api } from '@/shared/api/http'
import { apiRequest } from '@/shared/api/request'
import type { Game, GameListItem } from '../types/game'

export const fetchGames = async () => {
  return await apiRequest<GameListItem[]>(api.get('/games'))
}

export const fetchGame = async (id: Pick<Game, 'id'>) => {
  return await apiRequest<Game>(api.get(`/games/${id.id}`))
}

export const fetchCreateGame = async (body: Omit<Game, 'id' | 'created_at'>) => {
  return await apiRequest(api.post('/games', body))
}

export const fetchUpdateGame = async (
  id: Pick<Game, 'id'>,
  body: Omit<Game, 'id' | 'created_at' | 'media'>,
) => {
  return await apiRequest(api.patch(`/games/${id.id}`, body))
}

export const fetchDeleteGame = async (id: Pick<Game, 'id'>) => {
  return await apiRequest(api.delete(`/games/${id.id}`))
}
