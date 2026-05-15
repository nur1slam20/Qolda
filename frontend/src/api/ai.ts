import client from './client'

export const aiApi = {
  generateDescription: (product_name: string, category?: string, details?: string) =>
    client
      .post<{ result: string }>('/ai/generate-description', { product_name, category, details })
      .then(r => r.data.result),

  chat: (message: string) =>
    client
      .post<{ result: string }>('/ai/chat', { message })
      .then(r => r.data.result),
}
