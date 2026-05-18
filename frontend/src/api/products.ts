import client from './client'
import type { Product, ProductList, ProductCreate, ProductUpdate, PlagiarismResult } from './types'

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

  update: (id: number, data: ProductUpdate) =>
    client.put<Product>(`/products/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    client.delete(`/products/${id}`).then(r => r.data),

  getMine: (page = 1) =>
    client.get<ProductList>('/products/mine', { params: { page, limit: 50 } }).then(r => r.data),

  checkPlagiarism: (id: number) =>
    client.get<PlagiarismResult>(`/products/${id}/plagiarism`).then(r => r.data),

  recentlyViewed: (limit = 8) =>
    client.get<Product[]>('/products/recently-viewed', { params: { limit } }).then(r => r.data),

  updateStock: (id: number, stock: number) =>
    client.patch<Product>(`/products/${id}/stock`, { stock }).then(r => r.data),
}
