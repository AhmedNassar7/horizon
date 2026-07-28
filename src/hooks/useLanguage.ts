import { useEffect } from 'react'
import i18n, { SUPPORTED_LANGUAGES } from '@/i18n'
import { useSettingsStore } from '@/store/settingsStore'

export function useLanguage() {
  const language = useSettingsStore((s) => s.language)
  const setLanguage = useSettingsStore((s) => s.setLanguage)

  useEffect(() => {
    void i18n.changeLanguage(language)
    const meta = SUPPORTED_LANGUAGES.find((l) => l.code === language)
    document.documentElement.dir = meta?.dir ?? 'ltr'
    document.documentElement.lang = language
  }, [language])

  return { language, setLanguage, languages: SUPPORTED_LANGUAGES }
}
