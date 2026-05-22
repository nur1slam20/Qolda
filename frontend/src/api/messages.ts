import client from './client'

export interface MessageOut {
  id: number
  sender_id: number
  receiver_id: number
  sender_name: string
  text: string
  is_read: boolean
  created_at: string
}

export interface ContactOut {
  id: number
  name: string
  email: string
  unread_count: number
  last_message: string | null
  last_message_at: string | null
}

export const messagesApi = {
  // Для клиентов — список продавцов
  getSellers: () =>
    client.get<ContactOut[]>('/messages/sellers').then(r => r.data),

  // Для продавцов — список клиентов написавших им
  getClients: () =>
    client.get<ContactOut[]>('/messages/clients').then(r => r.data),

  getConversation: (userId: number) =>
    client.get<MessageOut[]>(`/messages/conversation/${userId}`).then(r => r.data),

  send: (receiver_id: number, text: string) =>
    client.post<MessageOut>('/messages', { receiver_id, text }).then(r => r.data),

  unreadCount: () =>
    client.get<{ count: number }>('/messages/unread-count').then(r => r.data.count),

  getUserInfo: (userId: number) =>
    client.get<{ id: number; name: string; is_seller: boolean }>(`/messages/user-info/${userId}`).then(r => r.data),
}
