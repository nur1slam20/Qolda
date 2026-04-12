import client from './client'
import type { Review } from './types'

export const reviewsApi = {
  getForProduct: (productId: number) =>
    client.get<Review[]>(`/reviews/${productId}`).then(r => r.data),

  create: (product_id: number, rating: number, text?: string) =>
    client.post<Review>('/reviews', { product_id, rating, text }).then(r => r.data),
}
