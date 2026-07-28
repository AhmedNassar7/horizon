import { useEffect } from 'react'
import { useSettingsStore, type ThemeMode } from '@/store/settingsStore'

function resolveIsDark(theme: ThemeMode) {
  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return theme === 'dark'
}

export function useTheme() {
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)

  useEffect(() => {
    const root = document.documentElement
    const apply = () => root.classList.toggle('dark', resolveIsDark(theme))
    apply()

    if (theme !== 'auto') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  return { theme, setTheme }
}
