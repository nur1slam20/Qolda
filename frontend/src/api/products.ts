import client from './client'
import type { Product, ProductList, ProductCreate, PlagiarismResult } from './types'

export const productsApi = {
  list: (params?: Record<string, unknown>) =>
    client.get<ProductList>('/products', { params }).then(r => r.data),

  search: (q: string, page = 1) =>
    client.get<ProductList>('/products/search', { params: { q, page } }).then(r => r.data),

  get: (id: number) =>
    client.get<Product>(`/products/${id}`).then(r => r.data),

  categories: () =>
    client.get<string[]>('/products/categories').then(r => r.data),

  create: (data: ProductCreate) =>
    client.post<Product>('/products', data).then(r => r.data),

  delete: (id: number) =>
    client.delete(`/products/${id}`).then(r => r.data),

  getMine: (page = 1) =>
    client.get<ProductList>('/products/mine', { params: { page, limit: 50 } }).then(r => r.data),

  checkPlagiarism: (id: number) =>
    client.get<PlagiarismResult>(`/products/${id}/plagiarism`).then(r => r.data),
}
