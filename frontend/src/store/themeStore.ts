import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: false,
      toggle: () => {
        const next = !get().isDark
        set({ isDark: next })
        document.documentElement.classList.toggle('dark', next)
      },
    }),
    { name: 'qolda-theme' }
  )
)

export function initTheme() {
  const raw = localStorage.getItem('qolda-theme')
  if (raw) {
    try {
      const { state } = JSON.parse(raw)
      if (state?.isDark) document.documentElement.classList.add('dark')
    } catch {}
  }
}
