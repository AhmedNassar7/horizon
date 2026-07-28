import { useTranslation } from 'react-i18next'

export function WeatherSkeleton() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t('weather.loading')}</span>
      <div className="glass-card h-48 animate-pulse" />
      <div className="glass-card h-56 animate-pulse" />
      <div className="glass-card h-72 animate-pulse" />
    </div>
  )
}
