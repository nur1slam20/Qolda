import { create } from 'zustand'

interface LocationState {
  city: string | null
  loading: boolean
  detect: () => Promise<void>
  setCity: (city: string) => void
}

async function cityFromIP(): Promise<string | null> {
  try {
    const res  = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    if (data.country_code === 'KZ' && data.city) return data.city
    if (data.city) return data.city
    return null
  } catch {
    return null
  }
}

async function cityFromCoords(lat: number, lon: number): Promise<string | null> {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ru`
    )
    const data = await res.json()
    return data.address?.city || data.address?.town || data.address?.village || null
  } catch {
    return null
  }
}

export const useLocationStore = create<LocationState>()(set => ({
  city: null,
  loading: false,
  setCity: (city) => set({ city }),

  detect: async () => {
    set({ loading: true })

    // Try precise GPS first
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          const city = await cityFromCoords(pos.coords.latitude, pos.coords.longitude)
          if (city) { set({ city, loading: false }); return }
          // fallback to IP
          const ipCity = await cityFromIP()
          set({ city: ipCity, loading: false })
        },
        async () => {
          // Denied — fall back to IP
          const ipCity = await cityFromIP()
          set({ city: ipCity, loading: false })
        },
        { timeout: 5000 }
      )
    } else {
      const ipCity = await cityFromIP()
      set({ city: ipCity, loading: false })
    }
  },
}))
