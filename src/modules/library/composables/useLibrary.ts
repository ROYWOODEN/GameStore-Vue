import { toApiError } from '@/shared/api/error'
import { storeToRefs } from 'pinia'
import { fetchLibrary, fetchLibraryIds } from '../api/library.api'
import { useLibraryStore } from '../stores/library.store'

export const useLibrary = () => {
  const libraryStore = useLibraryStore()
  const {
    hasLibraryIdsLoaded,
    hasLibraryLoaded,
    isLibraryIdsLoading,
    isLibraryLoading,
    libraryIds,
    libraryIdsLoadError,
    libraryItems,
    libraryLoadError,
  } = storeToRefs(libraryStore)

  const getLibraryIds = async (): Promise<void> => {
    if (isLibraryIdsLoading.value) {
      return
    }

    try {
      libraryStore.setLibraryIdsLoading(true)
      libraryStore.setLibraryIdsLoadError(null)
      libraryStore.setLibraryIds(await fetchLibraryIds())
    } catch (error: unknown) {
      const apiError = toApiError(error)
      libraryStore.setLibraryIdsLoadError(apiError)
      throw apiError
    } finally {
      libraryStore.setLibraryIdsLoading(false)
    }
  }

  const getLibrary = async (): Promise<void> => {
    if (isLibraryLoading.value) {
      return
    }

    try {
      libraryStore.setLibraryLoading(true)
      libraryStore.setLibraryLoadError(null)

      const nextLibraryItems = await fetchLibrary()
      libraryStore.setLibraryItems(nextLibraryItems)
      libraryStore.setLibraryIds(nextLibraryItems.map((game) => game.id))
    } catch (error: unknown) {
      const apiError = toApiError(error)
      libraryStore.setLibraryLoadError(apiError)
      throw apiError
    } finally {
      libraryStore.setLibraryLoading(false)
    }
  }

  return {
    clearLibraryState: libraryStore.clearLibraryState,
    getLibrary,
    getLibraryIds,
    hasLibraryIdsLoaded,
    hasLibraryLoaded,
    isLibraryIdsLoading,
    isLibraryLoading,
    libraryIds,
    libraryIdsLoadError,
    libraryItems,
    libraryLoadError,
  }
}
