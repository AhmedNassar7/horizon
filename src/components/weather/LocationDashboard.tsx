import { lazy, Suspense, useMemo } from 'react'
import { useWeather, useAirQuality } from '@/hooks/useWeather'
import { resolveTimezone } from '@/lib/timezone'
import { computeAdvisories } from '@/lib/advisories'
import { CurrentConditions } from '@/components/weather/CurrentConditions'
import { DailyForecast } from '@/components/weather/DailyForecast'
import { WeatherBackground } from '@/components/weather/WeatherBackground'
import { WeatherAdvisories } from '@/components/weather/WeatherAdvisories'
import { SunAndMoon } from '@/components/weather/SunAndMoon'
import { AirQuality } from '@/components/weather/AirQuality'
import { WeatherSkeleton } from '@/components/weather/WeatherSkeleton'
import { WeatherErrorState } from '@/components/weather/WeatherErrorState'
import { Clock } from '@/components/time/Clock'
import type { SavedLocation } from '@/store/locationStore'

// Recharts is the single heaviest dependency in this dashboard; splitting it
// into its own chunk keeps current conditions and the daily list interactive
// without waiting on the charting library to download.
const HourlyForecast = lazy(() =>
  import('@/components/weather/HourlyForecast').then((m) => ({ default: m.HourlyForecast })),
)

export function LocationDashboard({ location }: { location: SavedLocation }) {
  const weather = useWeather(location.latitude, location.longitude)
  const airQuality = useAirQuality(location.latitude, location.longitude)

  const timezone = useMemo(
    () => resolveTimezone(location.latitude, location.longitude),
    [location.latitude, location.longitude],
  )

  const advisories = useMemo(
    () => (weather.data ? computeAdvisories(weather.data.current, weather.data.daily[0]) : []),
    [weather.data],
  )

  return (
    <div className="flex flex-col gap-6">
      {weather.data && (
        <WeatherBackground
          code={weather.data.current.weatherCode}
          isDay={weather.data.current.isDay}
        />
      )}

      <div className="flex justify-end">
        <Clock timezone={timezone} className="text-right" />
      </div>

      {weather.isPending && <WeatherSkeleton />}
      {weather.isError && <WeatherErrorState onRetry={() => weather.refetch()} />}
      {weather.data && (
        <>
          <WeatherAdvisories advisories={advisories} />
          <CurrentConditions
            current={weather.data.current}
            locationName={[location.name, location.country].filter(Boolean).join(', ')}
          />
          <Suspense fallback={<div className="glass-card h-56 animate-pulse" />}>
            <HourlyForecast hours={weather.data.hourly} timezone={weather.data.timezone} />
          </Suspense>
          <DailyForecast days={weather.data.daily} />
          {weather.data.daily[0] && (
            <SunAndMoon today={weather.data.daily[0]} timezone={weather.data.timezone} />
          )}
          {airQuality.data && <AirQuality data={airQuality.data} />}
        </>
      )}
    </div>
  )
}
