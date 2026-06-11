import { useAuth } from '@/modules/auth'
import { useBasket } from '@/modules/basket'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

export const useBasketBadge = () => {
  const route = useRoute()
  const { t } = useI18n()
  const { isAuthenticated, isSessionInitialized } = useAuth()
  const { basketCount, clearBasketState, getBasketIds, hasBasketIdsLoaded, isBasketIdsLoading } =
    useBasket()
  const { showApiError } = useApiErrorToast()

  const displayBasketCount = computed(() =>
    basketCount.value > 99 ? '99+' : String(basketCount.value),
  )
  const cartLabel = computed(() =>
    basketCount.value > 0
      ? t('header.cartWithCount', { count: basketCount.value })
      : t('header.cart'),
  )

  const loadBasketIdsIfNeeded = async (): Promise<void> => {
    if (route.name === 'basket' || hasBasketIdsLoaded.value || isBasketIdsLoading.value) {
      return
    }

    try {
      await getBasketIds()
    } catch (error: unknown) {
      showApiError(error)
    }
  }

  const syncBasketBadge = async (): Promise<void> => {
    if (!isSessionInitialized.value) {
      return
    }

    if (!isAuthenticated.value) {
      clearBasketState()
      return
    }

    await loadBasketIdsIfNeeded()
  }

  watch(
    [isSessionInitialized, isAuthenticated, () => route.name],
    () => {
      void syncBasketBadge()
    },
    { immediate: true },
  )

  return {
    basketCount,
    cartLabel,
    displayBasketCount,
  }
}
