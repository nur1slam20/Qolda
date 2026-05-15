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

export interface SellerContact {
  id: number
  name: string
  email: string
  unread_count: number
}

export const messagesApi = {
  getSellers: () =>
    client.get<SellerContact[]>('/messages/sellers').then(r => r.data),

  getConversation: (userId: number) =>
    client.get<MessageOut[]>(`/messages/conversation/${userId}`).then(r => r.data),

  send: (receiver_id: number, text: string) =>
    client.post<MessageOut>('/messages', { receiver_id, text }).then(r => r.data),

  unreadCount: () =>
    client.get<{ count: number }>('/messages/unread-count').then(r => r.data.count),
}
