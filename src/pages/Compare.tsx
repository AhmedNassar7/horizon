import { useQueries } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useLocationStore } from '@/store/locationStore'
import { useSettingsStore } from '@/store/settingsStore'
import { weatherProvider } from '@/api/weatherProvider'
import { roundCoordinate } from '@/lib/geo'
import { resolveTimezone, formatTimeInZone } from '@/lib/timezone'
import { getWeatherCodeInfo } from '@/lib/weatherCode'
import { WeatherIcon } from '@/components/weather/WeatherIcon'
import { formatTemperature } from '@/lib/units'

export default function Compare() {
  const { t } = useTranslation()
  const locations = useLocationStore((s) => s.locations)
  const temperatureUnit = useSettingsStore((s) => s.temperatureUnit)
  const timeFormat = useSettingsStore((s) => s.timeFormat)

  const results = useQueries({
    queries: locations.map((location) => {
      const lat = roundCoordinate(location.latitude)
      const lon = roundCoordinate(location.longitude)
      return {
        queryKey: ['weather', lat, lon],
        queryFn: () => weatherProvider.getWeather(lat, lon),
        staleTime: 10 * 60 * 1000,
      }
    }),
  })

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <Helmet>
        <title>
          {t('compare.title')} — {t('app.name')}
        </title>
      </Helmet>

      {locations.length === 0 ? (
        <div className="mx-auto w-full max-w-2xl py-8 text-center">
          <p className="font-medium">{t('compare.empty')}</p>
          <p className="text-muted-foreground mt-1 text-sm">{t('compare.emptyBody')}</p>
        </div>
      ) : (
        <>
          <h1 className="font-display text-2xl font-semibold">{t('compare.title')}</h1>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((location, index) => {
              const query = results[index]
              const timezone = resolveTimezone(location.latitude, location.longitude)

              return (
                <Link
                  key={location.id}
                  to={`/location/${location.id}`}
                  className="glass-card hover:ring-ring/40 flex flex-col gap-3 p-5 transition-shadow hover:ring-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{location.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {[location.admin1, location.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <p className="text-muted-foreground text-xs tabular-nums">
                      {formatTimeInZone(new Date(), timezone, {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: timeFormat === '12h',
                      })}
                    </p>
                  </div>

                  {query?.isPending && <div className="bg-muted h-16 animate-pulse rounded-lg" />}
                  {query?.isError && (
                    <p className="text-muted-foreground text-sm">{t('compare.loadError')}</p>
                  )}
                  {query?.data && (
                    <div className="flex items-center gap-3">
                      <WeatherIcon
                        code={query.data.current.weatherCode}
                        isDay={query.data.current.isDay}
                        className="text-primary size-9"
                      />
                      <div>
                        <p className="font-display text-3xl font-semibold tabular-nums">
                          {formatTemperature(query.data.current.temperatureC, temperatureUnit)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t(getWeatherCodeInfo(query.data.current.weatherCode).labelKey)}
                        </p>
                      </div>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
