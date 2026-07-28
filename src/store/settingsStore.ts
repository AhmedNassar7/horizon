import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'auto'
export type TemperatureUnit = 'celsius' | 'fahrenheit'
export type WindUnit = 'kmh' | 'mph' | 'kn'
export type TimeFormat = '24h' | '12h'

interface SettingsState {
  theme: ThemeMode
  temperatureUnit: TemperatureUnit
  windUnit: WindUnit
  timeFormat: TimeFormat
  language: string
  setTheme: (theme: ThemeMode) => void
  setTemperatureUnit: (unit: TemperatureUnit) => void
  setWindUnit: (unit: WindUnit) => void
  setTimeFormat: (format: TimeFormat) => void
  setLanguage: (language: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'auto',
      temperatureUnit: 'celsius',
      windUnit: 'kmh',
      timeFormat: '24h',
      language: 'en',
      setTheme: (theme) => set({ theme }),
      setTemperatureUnit: (temperatureUnit) => set({ temperatureUnit }),
      setWindUnit: (windUnit) => set({ windUnit }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'horizon:settings' },
  ),
)
