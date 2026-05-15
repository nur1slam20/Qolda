import client from './client'
import type { User } from './types'

interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export const authApi = {
  register: (name: string, email: string, password: string, is_seller = false) =>
    client.post<AuthResponse>('/auth/register', { name, email, password, is_seller }).then(r => r.data),

  login: (email: string, password: string) =>
    client.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data),

  getMe: () =>
    client.get<User>('/auth/me').then(r => r.data),

  updateMe: (data: { name?: string; email?: string }) =>
    client.put<User>('/auth/me', data).then(r => r.data),

  changePassword: (current_password: string, new_password: string) =>
    client.put('/auth/password', { current_password, new_password }).then(r => r.data),
}
