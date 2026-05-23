export type CheckoutSource = 'basket'
export type OrderStatus = 'waiting_for_payment' | 'paid' | 'canceled' | 'failed'
export type PaymentStatus = 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled' | 'failed'

export type CreateCheckoutPaymentPayload = string[]

export interface CheckoutPayment {
  orderId: string
  paymentId: string
  externalPaymentId: string
  status: string
  confirmationUrl: string | null
  amount: string
  currency: 'RUB'
}

export interface OrderItem {
  id: string
  game_id: string
  title_snapshot: string
  price_snapshot: string
}

export interface OrderPayment {
  id: string
  provider: string
  status: PaymentStatus
  amount: string
  currency: 'RUB'
  confirmation_url: string | null
  paid_at: string | null
  canceled_at: string | null
}

export interface OrderDetails {
  id: string
  status: OrderStatus
  source: CheckoutSource
  currency: 'RUB'
  total_amount: string
  paid_at: string | null
  canceled_at: string | null
  created_at: string
  items: OrderItem[]
  payment: OrderPayment | null
}

export interface OrdersQuery {
  limit?: number
  source?: CheckoutSource
  status?: OrderStatus
  syncPending?: boolean
}
