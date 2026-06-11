import { toApiError } from '@/shared/api/error'
import { storeToRefs } from 'pinia'
import {
  fetchAddFavorite,
  fetchFavoriteIds,
  fetchFavorites,
  fetchRemoveFavorite,
} from '../api/favorites.api'
import { useFavoriteStore } from '../stores/favorite.store'
import type { FavoriteGameId } from '../types/favorite'

export const useFavorites = () => {
  const favoriteStore = useFavoriteStore()
  const {
    favoriteIds,
    favoriteIdsLoadError,
    favorites,
    favoritesLoadError,
    isFavoriteIdsLoading,
    isFavoritesLoading,
    pendingFavoriteIds,
  } = storeToRefs(favoriteStore)

  const getFavoriteIds = async (): Promise<void> => {
    if (isFavoriteIdsLoading.value) {
      return
    }

    try {
      favoriteStore.setFavoriteIdsLoading(true)
      favoriteStore.setFavoriteIdsLoadError(null)
      favoriteStore.setFavoriteIds(await fetchFavoriteIds())
    } catch (error: unknown) {
      const apiError = toApiError(error)
      favoriteStore.setFavoriteIdsLoadError(apiError)
      throw apiError
    } finally {
      favoriteStore.setFavoriteIdsLoading(false)
    }
  }

  const getFavorites = async (): Promise<void> => {
    if (isFavoritesLoading.value) {
      return
    }

    try {
      favoriteStore.setFavoritesLoading(true)
      favoriteStore.setFavoritesLoadError(null)

      const nextFavorites = await fetchFavorites()
      favoriteStore.setFavorites(nextFavorites)
      favoriteStore.setFavoriteIds(nextFavorites.map((game) => game.id))
    } catch (error: unknown) {
      const apiError = toApiError(error)
      favoriteStore.setFavoritesLoadError(apiError)
      throw apiError
    } finally {
      favoriteStore.setFavoritesLoading(false)
    }
  }

  const addFavorite = async (gameId: FavoriteGameId): Promise<void> => {
    if (pendingFavoriteIds.value.includes(gameId)) {
      return
    }

    try {
      favoriteStore.setPendingFavorite(gameId, true)
      await fetchAddFavorite(gameId)
      favoriteStore.addFavoriteId(gameId)
    } catch (error: unknown) {
      throw toApiError(error)
    } finally {
      favoriteStore.setPendingFavorite(gameId, false)
    }
  }

  const removeFavorite = async (gameId: FavoriteGameId): Promise<void> => {
    if (pendingFavoriteIds.value.includes(gameId)) {
      return
    }

    try {
      favoriteStore.setPendingFavorite(gameId, true)
      await fetchRemoveFavorite(gameId)
      favoriteStore.removeFavoriteId(gameId)
      favoriteStore.removeFavoriteFromList(gameId)
    } catch (error: unknown) {
      throw toApiError(error)
    } finally {
      favoriteStore.setPendingFavorite(gameId, false)
    }
  }

  const toggleFavorite = async (gameId: FavoriteGameId, isFavorite: boolean): Promise<void> => {
    if (isFavorite) {
      await removeFavorite(gameId)
      return
    }

    await addFavorite(gameId)
  }

  return {
    addFavorite,
    clearFavorites: favoriteStore.clearFavorites,
    favoriteIds,
    favoriteIdsLoadError,
    favorites,
    favoritesLoadError,
    getFavoriteIds,
    getFavorites,
    isFavoriteIdsLoading,
    isFavoritesLoading,
    pendingFavoriteIds,
    removeFavorite,
    toggleFavorite,
  }
}
