import client from './client'
import type { AdminStats } from './types'

export const adminApi = {
  stats: () =>
    client.get<AdminStats>('/admin/stats').then(r => r.data),

  retrain: () =>
    client.post('/admin/retrain').then(r => r.data),
}
