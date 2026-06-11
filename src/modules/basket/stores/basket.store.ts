import type { ApiError } from '@/shared/api/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { addPriceToTotal, EMPTY_BASKET_TOTAL, subtractPriceFromTotal } from '../lib/basket-money'
import type { BasketGame, BasketGameId, BasketMeta } from '../types/basket'

const createEmptyMeta = (): BasketMeta => ({
  count: 0,
  totalAmount: EMPTY_BASKET_TOTAL,
})

export const useBasketStore = defineStore('basket', () => {
  const basketIds = ref<BasketGameId[]>([])
  const basketItems = ref<BasketGame[]>([])
  const basketMeta = ref<BasketMeta>(createEmptyMeta())
  const pendingBasketIds = ref<BasketGameId[]>([])
  const selectedBasketIds = ref<BasketGameId[]>([])

  const isBasketIdsLoading = ref<boolean>(false)
  const basketIdsLoadError = ref<ApiError | null>(null)
  const hasBasketIdsLoaded = ref<boolean>(false)

  const isBasketLoading = ref<boolean>(false)
  const basketLoadError = ref<ApiError | null>(null)
  const hasBasketLoaded = ref<boolean>(false)

  const isBasketClearing = ref<boolean>(false)

  const basketCount = computed(() => basketMeta.value.count ?? basketIds.value.length)

  const setBasketIds = (nextBasketIds: BasketGameId[]): void => {
    basketIds.value = nextBasketIds
    selectedBasketIds.value = selectedBasketIds.value.filter((id) => nextBasketIds.includes(id))
    hasBasketIdsLoaded.value = true
  }

  const setBasketItems = (nextBasketItems: BasketGame[]): void => {
    basketItems.value = nextBasketItems
    hasBasketLoaded.value = true
  }

  const setBasketMeta = (nextBasketMeta?: BasketMeta): void => {
    basketMeta.value = {
      count: nextBasketMeta?.count,
      totalAmount: nextBasketMeta?.totalAmount,
    }
  }

  const setBasketIdsMeta = (count?: number): void => {
    basketMeta.value = {
      ...basketMeta.value,
      count,
    }
  }

  const setPendingBasket = (gameId: BasketGameId, pending: boolean): void => {
    if (pending) {
      if (!pendingBasketIds.value.includes(gameId)) {
        pendingBasketIds.value = [...pendingBasketIds.value, gameId]
      }
      return
    }

    pendingBasketIds.value = pendingBasketIds.value.filter((id) => id !== gameId)
  }

  const addBasketId = (gameId: BasketGameId, price?: string): void => {
    if (basketIds.value.includes(gameId)) {
      return
    }

    basketIds.value = [...basketIds.value, gameId]
    basketMeta.value = {
      count: basketIds.value.length,
      totalAmount: addPriceToTotal(basketMeta.value.totalAmount, price),
    }
    hasBasketIdsLoaded.value = true
  }

  const addBasketItemToList = (game: BasketGame): void => {
    if (basketItems.value.some((basketGame) => basketGame.id === game.id)) {
      return
    }

    basketItems.value = [...basketItems.value, game]
    hasBasketLoaded.value = true
  }

  const removeBasketId = (gameId: BasketGameId, price?: string): void => {
    if (!basketIds.value.includes(gameId)) {
      return
    }

    basketIds.value = basketIds.value.filter((id) => id !== gameId)
    selectedBasketIds.value = selectedBasketIds.value.filter((id) => id !== gameId)
    basketMeta.value = {
      count: basketIds.value.length,
      totalAmount: subtractPriceFromTotal(basketMeta.value.totalAmount, price),
    }
  }

  const removeBasketItemFromList = (gameId: BasketGameId): void => {
    basketItems.value = basketItems.value.filter((game) => game.id !== gameId)
  }

  const setSelectedBasketIds = (nextSelectedBasketIds: BasketGameId[]): void => {
    const basketIdSet = new Set(basketIds.value)
    selectedBasketIds.value = nextSelectedBasketIds.filter((id) => basketIdSet.has(id))
  }

  const setBasketSelected = (gameId: BasketGameId, selected: boolean): void => {
    if (selected) {
      setSelectedBasketIds([...selectedBasketIds.value, gameId])
      return
    }

    selectedBasketIds.value = selectedBasketIds.value.filter((id) => id !== gameId)
  }

  const selectAllBasketItems = (): void => {
    selectedBasketIds.value = [...basketIds.value]
  }

  const clearBasketSelection = (): void => {
    selectedBasketIds.value = []
  }

  const setBasketIdsLoading = (nextLoading: boolean): void => {
    isBasketIdsLoading.value = nextLoading
  }

  const setBasketLoading = (nextLoading: boolean): void => {
    isBasketLoading.value = nextLoading
  }

  const setBasketClearing = (nextClearing: boolean): void => {
    isBasketClearing.value = nextClearing
  }

  const setBasketIdsLoadError = (error: ApiError | null): void => {
    basketIdsLoadError.value = error
  }

  const setBasketLoadError = (error: ApiError | null): void => {
    basketLoadError.value = error
  }

  const clearBasketState = (): void => {
    basketIds.value = []
    basketItems.value = []
    basketMeta.value = createEmptyMeta()
    pendingBasketIds.value = []
    selectedBasketIds.value = []
    basketIdsLoadError.value = null
    basketLoadError.value = null
    hasBasketIdsLoaded.value = false
    hasBasketLoaded.value = false
    isBasketClearing.value = false
  }

  return {
    addBasketId,
    addBasketItemToList,
    basketCount,
    basketIds,
    basketIdsLoadError,
    basketItems,
    basketLoadError,
    basketMeta,
    clearBasketState,
    clearBasketSelection,
    hasBasketIdsLoaded,
    hasBasketLoaded,
    isBasketClearing,
    isBasketIdsLoading,
    isBasketLoading,
    pendingBasketIds,
    removeBasketId,
    removeBasketItemFromList,
    selectedBasketIds,
    selectAllBasketItems,
    setBasketClearing,
    setBasketIds,
    setBasketIdsLoadError,
    setBasketIdsLoading,
    setBasketIdsMeta,
    setBasketItems,
    setBasketLoadError,
    setBasketLoading,
    setBasketMeta,
    setBasketSelected,
    setSelectedBasketIds,
    setPendingBasket,
  }
})
