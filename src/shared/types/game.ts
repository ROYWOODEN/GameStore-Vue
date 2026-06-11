export interface GameListItem {
  id: string
  title: string
  description: string
  price: string
  rating?: GameRating
  tags: GameTag[]
  media: GameMedia
}

export interface GameRating {
  average: number | null
  count: number
}

export interface GameTag {
  name: string
  type: GameTagType
}

export type GameTagType = 'genre' | 'age' | 'mode' | 'theme' | 'feature' | 'platforma'

export interface GameMedia {
  images: GameImage[]
}

export interface GameImage {
  url: string
  alt: string
}
