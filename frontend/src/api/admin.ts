import client from './client'
import type { AdminStats, User, Product } from './types'

export interface AdminOrder {
  id: number
  total_amount: number
  status: string
  customer_name?: string
  customer_phone?: string
  delivery_address?: string
  buyer_name: string
  buyer_email: string
  created_at: string
  items_count: number
}

export const adminApi = {
  stats: () =>
    client.get<AdminStats>('/admin/stats').then(r => r.data),

  retrain: () =>
    client.post('/admin/retrain').then(r => r.data),

  getUsers: () =>
    client.get<User[]>('/admin/users').then(r => r.data),

  updateUserRole: (userId: number, data: { is_seller?: boolean; is_admin?: boolean }) =>
    client.patch<User>(`/admin/users/${userId}`, data).then(r => r.data),

  deleteUser: (userId: number) =>
    client.delete(`/admin/users/${userId}`).then(r => r.data),

  getProducts: () =>
    client.get<Product[]>('/admin/products').then(r => r.data),

  deleteProduct: (productId: number) =>
    client.delete(`/admin/products/${productId}`).then(r => r.data),

  getOrders: (status?: string) =>
    client.get<AdminOrder[]>('/admin/orders', { params: status ? { status } : {} }).then(r => r.data),

  updateOrderStatus: (orderId: number, status: string) =>
    client.patch(`/admin/orders/${orderId}/status`, { status }).then(r => r.data),
}
