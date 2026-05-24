import type { ApiError } from '@/shared/api/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LibraryGame, LibraryGameId } from '../types/library'

export const useLibraryStore = defineStore('library', () => {
  const libraryIds = ref<LibraryGameId[]>([])
  const libraryItems = ref<LibraryGame[]>([])

  const isLibraryIdsLoading = ref<boolean>(false)
  const libraryIdsLoadError = ref<ApiError | null>(null)
  const hasLibraryIdsLoaded = ref<boolean>(false)

  const isLibraryLoading = ref<boolean>(false)
  const libraryLoadError = ref<ApiError | null>(null)
  const hasLibraryLoaded = ref<boolean>(false)

  const setLibraryIds = (nextLibraryIds: LibraryGameId[]): void => {
    libraryIds.value = nextLibraryIds
    hasLibraryIdsLoaded.value = true
  }

  const setLibraryItems = (nextLibraryItems: LibraryGame[]): void => {
    libraryItems.value = nextLibraryItems
    hasLibraryLoaded.value = true
  }

  const setLibraryIdsLoading = (nextLoading: boolean): void => {
    isLibraryIdsLoading.value = nextLoading
  }

  const setLibraryLoading = (nextLoading: boolean): void => {
    isLibraryLoading.value = nextLoading
  }

  const setLibraryIdsLoadError = (error: ApiError | null): void => {
    libraryIdsLoadError.value = error
  }

  const setLibraryLoadError = (error: ApiError | null): void => {
    libraryLoadError.value = error
  }

  const clearLibraryState = (): void => {
    libraryIds.value = []
    libraryItems.value = []
    libraryIdsLoadError.value = null
    libraryLoadError.value = null
    hasLibraryIdsLoaded.value = false
    hasLibraryLoaded.value = false
  }

  return {
    clearLibraryState,
    hasLibraryIdsLoaded,
    hasLibraryLoaded,
    isLibraryIdsLoading,
    isLibraryLoading,
    libraryIds,
    libraryIdsLoadError,
    libraryItems,
    libraryLoadError,
    setLibraryIds,
    setLibraryIdsLoadError,
    setLibraryIdsLoading,
    setLibraryItems,
    setLibraryLoadError,
    setLibraryLoading,
  }
})
