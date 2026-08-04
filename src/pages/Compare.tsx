import { useQueries } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
// Compare.tsx is already behind React.lazy() in App.tsx, so importing
// framer-motion here never touches the eagerly-bundled main chunk (see
// WeatherBackground.tsx for the precedent). AnimatePresence lets a card
// animate out when its location is removed (from Clocks/elsewhere, since
// this grid shares useLocationStore's `locations`) instead of vanishing.
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useLocationStore } from '@/store/locationStore'
import { useSettingsStore } from '@/store/settingsStore'
import { weatherProvider } from '@/api/weatherProvider'
import { roundCoordinate } from '@/lib/geo'
import { resolveTimezone, formatTimeInZone } from '@/lib/timezone'
import { getWeatherCodeInfo } from '@/lib/weatherCode'
import { WeatherIcon } from '@/components/weather/WeatherIcon'
import { formatTemperature } from '@/lib/units'
import { SITE_URL, OG_IMAGE_URL } from '@/lib/seo'

export default function Compare() {
  const { t } = useTranslation()
  const locations = useLocationStore((s) => s.locations)
  const temperatureUnit = useSettingsStore((s) => s.temperatureUnit)
  const timeFormat = useSettingsStore((s) => s.timeFormat)

  const prefersReducedMotion = useReducedMotion()
  const cardTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }

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
      <title>{`${t('compare.title')} — ${t('app.name')}`}</title>
      <meta name="description" content={`${t('compare.title')} — ${t('app.tagline')}`} />
      <meta property="og:title" content={`${t('compare.title')} — ${t('app.name')}`} />
      <meta property="og:description" content={`${t('compare.title')} — ${t('app.tagline')}`} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${SITE_URL}/compare`} />
      <meta property="og:image" content={OG_IMAGE_URL} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${t('compare.title')} — ${t('app.name')}`} />
      <meta name="twitter:description" content={`${t('compare.title')} — ${t('app.tagline')}`} />
      <meta name="twitter:image" content={OG_IMAGE_URL} />

      {locations.length === 0 ? (
        <div className="mx-auto w-full max-w-2xl py-8 text-center">
          <p className="font-medium">{t('compare.empty')}</p>
          <p className="text-muted-foreground mt-1 text-sm">{t('compare.emptyBody')}</p>
        </div>
      ) : (
        <>
          <h1 className="font-display text-2xl font-semibold">{t('compare.title')}</h1>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false} mode="popLayout">
              {locations.map((location, index) => {
                const query = results[index]
                const timezone = resolveTimezone(location.latitude, location.longitude)

                return (
                  <motion.div
                    key={location.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={cardTransition}
                  >
                    <Link
                      to={`/location/${location.id}`}
                      className="glass-card hover:ring-ring/40 flex flex-col gap-3 p-5 transition-all hover:ring-2 active:not-aria-[haspopup]:translate-y-px"
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

                      {query?.isPending && (
                        <div className="bg-muted h-16 animate-pulse rounded-lg" />
                      )}
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
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  )
}
