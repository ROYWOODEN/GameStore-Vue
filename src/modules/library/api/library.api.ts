import { api } from '@/shared/api/http'
import { apiRequest } from '@/shared/api/request'
import type { LibraryGame, LibraryGameId } from '../types/library'

interface LibraryGrantDto {
  granted_at: string
  game: LibraryGame
}

type LibraryResponseItem = LibraryGame | LibraryGrantDto

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isLibraryGrant = (value: LibraryResponseItem): value is LibraryGrantDto =>
  isObject(value) && isObject(value.game)

export const fetchLibrary = async (): Promise<LibraryGame[]> => {
  const libraryItems = await apiRequest<LibraryResponseItem[]>(api.get('/library'))

  return libraryItems.map((item) => (isLibraryGrant(item) ? item.game : item))
}

export const fetchLibraryIds = async (): Promise<LibraryGameId[]> => {
  return await apiRequest<LibraryGameId[]>(api.get('/library/ids'))
}
