import type { ApiError } from '@/shared/api/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { OrderDetails } from '../types/payment'

export const usePaymentStore = defineStore('payment', () => {
  const isCheckoutLoading = ref(false)
  const isRecentOrdersLoading = ref(false)
  const recentOrders = ref<OrderDetails[]>([])
  const orderStatusLoadingIds = ref<string[]>([])
  const checkoutError = ref<ApiError | null>(null)
  const recentOrdersError = ref<ApiError | null>(null)

  const setCheckoutLoading = (loading: boolean): void => {
    isCheckoutLoading.value = loading
  }

  const setRecentOrdersLoading = (loading: boolean): void => {
    isRecentOrdersLoading.value = loading
  }

  const setRecentOrders = (orders: OrderDetails[]): void => {
    recentOrders.value = orders
  }

  const upsertRecentOrder = (order: OrderDetails): void => {
    if (!recentOrders.value.some((recentOrder) => recentOrder.id === order.id)) {
      recentOrders.value = [order, ...recentOrders.value].slice(0, 5)
      return
    }

    recentOrders.value = recentOrders.value.map((recentOrder) =>
      recentOrder.id === order.id ? order : recentOrder,
    )
  }

  const setOrderStatusLoading = (orderId: string, loading: boolean): void => {
    if (loading) {
      if (!orderStatusLoadingIds.value.includes(orderId)) {
        orderStatusLoadingIds.value = [...orderStatusLoadingIds.value, orderId]
      }
      return
    }

    orderStatusLoadingIds.value = orderStatusLoadingIds.value.filter((id) => id !== orderId)
  }

  const setCheckoutError = (error: ApiError | null): void => {
    checkoutError.value = error
  }

  const setRecentOrdersError = (error: ApiError | null): void => {
    recentOrdersError.value = error
  }

  const clearPaymentState = (): void => {
    isCheckoutLoading.value = false
    isRecentOrdersLoading.value = false
    recentOrders.value = []
    orderStatusLoadingIds.value = []
    checkoutError.value = null
    recentOrdersError.value = null
  }

  return {
    checkoutError,
    clearPaymentState,
    isCheckoutLoading,
    isRecentOrdersLoading,
    orderStatusLoadingIds,
    recentOrders,
    recentOrdersError,
    setCheckoutError,
    setCheckoutLoading,
    setOrderStatusLoading,
    setRecentOrders,
    setRecentOrdersError,
    setRecentOrdersLoading,
    upsertRecentOrder,
  }
})
