export interface GameListItem {
  id: string
  title: string
  description: string
  price: string
  created_at?: string
  updated_at?: string
  rating?: GameRating
  tags: GameListTag[]
  media: GameMedia
}

export interface Game {
  id: string
  title: string
  description: string
  price: string
  created_at: string
  rating: GameRating
  tags: GameListTag[]
  media: GameMedia
}

export interface GameRating {
  average: number | null
  count: number
}

export interface GameTag {
  id: string
  name: string
  type: GameTagType[]
}

export interface GameTagTypeWithTags {
  id: string
  name: string
  sort_order: number
  tags_count?: number
  tags?: GameSearchTag[]
}

export interface GameSearchTag {
  id: string
  name: string
  created_at?: string
  games_count?: number
  type?: GameTagType
  type_id?: string
}

export interface GameTagType {
  id: string
  name: string
  sort_order: number
}
export interface GameListTag {
  id?: string
  name: string
  type: GameListTagType | GameTagType
}
export type GameListTagType = 'genre' | 'age' | 'mode' | 'theme' | 'feature' | 'platforma'

export interface GameMedia {
  images: GameImage[]
  videos?: GameVideo[]
}
export interface GameImage {
  id?: string
  url: string
  alt: string
  sort_order?: number
  created_at?: string
  game_id?: string
}
export interface GameVideo {
  id?: string
  url: string
  title?: string
  duration?: number
  created_at?: string
  game_id?: string
}

export interface GameListParams {
  limit?: number
  page?: number
  search?: string
  tagIds?: string[]
  tagMode?: 'all' | 'any'
}

export interface GamePaginationState {
  count: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  limit: number
  page: number
  total: number
  totalPages: number
}
