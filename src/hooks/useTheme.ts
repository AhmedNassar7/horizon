import { useEffect, useState } from 'react'
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
  const [isDark, setIsDark] = useState(() => resolveIsDark(theme))

  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const dark = resolveIsDark(theme)
      root.classList.toggle('dark', dark)
      setIsDark(dark)
    }
    apply()

    if (theme !== 'auto') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  return { theme, setTheme, isDark }
}
