import type { GameListTag, GameListTagType } from '../types/game'

export const getTagTypeName = (tag: GameListTag): GameListTagType =>
  typeof tag.type === 'string' ? tag.type : (tag.type.name as GameListTagType)

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

const platformIcons: Record<string, string> = {
  linux: 'bs:ubuntu',
  macos: 'bs:apple',
  playstation: 'bs:playstation',
  switch: 'bs:nintendo-switch',
  windows: 'bs:windows',
  xbox: 'bs:xbox',
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
    return platformIcons[name] ?? tagTypeIcons[type]
  }

  if (type === 'genre') {
    return genreIcons[name] ?? tagTypeIcons[type]
  }

  return tagTypeIcons[type]
}
