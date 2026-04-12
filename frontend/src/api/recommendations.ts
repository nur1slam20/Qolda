import client from './client'
import type { Recommendation } from './types'

export const recsApi = {
  forUser: (userId: number, limit = 8) =>
    client.get<Recommendation[]>(`/recommendations/${userId}`, { params: { limit } }).then(r => r.data),

  popular: (limit = 8) =>
    client.get<Recommendation[]>('/recommendations/popular', { params: { limit } }).then(r => r.data),

  logClick: (userId: number, productId: number, method: string) =>
    client.post('/recommendations/click', { user_id: userId, product_id: productId, method }),
}
