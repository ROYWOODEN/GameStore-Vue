import type { ApiMeta } from '@/shared/api/api'
import { toApiError } from '@/shared/api/error'
import { computed, ref } from 'vue'
import {
  fetchAdminAddGameImages,
  fetchAdminCreateGame,
  fetchAdminCreateTag,
  fetchAdminDeleteGame,
  fetchAdminDeleteGameImage,
  fetchAdminDeleteTag,
  fetchAdminGame,
  fetchAdminGames,
  fetchAdminReorderGameImages,
  fetchAdminTags,
  fetchAdminTagTypes,
  fetchAdminUpdateGame,
  fetchAdminUpdateTag,
} from '../api/admin.api'
import { getTagTypeLabel } from '../lib/tags'
import type {
  AdminGame,
  AdminGameFormPayload,
  AdminGameListItem,
  AdminGameListParams,
  AdminGameUpdatePayload,
  AdminPaginationState,
  AdminTag,
  AdminTagListParams,
  AdminTagPayload,
  AdminTagType,
} from '../types/admin'

type LoadOptions = {
  append?: boolean
  silent?: boolean
  withTags?: boolean
}

const defaultPaginationState: AdminPaginationState = {
  count: 0,
  hasNextPage: false,
  hasPreviousPage: false,
  limit: 20,
  page: 1,
  total: 0,
  totalPages: 0,
}

const toPaginationState = (
  meta: ApiMeta | undefined,
  fallbackCount: number,
): AdminPaginationState => ({
  count: meta?.count ?? fallbackCount,
  hasNextPage: meta?.hasNextPage ?? false,
  hasPreviousPage: meta?.hasPreviousPage ?? false,
  limit: meta?.limit ?? 20,
  page: meta?.page ?? 1,
  total: meta?.total ?? meta?.count ?? fallbackCount,
  totalPages: meta?.totalPages ?? (fallbackCount > 0 ? 1 : 0),
})

export const useAdminCatalog = () => {
  const games = ref<AdminGameListItem[]>([])
  const tagTypes = ref<AdminTagType[]>([])
  const tags = ref<AdminTag[]>([])
  const gamesCount = ref(0)
  const gamesPagination = ref<AdminPaginationState>({ ...defaultPaginationState })
  const tagsPagination = ref<AdminPaginationState>({ ...defaultPaginationState })
  const isGamesLoading = ref(false)
  const isGamesLoadingMore = ref(false)
  const isTagsLoading = ref(false)
  const isSaving = ref(false)
  const deletingGameIds = ref<string[]>([])
  const deletingTagIds = ref<string[]>([])
  const deletingImageIds = ref<string[]>([])
  const loadError = ref<ReturnType<typeof toApiError> | null>(null)

  const tagTypeOptions = computed(() =>
    tagTypes.value.map((type) => ({
      id: type.id,
      name: type.name,
      label: getTagTypeLabel(type.name),
    })),
  )

  const loadGames = async (
    params: AdminGameListParams = {},
    options: LoadOptions = {},
  ): Promise<void> => {
    try {
      if (options.append) {
        isGamesLoadingMore.value = true
      } else if (!options.silent) {
        isGamesLoading.value = true
      }

      if (!options.append) {
        loadError.value = null
      }
      const result = await fetchAdminGames(params)

      games.value = options.append ? [...games.value, ...result.data] : result.data
      gamesPagination.value = toPaginationState(result.meta, result.data.length)
      gamesCount.value = gamesPagination.value.total
    } catch (error: unknown) {
      const apiError = toApiError(error)
      if (!options.append) {
        loadError.value = apiError
      }
      throw apiError
    } finally {
      if (options.append) {
        isGamesLoadingMore.value = false
      } else if (!options.silent) {
        isGamesLoading.value = false
      }
    }
  }

  const loadTagTypes = async (options: LoadOptions = {}): Promise<void> => {
    try {
      if (!options.silent) {
        isTagsLoading.value = true
      }

      loadError.value = null
      const result = await fetchAdminTagTypes(Boolean(options.withTags))
      tagTypes.value = result.data.map((type) => ({
        ...type,
        tags: type.tags ?? [],
      }))
    } catch (error: unknown) {
      const apiError = toApiError(error)
      loadError.value = apiError
      throw apiError
    } finally {
      if (!options.silent) {
        isTagsLoading.value = false
      }
    }
  }

  const loadTags = async (
    params: AdminTagListParams = {},
    options: LoadOptions = {},
  ): Promise<void> => {
    try {
      if (!options.silent) {
        isTagsLoading.value = true
      }

      loadError.value = null
      const result = await fetchAdminTags(params)
      tags.value = result.data
      tagsPagination.value = toPaginationState(result.meta, result.data.length)
    } catch (error: unknown) {
      const apiError = toApiError(error)
      loadError.value = apiError
      throw apiError
    } finally {
      if (!options.silent) {
        isTagsLoading.value = false
      }
    }
  }

  const loadDictionaries = async (options: LoadOptions = {}): Promise<void> => {
    await Promise.all([loadTagTypes(options), loadTags({}, options)])
  }

  const createGame = async (payload: AdminGameFormPayload): Promise<void> => {
    await runSavingAction(async () => {
      await fetchAdminCreateGame(payload)
    })
  }

  const loadGame = async (id: string): Promise<AdminGame> => {
    try {
      return await fetchAdminGame(id)
    } catch (error: unknown) {
      const apiError = toApiError(error)
      throw apiError
    }
  }

  const updateGame = async (
    id: string,
    payload: AdminGameUpdatePayload,
    images: File[] = [],
  ): Promise<AdminGame> => {
    return await runSavingAction(async () => {
      await fetchAdminUpdateGame(id, payload)

      if (images.length > 0) {
        await fetchAdminAddGameImages(id, images)
      }

      const updatedGame = await fetchAdminGame(id)
      return updatedGame
    })
  }

  const deleteGame = async (id: string): Promise<void> => {
    if (deletingGameIds.value.includes(id)) {
      return
    }

    deletingGameIds.value = [...deletingGameIds.value, id]

    try {
      await fetchAdminDeleteGame(id)
      games.value = games.value.filter((game) => game.id !== id)
      gamesCount.value = Math.max(0, gamesCount.value - 1)
      gamesPagination.value = {
        ...gamesPagination.value,
        count: Math.max(0, gamesPagination.value.count - 1),
        total: Math.max(0, gamesPagination.value.total - 1),
      }
    } catch (error: unknown) {
      const apiError = toApiError(error)
      throw apiError
    } finally {
      deletingGameIds.value = deletingGameIds.value.filter((gameId) => gameId !== id)
    }
  }

  const deleteGameImage = async (gameId: string, imageId: string): Promise<AdminGame> => {
    if (deletingImageIds.value.includes(imageId)) {
      return await fetchAdminGame(gameId)
    }

    deletingImageIds.value = [...deletingImageIds.value, imageId]

    try {
      await fetchAdminDeleteGameImage(gameId, imageId)
      return await fetchAdminGame(gameId)
    } catch (error: unknown) {
      const apiError = toApiError(error)
      throw apiError
    } finally {
      deletingImageIds.value = deletingImageIds.value.filter((id) => id !== imageId)
    }
  }

  const reorderGameImages = async (gameId: string, imageIds: string[]): Promise<AdminGame> => {
    await fetchAdminReorderGameImages(gameId, imageIds)
    return await fetchAdminGame(gameId)
  }

  const createTag = async (payload: AdminTagPayload): Promise<void> => {
    await runSavingAction(async () => {
      await fetchAdminCreateTag(payload)
    })
  }

  const updateTag = async (id: string, payload: AdminTagPayload): Promise<void> => {
    await runSavingAction(async () => {
      await fetchAdminUpdateTag(id, payload)
    })
  }

  const deleteTag = async (id: string): Promise<void> => {
    if (deletingTagIds.value.includes(id)) {
      return
    }

    deletingTagIds.value = [...deletingTagIds.value, id]

    try {
      await fetchAdminDeleteTag(id)
    } catch (error: unknown) {
      const apiError = toApiError(error)
      throw apiError
    } finally {
      deletingTagIds.value = deletingTagIds.value.filter((tagId) => tagId !== id)
    }
  }

  const runSavingAction = async <T>(action: () => Promise<T>): Promise<T> => {
    try {
      isSaving.value = true
      return await action()
    } catch (error: unknown) {
      const apiError = toApiError(error)
      throw apiError
    } finally {
      isSaving.value = false
    }
  }

  return {
    createGame,
    createTag,
    deleteGame,
    deleteGameImage,
    deleteTag,
    deletingGameIds,
    deletingImageIds,
    deletingTagIds,
    games,
    gamesCount,
    gamesPagination,
    isGamesLoading,
    isGamesLoadingMore,
    isSaving,
    isTagsLoading,
    loadDictionaries,
    loadError,
    loadGame,
    loadGames,
    loadTags,
    loadTagTypes,
    reorderGameImages,
    tags,
    tagsPagination,
    tagTypeOptions,
    tagTypes,
    updateGame,
    updateTag,
  }
}

export { getTagTypeLabel }
