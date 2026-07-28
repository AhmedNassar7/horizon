import { useQueries } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useLocationStore } from '@/store/locationStore'
import { useSettingsStore } from '@/store/settingsStore'
import { weatherProvider } from '@/api/weatherProvider'
import { roundCoordinate } from '@/lib/geo'
import { resolveTimezone, formatTimeInZone } from '@/lib/timezone'
import { getWeatherCodeInfo } from '@/lib/weatherCode'
import { WeatherIcon } from '@/components/weather/WeatherIcon'
import { formatTemperature } from '@/lib/units'

export default function Compare() {
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

  if (locations.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
        <p className="font-medium">No saved locations yet</p>
        <p className="text-muted-foreground mt-1 text-sm">
          <Link to="/" className="text-primary underline underline-offset-2">
            Search for a city
          </Link>{' '}
          to start comparing.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl font-semibold">Compare locations</h1>
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
                <p className="text-muted-foreground text-sm">Couldn't load weather.</p>
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
                      {getWeatherCodeInfo(query.data.current.weatherCode).label}
                    </p>
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
