import client from './client'
import type { Product, ProductList } from './types'

export const productsApi = {
  list: (params?: Record<string, unknown>) =>
    client.get<ProductList>('/products', { params }).then(r => r.data),

  search: (q: string, page = 1) =>
    client.get<ProductList>('/products/search', { params: { q, page } }).then(r => r.data),

  get: (id: number) =>
    client.get<Product>(`/products/${id}`).then(r => r.data),

  categories: () =>
    client.get<string[]>('/products/categories').then(r => r.data),
}
