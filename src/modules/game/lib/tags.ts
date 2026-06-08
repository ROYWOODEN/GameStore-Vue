import { getPlatformIcon } from '@/shared/lib/platforms'
import type { GameListTag, GameListTagType } from '../types/game'

export const getTagTypeName = (tag: GameListTag): GameListTagType =>
  normalizeGameTagType(typeof tag.type === 'string' ? tag.type : tag.type.name)

export const normalizeGameTagType = (type: string): GameListTagType => {
  const normalizedType = type.trim().toLowerCase()

  if (['platform', 'platforma', 'platforms'].includes(normalizedType)) {
    return 'platforma'
  }

  return normalizedType as GameListTagType
}

export const getTagGroupLabel = (type: string): string =>
  tagTypeLabels[type as GameListTagType] ?? type

const tagTypeLabels: Record<GameListTagType, string> = {
  age: 'Age',
  feature: 'Features',
  genre: 'Genre',
  mode: 'Mode',
  platforma: 'Platforms',
  theme: 'Theme',
}

const genreIcons: Record<string, string> = {
  action: 'bs:lightning-charge',
  adventure: 'bs:compass',
  rpg: 'bs:person-gear',
  strategy: 'bs:diagram-3',
  'открытый мир': 'bs:globe2',
  приключения: 'bs:compass',
  экшен: 'bs:lightning-charge',
}

const tagTypeIcons: Record<GameListTagType, string> = {
  age: 'bs:person-badge',
  feature: 'bs:stars',
  genre: 'bs:collection',
  mode: 'bs:controller',
  platforma: 'bs:display',
  theme: 'bs:palette',
}

export const getTagIcon = (tag: GameListTag): string => {
  const type = getTagTypeName(tag)
  const name = tag.name.toLowerCase()

  if (type === 'platforma') {
    return getPlatformIcon(name)
  }

  if (type === 'genre') {
    return genreIcons[name] ?? tagTypeIcons[type]
  }

  return tagTypeIcons[type]
}
