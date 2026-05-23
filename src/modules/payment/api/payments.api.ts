import { api } from '@/shared/api/http'
import { apiRequest } from '@/shared/api/request'
import type {
  CheckoutPayment,
  CreateCheckoutPaymentPayload,
  OrderDetails,
  OrdersQuery,
} from '../types/payment'

export const fetchCreateCheckoutPayment = async (
  payload: CreateCheckoutPaymentPayload,
): Promise<CheckoutPayment> => {
  return await apiRequest<CheckoutPayment>(api.post('/payments/checkout', payload))
}

const buildOrdersParams = (query: OrdersQuery = {}) => ({
  limit: query.limit,
  source: query.source,
  status: query.status,
  sync_pending: query.syncPending,
})

export const fetchCurrentUserOrders = async (query: OrdersQuery = {}): Promise<OrderDetails[]> => {
  return await apiRequest<OrderDetails[]>(api.get('/orders', { params: buildOrdersParams(query) }))
}

export const fetchCurrentUserPendingOrders = async (
  query: Omit<OrdersQuery, 'status'> = {},
): Promise<OrderDetails[]> => {
  return await apiRequest<OrderDetails[]>(
    api.get('/orders/pending', { params: buildOrdersParams(query) }),
  )
}

export const fetchCurrentUserOrderStatus = async (orderId: string): Promise<OrderDetails> => {
  return await apiRequest<OrderDetails>(api.get(`/orders/${orderId}/status`))
}
