import { toApiError } from '@/shared/api/error'
import { storeToRefs } from 'pinia'
import {
  fetchCreateCheckoutPayment,
  fetchCurrentUserOrderStatus,
  fetchCurrentUserOrders,
  fetchCurrentUserPendingOrders,
} from '../api/payments.api'
import { usePaymentStore } from '../stores/payment.store'
import type { CheckoutPayment, OrderDetails } from '../types/payment'

export const useCheckoutPayment = () => {
  const paymentStore = usePaymentStore()
  const {
    checkoutError,
    isCheckoutLoading,
    isRecentOrdersLoading,
    orderStatusLoadingIds,
    recentOrders,
    recentOrdersError,
  } = storeToRefs(paymentStore)

  const createCheckout = async (gameIds: string[]): Promise<CheckoutPayment> => {
    try {
      paymentStore.setCheckoutLoading(true)
      paymentStore.setCheckoutError(null)
      return await fetchCreateCheckoutPayment(gameIds)
    } catch (error: unknown) {
      const apiError = toApiError(error)
      paymentStore.setCheckoutError(apiError)
      throw apiError
    } finally {
      paymentStore.setCheckoutLoading(false)
    }
  }

  const getRecentBasketOrders = async (): Promise<OrderDetails[]> => {
    try {
      paymentStore.setRecentOrdersLoading(true)
      paymentStore.setRecentOrdersError(null)
      const orders = await fetchCurrentUserOrders({
        limit: 5,
        source: 'basket',
        syncPending: true,
      })
      paymentStore.setRecentOrders(orders)
      return orders
    } catch (error: unknown) {
      const apiError = toApiError(error)
      paymentStore.setRecentOrdersError(apiError)
      throw apiError
    } finally {
      paymentStore.setRecentOrdersLoading(false)
    }
  }

  const getPendingBasketOrders = async (syncPending = true): Promise<OrderDetails[]> => {
    try {
      return await fetchCurrentUserPendingOrders({
        limit: 5,
        source: 'basket',
        syncPending,
      })
    } catch (error: unknown) {
      throw toApiError(error)
    }
  }

  const getOrderStatus = async (orderId: string): Promise<OrderDetails> => {
    try {
      paymentStore.setOrderStatusLoading(orderId, true)
      const order = await fetchCurrentUserOrderStatus(orderId)
      paymentStore.upsertRecentOrder(order)
      return order
    } catch (error: unknown) {
      throw toApiError(error)
    } finally {
      paymentStore.setOrderStatusLoading(orderId, false)
    }
  }

  return {
    checkoutError,
    clearPaymentState: paymentStore.clearPaymentState,
    createCheckout,
    getOrderStatus,
    getPendingBasketOrders,
    getRecentBasketOrders,
    isCheckoutLoading,
    isRecentOrdersLoading,
    orderStatusLoadingIds,
    recentOrders,
    recentOrdersError,
  }
}
