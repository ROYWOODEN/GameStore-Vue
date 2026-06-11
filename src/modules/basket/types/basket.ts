import type { GameListItem } from '@/shared/types/game'

export type BasketGame = GameListItem
export type BasketGameId = BasketGame['id']

export interface BasketMeta {
  count?: number
  totalAmount?: string
}

export interface BasketResult {
  items: BasketGame[]
  meta?: BasketMeta
}

export interface BasketIdsResult {
  ids: BasketGameId[]
  meta?: Pick<BasketMeta, 'count'>
}
