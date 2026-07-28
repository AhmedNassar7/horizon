import { lazy, Suspense, useEffect, useMemo } from 'react'
import { useLocationStore } from '@/store/locationStore'
import { useWeather } from '@/hooks/useWeather'
import { useGeolocation } from '@/hooks/useGeolocation'
import { resolveTimezone } from '@/lib/timezone'
import { CurrentConditions } from '@/components/weather/CurrentConditions'
import { DailyForecast } from '@/components/weather/DailyForecast'

// Recharts is the single heaviest dependency in this dashboard; splitting it
// into its own chunk keeps current conditions and the daily list interactive
// without waiting on the charting library to download.
const HourlyForecast = lazy(() =>
  import('@/components/weather/HourlyForecast').then((m) => ({ default: m.HourlyForecast })),
)
import { WeatherSkeleton } from '@/components/weather/WeatherSkeleton'
import { WeatherErrorState } from '@/components/weather/WeatherErrorState'
import { LocationEmptyState } from '@/components/weather/LocationEmptyState'
import { CitySearch } from '@/components/search/CitySearch'
import { Clock } from '@/components/time/Clock'
import type { CityResult } from '@/schemas/geocoding'

export default function Home() {
  const locations = useLocationStore((s) => s.locations)
  const activeLocationId = useLocationStore((s) => s.activeLocationId)
  const addLocation = useLocationStore((s) => s.addLocation)

  const activeLocation = locations.find((l) => l.id === activeLocationId) ?? locations[0] ?? null

  const shouldGeolocate = locations.length === 0
  const geolocation = useGeolocation(shouldGeolocate)

  useEffect(() => {
    if (!geolocation.data) return
    const { latitude, longitude, label, region, country } = geolocation.data
    addLocation({
      id: `${latitude.toFixed(2)},${longitude.toFixed(2)}`,
      name: label,
      country,
      admin1: region,
      latitude,
      longitude,
    })
  }, [geolocation.data, addLocation])

  const weather = useWeather(
    activeLocation?.latitude ?? 0,
    activeLocation?.longitude ?? 0,
    activeLocation != null,
  )

  const timezone = useMemo(
    () =>
      activeLocation ? resolveTimezone(activeLocation.latitude, activeLocation.longitude) : null,
    [activeLocation],
  )

  const handleSelectCity = (city: CityResult) => {
    addLocation({
      id: String(city.id),
      name: city.name,
      country: city.country,
      admin1: city.admin1,
      latitude: city.latitude,
      longitude: city.longitude,
    })
  }

  if (!activeLocation) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <LocationEmptyState onSelectCity={handleSelectCity} isLocating={geolocation.isFetching} />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CitySearch onSelect={handleSelectCity} />
        {timezone && <Clock timezone={timezone} className="text-right" />}
      </div>

      {weather.isPending && <WeatherSkeleton />}
      {weather.isError && <WeatherErrorState onRetry={() => weather.refetch()} />}
      {weather.data && (
        <>
          <CurrentConditions
            current={weather.data.current}
            locationName={[activeLocation.name, activeLocation.country].filter(Boolean).join(', ')}
          />
          <Suspense fallback={<div className="glass-card h-56 animate-pulse" />}>
            <HourlyForecast hours={weather.data.hourly} timezone={weather.data.timezone} />
          </Suspense>
          <DailyForecast days={weather.data.daily} />
        </>
      )}
    </div>
  )
}
