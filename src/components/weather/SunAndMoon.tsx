import { Sunrise, Sunset, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/settingsStore'
import { formatTimeInZone } from '@/lib/timezone'
import { getMoonPhase } from '@/lib/moonPhase'
import { formatHoursMinutes } from '@/lib/duration'
import type { DailyForecastPoint } from '@/schemas/weather'

export function SunAndMoon({ today, timezone }: { today: DailyForecastPoint; timezone: string }) {
  const { t } = useTranslation()
  const timeFormat = useSettingsStore((s) => s.timeFormat)
  const hour12 = timeFormat === '12h'
  const moon = getMoonPhase(new Date())
  const daylightMs = new Date(today.sunset).getTime() - new Date(today.sunrise).getTime()

  return (
    <section
      aria-label={`${t('weather.sunrise')}, ${t('weather.sunset')}, ${t('weather.daylight')}, ${t('weather.moonPhase')}`}
      className="glass-card flex flex-wrap gap-6 p-6"
    >
      <div className="flex items-center gap-3">
        <Sunrise aria-hidden="true" className="size-6 text-amber-500" />
        <div>
          <p className="text-muted-foreground text-xs">{t('weather.sunrise')}</p>
          <p className="font-medium tabular-nums">
            {formatTimeInZone(new Date(today.sunrise), timezone, {
              hour: 'numeric',
              minute: '2-digit',
              hour12,
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Sunset aria-hidden="true" className="size-6 text-amber-600" />
        <div>
          <p className="text-muted-foreground text-xs">{t('weather.sunset')}</p>
          <p className="font-medium tabular-nums">
            {formatTimeInZone(new Date(today.sunset), timezone, {
              hour: 'numeric',
              minute: '2-digit',
              hour12,
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Sun aria-hidden="true" className="size-6 text-amber-400" />
        <div>
          <p className="text-muted-foreground text-xs">{t('weather.daylight')}</p>
          <p className="font-medium tabular-nums">{formatHoursMinutes(Math.max(0, daylightMs))}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="text-2xl leading-none">
          {moon.emoji}
        </span>
        <div>
          <p className="text-muted-foreground text-xs">{t('weather.moonPhase')}</p>
          <p className="font-medium">{t(moon.nameKey)}</p>
        </div>
      </div>
    </section>
  )
}
