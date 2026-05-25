export interface GameReviewUser {
  id: number | string
  name?: string
  email?: string
  avatar_url?: string | null
}

export interface GameReview {
  id?: number | string
  game_id?: number | string
  user_id?: number | string
  rating: number
  text?: string | null
  created_at?: string
  updated_at?: string
  user?: GameReviewUser | null
}

export interface GameReviewPayload {
  rating: number
  text?: string
}
