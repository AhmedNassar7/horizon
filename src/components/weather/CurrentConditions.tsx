import { Droplet, Wind, Gauge, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/settingsStore'
import { WeatherIcon } from '@/components/weather/WeatherIcon'
import { getWeatherCodeInfo } from '@/lib/weatherCode'
import { degreesToCompass, formatPercent, formatTemperature, formatWindSpeed } from '@/lib/units'
import type { CurrentConditions as CurrentConditionsData } from '@/schemas/weather'

function MetricPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Droplet
  label: string
  value: string
}) {
  return (
    <div className="bg-muted/60 flex items-center gap-2 rounded-lg px-3 py-2">
      <Icon aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
      <div className="text-sm">
        <span className="text-muted-foreground">{label}</span>{' '}
        <span className="font-medium">{value}</span>
      </div>
    </div>
  )
}

export function CurrentConditions({
  current,
  locationName,
}: {
  current: CurrentConditionsData
  locationName: string
}) {
  const { t } = useTranslation()
  const temperatureUnit = useSettingsStore((s) => s.temperatureUnit)
  const windUnit = useSettingsStore((s) => s.windUnit)
  const { labelKey } = getWeatherCodeInfo(current.weatherCode)

  return (
    <section aria-labelledby="current-location-name" className="glass-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 id="current-location-name" className="font-display text-xl font-semibold">
            {locationName}
          </h1>
          <p className="text-muted-foreground text-sm">{t(labelKey)}</p>
          <p className="font-display mt-2 text-6xl font-semibold tabular-nums" aria-live="polite">
            {formatTemperature(current.temperatureC, temperatureUnit)}
          </p>
          <p className="text-muted-foreground text-sm">
            {t('weather.feelsLike')}{' '}
            {formatTemperature(current.apparentTemperatureC, temperatureUnit)}
          </p>
        </div>
        <WeatherIcon
          code={current.weatherCode}
          isDay={current.isDay}
          className="text-primary size-20 shrink-0"
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MetricPill
          icon={Droplet}
          label={t('weather.humidity')}
          value={formatPercent(current.humidityPercent)}
        />
        <MetricPill
          icon={Wind}
          label={t('weather.wind')}
          value={`${formatWindSpeed(current.windSpeedKmh, windUnit)} ${degreesToCompass(current.windDirectionDeg)}`}
        />
        <MetricPill
          icon={Gauge}
          label={t('weather.pressure')}
          value={`${Math.round(current.surfacePressureHpa)} hPa`}
        />
        <MetricPill
          icon={Eye}
          label={t('weather.cloudCover')}
          value={formatPercent(current.cloudCoverPercent)}
        />
      </div>
    </section>
  )
}
