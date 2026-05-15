import client from './client'
import type { DeliveryService } from './types'

export const deliveryApi = {
  getAll: () =>
    client.get<DeliveryService[]>('/delivery-services').then(r => r.data),
}
