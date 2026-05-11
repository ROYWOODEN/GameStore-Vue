export interface GameListItem {
  id: string
  title: string
  description: string
  price: string
  tags: GameTag[]
  media: GameMedia
}

export interface GameTag {
  name: string
  type: GameTagType
}
export type GameTagType = 'genre' | 'age' | 'mode' | 'theme' | 'feature' | 'platforma'

interface GameMedia {
  images: GameImage[]
}
interface GameImage {
  url: string
  alt: string
}
