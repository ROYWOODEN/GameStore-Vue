import { api } from '@/shared/api/http'
import { apiRequest, apiRequestWithMeta } from '@/shared/api/request'
import type {
  AdminGame,
  AdminGameFormPayload,
  AdminGameListParams,
  AdminGameListItem,
  AdminGameUpdatePayload,
  AdminTag,
  AdminTagListParams,
  AdminTagPayload,
  AdminTagType,
} from '../types/admin'

const appendGameFormData = (formData: FormData, payload: AdminGameFormPayload): void => {
  formData.append('title', payload.title)
  formData.append('description', payload.description)
  formData.append('price', payload.price)
  formData.append('tagIds', JSON.stringify(payload.tagIds))

  for (const image of payload.images) {
    formData.append('images', image)
  }
}

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

export const fetchAdminGames = async (params: AdminGameListParams = {}) => {
  return await apiRequestWithMeta<AdminGameListItem[]>(
    api.get('/games', {
      params: buildListParams({ ...params }),
    }),
  )
}

export const fetchAdminGame = async (id: string) => {
  return await apiRequest<AdminGame>(api.get(`/games/${id}`))
}

export const fetchAdminCreateGame = async (payload: AdminGameFormPayload) => {
  const formData = new FormData()
  appendGameFormData(formData, payload)

  return await apiRequest<void>(
    api.post('/games', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  )
}

export const fetchAdminUpdateGame = async (id: string, payload: AdminGameUpdatePayload) => {
  return await apiRequest<void>(api.patch(`/games/${id}`, payload))
}

export const fetchAdminDeleteGame = async (id: string) => {
  return await apiRequest<void>(api.delete(`/games/${id}`))
}

export const fetchAdminAddGameImages = async (id: string, images: File[]) => {
  const formData = new FormData()

  for (const image of images) {
    formData.append('images', image)
  }

  return await apiRequest(
    api.post(`/games/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  )
}

export const fetchAdminReorderGameImages = async (id: string, imageIds: string[]) => {
  return await apiRequest(api.patch(`/games/${id}/images/order`, { imageIds }))
}

export const fetchAdminDeleteGameImage = async (id: string, imageId: string) => {
  return await apiRequest<void>(api.delete(`/games/${id}/images/${imageId}`))
}

export const fetchAdminTagTypes = async (withTags = false) => {
  return await apiRequestWithMeta<AdminTagType[]>(
    api.get('/tag-types', {
      params: {
        withTags,
      },
    }),
  )
}

export const fetchAdminTags = async (params: AdminTagListParams = {}) => {
  return await apiRequestWithMeta<AdminTag[]>(
    api.get('/tags', {
      params: buildListParams({ ...params }),
    }),
  )
}

export const fetchAdminCreateTag = async (payload: AdminTagPayload) => {
  return await apiRequest<AdminTag>(api.post('/tags', payload))
}

export const fetchAdminUpdateTag = async (id: string, payload: AdminTagPayload) => {
  return await apiRequest<AdminTag>(api.patch(`/tags/${id}`, payload))
}

export const fetchAdminDeleteTag = async (id: string) => {
  return await apiRequest<void>(api.delete(`/tags/${id}`))
}
