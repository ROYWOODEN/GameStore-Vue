import { api } from '@/shared/api/http'
import { apiRequest, apiRequestWithMeta } from '@/shared/api/request'
import type { Game, GameListItem, GameListParams, GameTagTypeWithTags } from '../types/game'

const buildListParams = (params: Record<string, unknown>): Record<string, unknown> => {
  const query: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        query[key] = value.join(',')
      }
      continue
    }

    query[key] = value
  }

  return query
}

export const fetchGames = async (params: GameListParams = {}) => {
  return await apiRequest<GameListItem[]>(
    api.get('/games', {
      params: buildListParams({ ...params }),
    }),
  )
}

export const fetchGamesPage = async (params: GameListParams = {}) => {
  return await apiRequestWithMeta<GameListItem[]>(
    api.get('/games', {
      params: buildListParams({ ...params }),
    }),
  )
}

export const fetchGame = async (id: Pick<Game, 'id'>) => {
  return await apiRequest<Game>(api.get(`/games/${id.id}`))
}

export const fetchGameTagTypes = async () => {
  return await apiRequestWithMeta<GameTagTypeWithTags[]>(
    api.get('/tag-types', {
      params: {
        withTags: true,
      },
    }),
  )
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
