import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastStore {
  toasts: Toast[]
  success: (msg: string) => void
  error:   (msg: string) => void
  info:    (msg: string) => void
  remove:  (id: number)  => void
}

let _id = 0

const TTL: Record<ToastType, number> = { success: 3000, error: 4500, info: 3000 }

export const useToastStore = create<ToastStore>(set => {
  const add = (type: ToastType) => (message: string) => {
    const id = ++_id
    set(s => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), TTL[type])
  }
  return {
    toasts:  [],
    success: add('success'),
    error:   add('error'),
    info:    add('info'),
    remove:  id => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  }
})

export const toast = {
  success: (msg: string) => useToastStore.getState().success(msg),
  error:   (msg: string) => useToastStore.getState().error(msg),
  info:    (msg: string) => useToastStore.getState().info(msg),
}
