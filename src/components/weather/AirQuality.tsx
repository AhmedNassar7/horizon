import { Wind } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getAirQualityLevel } from '@/lib/airQualityLevel'
import { cn } from '@/lib/utils'
import type { AirQuality as AirQualityData } from '@/schemas/airQuality'

export function AirQuality({ data }: { data: AirQualityData }) {
  const { t } = useTranslation()
  const level = getAirQualityLevel(data.usAqi)

  return (
    <section
      aria-label={t('weather.airQuality')}
      className="glass-card animate-in fade-in slide-in-from-bottom-2 ease-expo-out p-6 duration-300"
    >
      <h2 className="font-display text-lg font-semibold">{t('weather.airQuality')}</h2>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div
          className={cn(
            'flex flex-col items-center justify-center rounded-xl px-5 py-3',
            level.colorClass,
          )}
        >
          <span className="text-3xl font-semibold tabular-nums">{data.usAqi ?? '—'}</span>
          <span className="text-xs font-medium">{t('weather.usAqi')}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{t(level.labelKey)}</p>
          <p className="text-muted-foreground text-sm">{t(level.adviceKey)}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="bg-muted/60 rounded-lg px-3 py-2 text-sm">
          <span className="text-muted-foreground">PM2.5</span>{' '}
          <span className="font-medium">{data.pm2_5 ?? '—'} µg/m³</span>
        </div>
        <div className="bg-muted/60 rounded-lg px-3 py-2 text-sm">
          <span className="text-muted-foreground">PM10</span>{' '}
          <span className="font-medium">{data.pm10 ?? '—'} µg/m³</span>
        </div>
        <div className="bg-muted/60 col-span-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm sm:col-span-2">
          <Wind aria-hidden="true" className="text-muted-foreground size-4" />
          <span className="text-muted-foreground">{t('weather.europeanAqi')}</span>{' '}
          <span className="font-medium">{data.europeanAqi ?? '—'}</span>
        </div>
      </div>
    </section>
  )
}
