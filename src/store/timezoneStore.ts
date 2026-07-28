import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TimezoneSelection {
  id: string
  label: string
  timezone: string
}

const MAX_TIMEZONE_SELECTIONS = 5

interface TimezoneState {
  selections: TimezoneSelection[]
  addSelection: (selection: TimezoneSelection) => void
  removeSelection: (id: string) => void
  reorderSelections: (fromIndex: number, toIndex: number) => void
}

export const useTimezoneStore = create<TimezoneState>()(
  persist(
    (set, get) => ({
      selections: [],
      addSelection: (selection) => {
        const { selections } = get()
        if (selections.some((s) => s.id === selection.id)) return
        if (selections.length >= MAX_TIMEZONE_SELECTIONS) return
        set({ selections: [...selections, selection] })
      },
      removeSelection: (id) => {
        set({ selections: get().selections.filter((s) => s.id !== id) })
      },
      reorderSelections: (fromIndex, toIndex) => {
        const selections = [...get().selections]
        const [moved] = selections.splice(fromIndex, 1)
        if (!moved) return
        selections.splice(toIndex, 0, moved)
        set({ selections })
      },
    }),
    { name: 'horizon:timezone-selections' },
  ),
)
