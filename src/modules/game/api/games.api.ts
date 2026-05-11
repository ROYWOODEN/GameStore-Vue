import { api } from '@/shared/api/http'
import type { GameListItem } from '../types/game'
import { apiRequest } from '@/shared/api/request'

export const fetchGames = async () => {
  return await apiRequest<GameListItem[]>(api.get('/games'))
}
