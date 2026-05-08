import client from './client'
import type { SellerStats } from './types'

export const sellerApi = {
  getStats: () =>
    client.get<SellerStats>('/seller/stats').then(r => r.data),
}
