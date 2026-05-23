import { toApiError } from '@/shared/api/error'
import { storeToRefs } from 'pinia'
import {
  fetchAddBasketItem,
  fetchBasket,
  fetchBasketIds,
  fetchClearBasket,
  fetchRemoveBasketItem,
} from '../api/basket.api'
import { useBasketStore } from '../stores/basket.store'
import type { BasketGame, BasketGameId } from '../types/basket'

const isBasketGame = (game: BasketGame | Pick<BasketGame, 'id' | 'price'>): game is BasketGame => {
  return 'description' in game && 'media' in game && 'tags' in game && 'title' in game
}

export const useBasket = () => {
  const basketStore = useBasketStore()
  const {
    basketCount,
    basketIds,
    basketIdsLoadError,
    basketItems,
    basketLoadError,
    basketMeta,
    hasBasketIdsLoaded,
    hasBasketLoaded,
    isBasketClearing,
    isBasketIdsLoading,
    isBasketLoading,
    pendingBasketIds,
    selectedBasketIds,
  } = storeToRefs(basketStore)

  const getBasketIds = async (): Promise<void> => {
    if (isBasketIdsLoading.value) {
      return
    }

    try {
      basketStore.setBasketIdsLoading(true)
      basketStore.setBasketIdsLoadError(null)

      const basket = await fetchBasketIds()
      basketStore.setBasketIds(basket.data)
      basketStore.setBasketIdsMeta(basket.meta?.count)
    } catch (error: unknown) {
      const apiError = toApiError(error)
      basketStore.setBasketIdsLoadError(apiError)
      throw apiError
    } finally {
      basketStore.setBasketIdsLoading(false)
    }
  }

  const getBasket = async (): Promise<void> => {
    if (isBasketLoading.value) {
      return
    }

    try {
      basketStore.setBasketLoading(true)
      basketStore.setBasketLoadError(null)

      const basket = await fetchBasket()
      basketStore.setBasketItems(basket.data)
      basketStore.setBasketIds(basket.data.map((game) => game.id))
      basketStore.setBasketMeta(basket.meta)
    } catch (error: unknown) {
      const apiError = toApiError(error)
      basketStore.setBasketLoadError(apiError)
      throw apiError
    } finally {
      basketStore.setBasketLoading(false)
    }
  }

  const addBasketItem = async (
    game: BasketGame | Pick<BasketGame, 'id' | 'price'>,
  ): Promise<void> => {
    if (pendingBasketIds.value.includes(game.id) || basketIds.value.includes(game.id)) {
      return
    }

    try {
      basketStore.setPendingBasket(game.id, true)
      await fetchAddBasketItem(game.id)
      basketStore.addBasketId(game.id, game.price)

      if (isBasketGame(game)) {
        basketStore.addBasketItemToList(game)
      }
    } catch (error: unknown) {
      throw toApiError(error)
    } finally {
      basketStore.setPendingBasket(game.id, false)
    }
  }

  const removeBasketItem = async (
    game: BasketGameId | Pick<BasketGame, 'id' | 'price'>,
  ): Promise<void> => {
    const gameId = typeof game === 'string' ? game : game.id
    const price =
      typeof game === 'string'
        ? basketItems.value.find((item) => item.id === game)?.price
        : game.price

    if (pendingBasketIds.value.includes(gameId)) {
      return
    }

    try {
      basketStore.setPendingBasket(gameId, true)
      await fetchRemoveBasketItem(gameId)
      basketStore.removeBasketId(gameId, price)
      basketStore.removeBasketItemFromList(gameId)
    } catch (error: unknown) {
      throw toApiError(error)
    } finally {
      basketStore.setPendingBasket(gameId, false)
    }
  }

  const removeBasketItems = async (games: Pick<BasketGame, 'id' | 'price'>[]): Promise<void> => {
    const uniqueGames = games.filter(
      (game, index, list) => list.findIndex((nextGame) => nextGame.id === game.id) === index,
    )
    const removableGames = uniqueGames.filter((game) => !pendingBasketIds.value.includes(game.id))

    if (removableGames.length === 0) {
      return
    }

    try {
      removableGames.forEach((game) => basketStore.setPendingBasket(game.id, true))
      const removeResults = await Promise.allSettled(
        removableGames.map(async (game) => {
          await fetchRemoveBasketItem(game.id)
          return game
        }),
      )

      removeResults.forEach((result) => {
        if (result.status !== 'fulfilled') {
          return
        }

        basketStore.removeBasketId(result.value.id, result.value.price)
        basketStore.removeBasketItemFromList(result.value.id)
      })

      const failedRemoval = removeResults.find((result) => result.status === 'rejected')
      if (failedRemoval?.status === 'rejected') {
        throw toApiError(failedRemoval.reason)
      }
    } catch (error: unknown) {
      throw toApiError(error)
    } finally {
      removableGames.forEach((game) => basketStore.setPendingBasket(game.id, false))
    }
  }

  const toggleBasketItem = async (
    game: BasketGame | Pick<BasketGame, 'id' | 'price'>,
    isInBasket: boolean,
  ): Promise<void> => {
    if (isInBasket) {
      await removeBasketItem(game)
      return
    }

    await addBasketItem(game)
  }

  const clearBasket = async (): Promise<void> => {
    if (isBasketClearing.value) {
      return
    }

    try {
      basketStore.setBasketClearing(true)
      await fetchClearBasket()
      basketStore.clearBasketState()
    } catch (error: unknown) {
      throw toApiError(error)
    } finally {
      basketStore.setBasketClearing(false)
    }
  }

  return {
    addBasketItem,
    basketCount,
    basketIds,
    basketIdsLoadError,
    basketItems,
    basketLoadError,
    basketMeta,
    clearBasket,
    clearBasketState: basketStore.clearBasketState,
    getBasket,
    getBasketIds,
    hasBasketIdsLoaded,
    hasBasketLoaded,
    isBasketClearing,
    isBasketIdsLoading,
    isBasketLoading,
    pendingBasketIds,
    removeBasketItem,
    removeBasketItems,
    clearBasketSelection: basketStore.clearBasketSelection,
    selectAllBasketItems: basketStore.selectAllBasketItems,
    selectedBasketIds,
    setBasketSelected: basketStore.setBasketSelected,
    setSelectedBasketIds: basketStore.setSelectedBasketIds,
    toggleBasketItem,
  }
}
