import client from './client'
import type { Order, OrderStatusHistory, SellerOrder } from './types'

export const ordersApi = {
  create: (
    items: { product_id: number; quantity: number }[],
    delivery_address: string,
    customer_name?: string,
    customer_phone?: string,
    delivery_service_id?: number,
  ) =>
    client
      .post<Order>('/orders', { items, delivery_address, customer_name, customer_phone, delivery_service_id })
      .then(r => r.data),

  getUserOrders: (userId: number) =>
    client.get<Order[]>(`/orders/${userId}`).then(r => r.data),

  getSellerOrders: () =>
    client.get<SellerOrder[]>('/orders/seller').then(r => r.data),

  updateStatus: (orderId: number, status: string) =>
    client.patch<SellerOrder>(`/orders/${orderId}/status`, { status }).then(r => r.data),

  getOrderHistory: (orderId: number) =>
    client.get<OrderStatusHistory[]>(`/orders/${orderId}/history`).then(r => r.data),

  cancelOrder: (orderId: number) =>
    client.post<Order>(`/orders/${orderId}/cancel`).then(r => r.data),
}
