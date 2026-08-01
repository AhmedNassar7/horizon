import type { ReactNode } from 'react'
import { Droplet, Wind, Gauge, Eye, Cloud, Sun, Navigation } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/settingsStore'
import { WeatherIcon } from '@/components/weather/WeatherIcon'
import { getWeatherCodeInfo } from '@/lib/weatherCode'
import { getBeaufortScale } from '@/lib/beaufort'
import { getVisibilityLevel } from '@/lib/visibilityLevel'
import { getUvIndexLevel } from '@/lib/uvIndexLevel'
import { cn } from '@/lib/utils'
import {
  degreesToCompass,
  formatPercent,
  formatTemperature,
  formatVisibility,
  formatWindSpeed,
} from '@/lib/units'
import type { CurrentConditions as CurrentConditionsData } from '@/schemas/weather'

function LevelBadge({ labelKey, colorClass }: { labelKey: string; colorClass: string }) {
  const { t } = useTranslation()
  return (
    <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium', colorClass)}>
      {t(labelKey)}
    </span>
  )
}

function MetricPill({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Droplet
  label: string
  value: string
  sub?: ReactNode
}) {
  return (
    <div className="bg-muted/60 flex items-center gap-2 rounded-lg px-3 py-2">
      <Icon aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
      <div className="text-sm">
        <div>
          <span className="text-muted-foreground">{label}</span>{' '}
          <span className="font-medium">{value}</span>
        </div>
        {sub && <div className="mt-0.5">{sub}</div>}
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
  const beaufort = getBeaufortScale(current.windSpeedKmh)
  const visibilityLevel = getVisibilityLevel(current.visibilityMeters)
  const uvLevel = getUvIndexLevel(current.uvIndex)

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

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <MetricPill
          icon={Droplet}
          label={t('weather.humidity')}
          value={formatPercent(current.humidityPercent)}
          sub={
            <span className="text-muted-foreground text-xs">
              {t('weather.dewPoint')} {formatTemperature(current.dewPointC, temperatureUnit)}
            </span>
          }
        />
        <div className="bg-muted/60 flex items-center gap-2 rounded-lg px-3 py-2">
          <Wind aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
          <div className="text-sm">
            <div>
              <span className="text-muted-foreground">{t('weather.wind')}</span>{' '}
              <span className="font-medium">{formatWindSpeed(current.windSpeedKmh, windUnit)}</span>{' '}
              <span className="inline-flex items-center gap-0.5 font-medium">
                <Navigation
                  aria-hidden="true"
                  className="size-3"
                  style={{ transform: `rotate(${current.windDirectionDeg}deg)` }}
                />
                {degreesToCompass(current.windDirectionDeg)}
              </span>
            </div>
            <div className="text-muted-foreground mt-0.5 text-xs">
              {t('weather.windGust')} {formatWindSpeed(current.windGustsKmh, windUnit)}
              {' · '}
              {t('weather.beaufortForce', { force: beaufort.force })}: {t(beaufort.labelKey)}
            </div>
          </div>
        </div>
        <MetricPill
          icon={Gauge}
          label={t('weather.pressure')}
          value={`${Math.round(current.surfacePressureHpa)} hPa`}
        />
        <MetricPill
          icon={Eye}
          label={t('weather.visibility')}
          value={formatVisibility(current.visibilityMeters, windUnit)}
          sub={
            <LevelBadge
              labelKey={visibilityLevel.labelKey}
              colorClass={visibilityLevel.colorClass}
            />
          }
        />
        <MetricPill
          icon={Cloud}
          label={t('weather.cloudCover')}
          value={formatPercent(current.cloudCoverPercent)}
        />
        <MetricPill
          icon={Sun}
          label={t('weather.uvIndex')}
          value={Math.round(current.uvIndex).toLocaleString()}
          sub={<LevelBadge labelKey={uvLevel.labelKey} colorClass={uvLevel.colorClass} />}
        />
      </div>
    </section>
  )
}
