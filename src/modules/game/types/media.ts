export type GameDetailMediaItem = {
  id: string
  type: 'image' | 'video'
  url: string
  alt: string
  isPlayable: boolean
  title: string
  sortOrder: number
}
