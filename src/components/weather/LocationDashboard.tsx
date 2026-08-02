import { lazy, Suspense, useMemo } from 'react'
import { useWeather, useAirQuality } from '@/hooks/useWeather'
import { resolveTimezone } from '@/lib/timezone'
import { computeAdvisories } from '@/lib/advisories'
import { CurrentConditions } from '@/components/weather/CurrentConditions'
import { DailyForecast } from '@/components/weather/DailyForecast'
import { WeatherBackgroundFallback } from '@/components/weather/WeatherBackgroundFallback'
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

// Same reasoning for the decorative background: framer-motion is used only
// here (a cross-fade between gradient themes) and nowhere else in the app,
// yet it made up the vast majority of this chunk's bytes AND its unused
// JavaScript (drag/pan/gesture code paths that a plain opacity fade never
// touches). Splitting it out keeps the actual data (current conditions,
// daily forecast, etc.) from waiting on framer-motion to download and
// parse. The Suspense fallback renders the exact same gradient colors
// without the fade, so nothing is visually blocked in the meantime.
const WeatherBackground = lazy(() =>
  import('@/components/weather/WeatherBackground').then((m) => ({ default: m.WeatherBackground })),
)

// Same reasoning again: Leaflet (~40KB gzip) is only needed for this one
// section, so it shouldn't block the synchronously-loaded dashboard chunk.
const LocationMap = lazy(() =>
  import('@/components/weather/LocationMap').then((m) => ({ default: m.LocationMap })),
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
        <Suspense
          fallback={
            <WeatherBackgroundFallback
              code={weather.data.current.weatherCode}
              isDay={weather.data.current.isDay}
            />
          }
        >
          <WeatherBackground
            code={weather.data.current.weatherCode}
            isDay={weather.data.current.isDay}
          />
        </Suspense>
      )}

      <div className="flex justify-end">
        {/* Unlike WorldClockCard (Clocks page), this Clock renders directly
            over the weather-reactive gradient rather than its own page
            background — glass-card gives it the same opaque-enough backing
            everything else on this page gets, so its text color (which
            follows the app THEME) stays legible against a gradient stop
            that follows the location's actual day/night state instead
            (e.g. light theme + night: dark theme text over a dark night
            gradient, with no card, is close to unreadable). */}
        <Clock timezone={timezone} className="glass-card px-4 py-3 text-right" />
      </div>

      {weather.isPending && <WeatherSkeleton />}
      {weather.isError && <WeatherErrorState onRetry={() => weather.refetch()} />}
      {weather.data && (
        // Single column on mobile/tablet (unchanged). At lg+ the page
        // container is wide (max-w-6xl, see Home.tsx/Location.tsx) and a
        // single centered column here would leave large empty gutters on
        // both sides — so from lg up this splits into a wider "forecast"
        // column and a narrower "details" sidebar, each independently
        // height-driven (`items-start`, rather than the default stretch,
        // so the shorter column doesn't get forced to match the taller
        // one's height and end up with dead space of its own at the
        // bottom).
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <WeatherAdvisories advisories={advisories} />
            <CurrentConditions
              current={weather.data.current}
              locationName={[location.name, location.country].filter(Boolean).join(', ')}
            />
            <Suspense fallback={<div className="glass-card h-56 animate-pulse" />}>
              <HourlyForecast hours={weather.data.hourly} timezone={weather.data.timezone} />
            </Suspense>
            <DailyForecast days={weather.data.daily} />
          </div>
          <div className="flex flex-col gap-6 lg:col-span-1">
            {weather.data.daily[0] && (
              <SunAndMoon today={weather.data.daily[0]} timezone={weather.data.timezone} />
            )}
            <Suspense fallback={<div className="glass-card h-64 animate-pulse" />}>
              <LocationMap
                latitude={location.latitude}
                longitude={location.longitude}
                name={[location.name, location.country].filter(Boolean).join(', ')}
              />
            </Suspense>
            {airQuality.data && <AirQuality data={airQuality.data} />}
          </div>
        </div>
      )}
    </div>
  )
}
