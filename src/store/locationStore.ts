import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SavedLocation {
  id: string
  name: string
  country: string | null
  admin1: string | null
  latitude: number
  longitude: number
}

export const MAX_SAVED_LOCATIONS = 10

interface LocationState {
  locations: SavedLocation[]
  activeLocationId: string | null
  addLocation: (location: SavedLocation) => void
  removeLocation: (id: string) => void
  reorderLocations: (fromIndex: number, toIndex: number) => void
  setActiveLocation: (id: string) => void
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      locations: [],
      activeLocationId: null,
      addLocation: (location) => {
        const { locations } = get()
        if (locations.some((l) => l.id === location.id)) {
          set({ activeLocationId: location.id })
          return
        }
        if (locations.length >= MAX_SAVED_LOCATIONS) return
        set({ locations: [...locations, location], activeLocationId: location.id })
      },
      removeLocation: (id) => {
        const { locations, activeLocationId } = get()
        const next = locations.filter((l) => l.id !== id)
        set({
          locations: next,
          activeLocationId: activeLocationId === id ? (next[0]?.id ?? null) : activeLocationId,
        })
      },
      reorderLocations: (fromIndex, toIndex) => {
        const locations = [...get().locations]
        const [moved] = locations.splice(fromIndex, 1)
        if (!moved) return
        locations.splice(toIndex, 0, moved)
        set({ locations })
      },
      setActiveLocation: (id) => set({ activeLocationId: id }),
    }),
    { name: 'horizon:locations' },
  ),
)
