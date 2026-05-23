import { api } from '@/shared/api/http'
import { apiRequest, apiRequestWithMeta, type ApiRequestResult } from '@/shared/api/request'
import type { BasketGame, BasketGameId } from '../types/basket'

export const fetchBasket = async (): Promise<ApiRequestResult<BasketGame[]>> => {
  return await apiRequestWithMeta<BasketGame[]>(api.get('/basket'))
}

export const fetchBasketIds = async (): Promise<ApiRequestResult<BasketGameId[]>> => {
  return await apiRequestWithMeta<BasketGameId[]>(api.get('/basket/ids'))
}

export const fetchAddBasketItem = async (gameId: BasketGameId): Promise<void> => {
  await apiRequest<void>(api.post(`/basket/${gameId}`))
}

export const fetchRemoveBasketItem = async (gameId: BasketGameId): Promise<void> => {
  await apiRequest<void>(api.delete(`/basket/${gameId}`))
}

export const fetchClearBasket = async (): Promise<void> => {
  await apiRequest<void>(api.delete('/basket'))
}
