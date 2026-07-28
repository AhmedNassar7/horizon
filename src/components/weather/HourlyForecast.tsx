import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useSettingsStore } from '@/store/settingsStore'
import { WeatherIcon } from '@/components/weather/WeatherIcon'
import { celsiusTo, formatTemperature } from '@/lib/units'
import { formatTimeInZone } from '@/lib/timezone'
import type { HourlyForecastPoint } from '@/schemas/weather'

export function HourlyForecast({
  hours,
  timezone,
}: {
  hours: HourlyForecastPoint[]
  timezone: string
}) {
  const temperatureUnit = useSettingsStore((s) => s.temperatureUnit)
  const timeFormat = useSettingsStore((s) => s.timeFormat)
  const hour12 = timeFormat === '12h'

  const next24 = hours.slice(0, 24)
  const chartData = next24.map((h) => ({
    time: formatTimeInZone(new Date(h.time), timezone, { hour: 'numeric', hour12 }),
    temperature: h.temperatureC == null ? null : celsiusTo(temperatureUnit, h.temperatureC),
  }))

  return (
    <section aria-label="Hourly forecast" className="glass-card p-6">
      <h2 className="font-display text-lg font-semibold">Next 24 hours</h2>

      <div className="mt-4 h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
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
              formatter={(value) => [`${Math.round(Number(value))}°`, 'Temperature']}
              contentStyle={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="var(--color-ocean-500)"
              strokeWidth={2}
              fill="url(#tempGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-4 flex gap-4 overflow-x-auto pb-2">
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
