import client from './client'
import type { Order, SellerOrder } from './types'

export const ordersApi = {
  create: (
    items: { product_id: number; quantity: number }[],
    delivery_address: string,
    customer_name?: string,
    customer_phone?: string,
  ) =>
    client
      .post<Order>('/orders', { items, delivery_address, customer_name, customer_phone })
      .then(r => r.data),

  getUserOrders: (userId: number) =>
    client.get<Order[]>(`/orders/${userId}`).then(r => r.data),

  getSellerOrders: () =>
    client.get<SellerOrder[]>('/orders/seller').then(r => r.data),

  updateStatus: (orderId: number, status: string) =>
    client.patch<SellerOrder>(`/orders/${orderId}/status`, { status }).then(r => r.data),
}
