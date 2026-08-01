import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/settingsStore'
import { WeatherIcon } from '@/components/weather/WeatherIcon'
import { celsiusTo, formatTemperature, kmhTo, formatWindSpeed } from '@/lib/units'
import { formatTimeInZone } from '@/lib/timezone'
import { cn } from '@/lib/utils'
import type { HourlyForecastPoint } from '@/schemas/weather'

const METRICS = ['temperature', 'precipitation', 'wind'] as const
type Metric = (typeof METRICS)[number]

const METRIC_LABEL_KEYS: Record<Metric, string> = {
  temperature: 'weather.temperature',
  precipitation: 'weather.precipitationChance',
  wind: 'weather.windSpeed',
}

const tooltipStyle = {
  background: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  fontSize: 12,
}

export function HourlyForecast({
  hours,
  timezone,
}: {
  hours: HourlyForecastPoint[]
  timezone: string
}) {
  const { t } = useTranslation()
  const temperatureUnit = useSettingsStore((s) => s.temperatureUnit)
  const windUnit = useSettingsStore((s) => s.windUnit)
  const timeFormat = useSettingsStore((s) => s.timeFormat)
  const hour12 = timeFormat === '12h'
  const [metric, setMetric] = useState<Metric>('temperature')

  const next24 = hours.slice(0, 24)
  const chartData = next24.map((h) => ({
    time: formatTimeInZone(new Date(h.time), timezone, { hour: 'numeric', hour12 }),
    temperature: h.temperatureC == null ? null : celsiusTo(temperatureUnit, h.temperatureC),
    precipitation: h.precipitationProbabilityPercent,
    wind: h.windSpeedKmh == null ? null : kmhTo(windUnit, h.windSpeedKmh),
  }))

  return (
    <section aria-label={t('weather.next24Hours')} className="glass-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">{t('weather.next24Hours')}</h2>
        <div role="group" aria-label={t('weather.hourlyMetric')} className="flex gap-1">
          {METRICS.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={metric === m}
              onClick={() => setMetric(m)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                metric === m
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {t(METRIC_LABEL_KEYS[m])}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {metric === 'temperature' ? (
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-ocean-500)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-ocean-500)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                formatter={(value) => [`${Math.round(Number(value))}°`, t('weather.temperature')]}
                contentStyle={tooltipStyle}
              />
              <Area
                type="monotone"
                dataKey="temperature"
                stroke="var(--color-ocean-500)"
                strokeWidth={2}
                fill="url(#tempGradient)"
              />
            </AreaChart>
          ) : metric === 'precipitation' ? (
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="precipGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                formatter={(value) => [
                  `${Math.round(Number(value))}%`,
                  t('weather.precipitationChance'),
                ]}
                contentStyle={tooltipStyle}
              />
              <Area
                type="monotone"
                dataKey="precipitation"
                stroke="var(--color-success)"
                strokeWidth={2}
                fill="url(#precipGradient)"
              />
            </AreaChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-amber-500)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-amber-500)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 'dataMax + 2']} />
              <Tooltip
                formatter={(value) => [
                  formatWindSpeed(Number(value), windUnit),
                  t('weather.windSpeed'),
                ]}
                contentStyle={tooltipStyle}
              />
              <Area
                type="monotone"
                dataKey="wind"
                stroke="var(--color-amber-500)"
                strokeWidth={2}
                fill="url(#windGradient)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* tabIndex follows the WAI-ARIA APG "scrollable region" pattern so keyboard
          users can scroll this horizontally, same as the Planner table. */}
      <ul
        className="mt-4 flex gap-4 overflow-x-auto pb-2"
        tabIndex={0} // oxlint-disable-line no-noninteractive-tabindex
        aria-label={t('weather.next24Hours')}
      >
        {next24.map((hour) => (
          <li
            key={hour.time}
            className="flex min-w-16 shrink-0 flex-col items-center gap-1 text-center"
          >
            <span className="text-muted-foreground text-xs">
              {formatTimeInZone(new Date(hour.time), timezone, { hour: 'numeric', hour12 })}
            </span>
            <WeatherIcon
              code={hour.weatherCode}
              isDay={hour.isDay}
              className="text-primary size-5"
            />
            <span className="text-sm font-medium">
              {formatTemperature(hour.temperatureC, temperatureUnit)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
