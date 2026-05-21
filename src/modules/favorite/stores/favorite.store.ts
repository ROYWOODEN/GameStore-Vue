import type { ApiError } from '@/shared/api/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FavoriteGame, FavoriteGameId } from '../types/favorite'

export const useFavoriteStore = defineStore('favorite', () => {
  const favoriteIds = ref<FavoriteGameId[]>([])
  const favorites = ref<FavoriteGame[]>([])
  const pendingFavoriteIds = ref<FavoriteGameId[]>([])

  const isFavoriteIdsLoading = ref<boolean>(false)
  const favoriteIdsLoadError = ref<ApiError | null>(null)

  const isFavoritesLoading = ref<boolean>(false)
  const favoritesLoadError = ref<ApiError | null>(null)

  const setFavoriteIds = (nextFavoriteIds: FavoriteGameId[]): void => {
    favoriteIds.value = nextFavoriteIds
  }

  const setFavorites = (nextFavorites: FavoriteGame[]): void => {
    favorites.value = nextFavorites
  }

  const setPendingFavorite = (gameId: FavoriteGameId, pending: boolean): void => {
    if (pending) {
      if (!pendingFavoriteIds.value.includes(gameId)) {
        pendingFavoriteIds.value = [...pendingFavoriteIds.value, gameId]
      }
      return
    }

    pendingFavoriteIds.value = pendingFavoriteIds.value.filter((id) => id !== gameId)
  }

  const addFavoriteId = (gameId: FavoriteGameId): void => {
    if (!favoriteIds.value.includes(gameId)) {
      favoriteIds.value = [...favoriteIds.value, gameId]
    }
  }

  const removeFavoriteId = (gameId: FavoriteGameId): void => {
    favoriteIds.value = favoriteIds.value.filter((id) => id !== gameId)
  }

  const removeFavoriteFromList = (gameId: FavoriteGameId): void => {
    favorites.value = favorites.value.filter((game) => game.id !== gameId)
  }

  const setFavoriteIdsLoading = (nextLoading: boolean): void => {
    isFavoriteIdsLoading.value = nextLoading
  }

  const setFavoritesLoading = (nextLoading: boolean): void => {
    isFavoritesLoading.value = nextLoading
  }

  const setFavoriteIdsLoadError = (error: ApiError | null): void => {
    favoriteIdsLoadError.value = error
  }

  const setFavoritesLoadError = (error: ApiError | null): void => {
    favoritesLoadError.value = error
  }

  const clearFavorites = (): void => {
    favoriteIds.value = []
    favorites.value = []
    pendingFavoriteIds.value = []
    favoriteIdsLoadError.value = null
    favoritesLoadError.value = null
  }

  return {
    addFavoriteId,
    clearFavorites,
    favoriteIds,
    favoriteIdsLoadError,
    favorites,
    favoritesLoadError,
    isFavoriteIdsLoading,
    isFavoritesLoading,
    pendingFavoriteIds,
    removeFavoriteFromList,
    removeFavoriteId,
    setFavoriteIds,
    setFavoriteIdsLoadError,
    setFavoriteIdsLoading,
    setFavorites,
    setFavoritesLoadError,
    setFavoritesLoading,
    setPendingFavorite,
  }
})
