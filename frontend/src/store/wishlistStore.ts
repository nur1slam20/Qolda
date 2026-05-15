import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../api/types'

interface WishlistStore {
  items: Product[]
  toggle:    (product: Product) => void
  has:       (id: number) => boolean
  remove:    (id: number) => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: product => {
        const exists = get().items.some(p => p.id === product.id)
        set(s => ({
          items: exists
            ? s.items.filter(p => p.id !== product.id)
            : [...s.items, product],
        }))
      },
      has:    id => get().items.some(p => p.id === id),
      remove: id => set(s => ({ items: s.items.filter(p => p.id !== id) })),
    }),
    { name: 'qolda-wishlist' },
  ),
)
