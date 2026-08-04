import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/settingsStore'
import { WeatherIcon } from '@/components/weather/WeatherIcon'
import { formatPercent, formatTemperature } from '@/lib/units'
import type { DailyForecastPoint } from '@/schemas/weather'

function weekdayLabel(date: string, index: number, todayLabel: string, locale: string) {
  if (index === 0) return todayLabel
  return new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(date),
  )
}

export function DailyForecast({ days }: { days: DailyForecastPoint[] }) {
  const { t, i18n } = useTranslation()
  const temperatureUnit = useSettingsStore((s) => s.temperatureUnit)

  const allTemps = days
    .flatMap((day) => [day.tempMinC, day.tempMaxC])
    .filter((value): value is number => value != null)
  const rangeMin = Math.min(...allTemps)
  const rangeMax = Math.max(...allTemps)
  const span = Math.max(rangeMax - rangeMin, 1)

  return (
    <section
      aria-label={t('weather.sevenDayForecast')}
      className="glass-card animate-in fade-in slide-in-from-bottom-2 ease-expo-out p-6 duration-300"
    >
      <h2 className="font-display text-lg font-semibold">{t('weather.sevenDayForecast')}</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {days.map((day, index) => {
          const lowOffset = day.tempMinC == null ? 0 : ((day.tempMinC - rangeMin) / span) * 100
          const highOffset = day.tempMaxC == null ? 100 : ((day.tempMaxC - rangeMin) / span) * 100

          return (
            <li
              key={day.date}
              className="grid grid-cols-[3.5rem_1.5rem_1fr_auto] items-center gap-3"
            >
              <span className="text-sm font-medium">
                {weekdayLabel(day.date, index, t('weather.today'), i18n.language)}
              </span>
              <WeatherIcon code={day.weatherCode} isDay className="text-primary size-5" />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-10 text-right text-sm tabular-nums">
                  {formatTemperature(day.tempMinC, temperatureUnit)}
                </span>
                <div className="bg-muted relative h-1.5 flex-1 rounded-full">
                  <div
                    className="from-ocean-400 absolute h-full rounded-full bg-gradient-to-r to-amber-400"
                    style={{ left: `${lowOffset}%`, right: `${100 - highOffset}%` }}
                  />
                </div>
                <span className="w-10 text-sm font-medium tabular-nums">
                  {formatTemperature(day.tempMaxC, temperatureUnit)}
                </span>
              </div>
              <span className="text-muted-foreground w-10 text-right text-xs">
                {formatPercent(day.precipitationProbabilityMaxPercent)}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
