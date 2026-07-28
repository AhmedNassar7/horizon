import { Wind } from 'lucide-react'
import { getAirQualityLevel } from '@/lib/airQualityLevel'
import { cn } from '@/lib/utils'
import type { AirQuality as AirQualityData } from '@/schemas/airQuality'

export function AirQuality({ data }: { data: AirQualityData }) {
  const level = getAirQualityLevel(data.usAqi)

  return (
    <section aria-label="Air quality" className="glass-card p-6">
      <h2 className="font-display text-lg font-semibold">Air quality</h2>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div
          className={cn(
            'flex flex-col items-center justify-center rounded-xl px-5 py-3',
            level.colorClass,
          )}
        >
          <span className="text-3xl font-semibold tabular-nums">{data.usAqi ?? '—'}</span>
          <span className="text-xs font-medium">US AQI</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{level.label}</p>
          <p className="text-muted-foreground text-sm">{level.healthAdvice}</p>
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
          <span className="text-muted-foreground">European AQI</span>{' '}
          <span className="font-medium">{data.europeanAqi ?? '—'}</span>
        </div>
      </div>
    </section>
  )
}
