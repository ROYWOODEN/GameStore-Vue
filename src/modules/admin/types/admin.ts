export interface AdminTagType {
  id: string
  name: string
  sort_order: number
  tags_count?: number
  tags?: AdminTag[]
}

export interface AdminTagTypeSummary {
  id: string
  name: string
  sort_order: number
}

export interface AdminTag {
  id: string
  name: string
  created_at?: string
  games_count?: number
  type?: AdminTagTypeSummary
  type_id?: string
}

export interface AdminGameRating {
  average: number | null
  count: number
}

export interface AdminGameImage {
  id?: string
  url: string
  alt: string
  sort_order?: number
  created_at?: string
  game_id?: string
}

export interface AdminGameVideo {
  id?: string
  url: string
  title?: string
  duration?: number
  created_at?: string
  game_id?: string
}

export interface AdminGameListTag {
  id?: string
  name: string
  type?: string | AdminTagTypeSummary
  type_id?: string
}

export interface AdminGame {
  id: string
  title: string
  description: string
  price: string
  created_at?: string
  updated_at?: string
  rating?: AdminGameRating
  tags: AdminGameTag[]
  media: {
    images: AdminGameImage[]
    videos?: AdminGameVideo[]
  }
}

export interface AdminGameTag {
  id: string
  name: string
  type?: string | AdminTagTypeSummary
  type_id?: string
}

export interface AdminGameListItem {
  id: string
  title: string
  description: string
  price: string
  created_at?: string
  updated_at?: string
  rating?: AdminGameRating
  tags: AdminGameListTag[]
  media: {
    images: AdminGameImage[]
    videos?: AdminGameVideo[]
  }
}

export interface AdminGameFormPayload {
  title: string
  description: string
  price: string
  tagIds: string[]
  images: File[]
}

export interface AdminGameUpdatePayload {
  title: string
  description: string
  price: string
  tagIds: string[]
}

export interface AdminTagPayload {
  name: string
  typeId: string
}

export interface AdminPaginationParams {
  limit?: number
  page?: number
  search?: string
}

export interface AdminGameListParams extends AdminPaginationParams {
  tagIds?: string[]
  tagMode?: 'all' | 'any'
}

export interface AdminTagListParams extends AdminPaginationParams {
  type?: string
  typeId?: string
}

export interface AdminPaginationState {
  count: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  limit: number
  page: number
  total: number
  totalPages: number
}
