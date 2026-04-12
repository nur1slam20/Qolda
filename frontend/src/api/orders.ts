import client from './client'
import type { Order } from './types'

export const ordersApi = {
  create: (items: { product_id: number; quantity: number }[], delivery_address: string) =>
    client.post<Order>('/orders', { items, delivery_address }).then(r => r.data),

  getUserOrders: (userId: number) =>
    client.get<Order[]>(`/orders/${userId}`).then(r => r.data),
}
