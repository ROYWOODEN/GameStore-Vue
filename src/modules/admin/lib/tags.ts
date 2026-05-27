import type { AdminGameTag, AdminTag, AdminTagType, AdminTagTypeSummary } from '../types/admin'

export type AdminTagLike = {
  id?: string
  name: string
  type?: string | Partial<AdminTagTypeSummary>
  type_id?: string
}

type PersistedAdminTagLike = AdminTag | AdminGameTag

export const normalizeTagTypeName = (type: string | null | undefined): string => {
  const normalized = type?.trim().toLowerCase() ?? ''

  const aliases: Record<string, string> = {
    ages: 'age',
    age_rating: 'age',
    'age rating': 'age',
    ratings: 'age',
    genres: 'genre',
    modes: 'mode',
    platforma: 'platform',
    platforms: 'platform',
  }

  return aliases[normalized] ?? normalized
}

export const getTagTypeName = (tag: AdminTagLike): string => {
  if (typeof tag.type === 'string') {
    return normalizeTagTypeName(tag.type)
  }

  return normalizeTagTypeName(tag.type?.name)
}

export const getTagTypeId = (tag: AdminTagLike): string | null => {
  if (typeof tag.type === 'object' && tag.type?.id) {
    return tag.type.id
  }

  return tag.type_id ?? null
}

export const findTagTypeById = (
  typeId: string | null | undefined,
  tagTypes: Array<AdminTagType | AdminTagTypeSummary>,
): AdminTagType | AdminTagTypeSummary | null => {
  if (!typeId) {
    return null
  }

  return tagTypes.find((type) => type.id === typeId) ?? null
}

export const resolveTagTypeName = (
  tag: AdminTagLike,
  tagTypes: Array<AdminTagType | AdminTagTypeSummary> = [],
): string => {
  const directType = getTagTypeName(tag)

  if (directType) {
    return directType
  }

  return normalizeTagTypeName(findTagTypeById(getTagTypeId(tag), tagTypes)?.name)
}

export const getTagTypeLabelKey = (type: string): string => {
  const normalizedType = normalizeTagTypeName(type)
  const labels: Record<string, string> = {
    age: 'admin.tagTypes.age',
    feature: 'admin.tagTypes.feature',
    genre: 'admin.tagTypes.genre',
    mode: 'admin.tagTypes.mode',
    platform: 'admin.tagTypes.platform',
    theme: 'admin.tagTypes.theme',
  }

  return labels[normalizedType] ?? normalizedType
}

export const getTagTypeLabel = (type: string): string => normalizeTagTypeName(type) || type

export const getTagRuleTextKey = (type: string): string => {
  const normalizedType = normalizeTagTypeName(type)

  if (normalizedType === 'age') {
    return 'admin.tagRules.exactlyOne'
  }

  if (['genre', 'mode', 'platform'].includes(normalizedType)) {
    return 'admin.tagRules.minOne'
  }

  return 'admin.tagRules.optional'
}

export const getTagRuleText = (type: string): string => getTagRuleTextKey(type)

export const getTagTypeValidationMessageKey = (type: string, actualCount = 0): string | null => {
  const normalizedType = normalizeTagTypeName(type)

  if (normalizedType === 'age') {
    if (actualCount > 1) {
      return 'admin.validation.tags.ageSingle'
    }

    return 'admin.validation.tags.ageRequired'
  }

  if (normalizedType === 'genre') {
    return 'admin.validation.tags.genreRequired'
  }

  if (normalizedType === 'mode') {
    return 'admin.validation.tags.modeRequired'
  }

  if (normalizedType === 'platform') {
    return 'admin.validation.tags.platformRequired'
  }

  return null
}

export const getTagTypeValidationMessage = (type: string, actualCount = 0): string | null =>
  getTagTypeValidationMessageKey(type, actualCount)

export const getRequiredTagTypes = (): string[] => ['age', 'genre', 'mode', 'platform']

export const isSingleSelectTagType = (type: string): boolean => normalizeTagTypeName(type) === 'age'

export const toAdminTag = (
  tag: PersistedAdminTagLike,
  fallbackType?: AdminTagType | AdminTagTypeSummary,
): AdminTag => {
  const type =
    typeof tag.type === 'object'
      ? tag.type
      : fallbackType
        ? {
            id: fallbackType.id,
            name: fallbackType.name,
            sort_order: fallbackType.sort_order,
          }
        : undefined

  return {
    id: tag.id,
    name: tag.name,
    created_at: 'created_at' in tag ? tag.created_at : undefined,
    games_count: 'games_count' in tag ? tag.games_count : undefined,
    type,
    type_id: getTagTypeId(tag) ?? type?.id,
  }
}

export const getPlatformIcon = (name: string): string => {
  const platformIcons: Record<string, string> = {
    pc: 'bs:pc-display-horizontal',
    windows: 'bs:windows',
    playstation: 'bs:playstation',
    xbox: 'bs:xbox',
    switch: 'bs:nintendo-switch',
    linux: 'bs:ubuntu',
    macos: 'bs:apple',
    mac: 'bs:apple',
    android: 'bs:android2',
    ios: 'bs:apple',
  }

  return platformIcons[name.trim().toLowerCase()] ?? 'bs:display'
}
