import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocationStore } from '@/store/locationStore'
import { useGeolocation } from '@/hooks/useGeolocation'
import { LocationDashboard } from '@/components/weather/LocationDashboard'
import { LocationEmptyState } from '@/components/weather/LocationEmptyState'
import { CitySearch } from '@/components/search/CitySearch'
import { Clock } from '@/components/time/Clock'
import { Button } from '@/components/ui/button'
import { resolveTimezone } from '@/lib/timezone'
import { SITE_URL, OG_IMAGE_URL } from '@/lib/seo'
import type { CityResult } from '@/schemas/geocoding'

export default function Home() {
  const { t } = useTranslation()
  const locations = useLocationStore((s) => s.locations)
  const activeLocationId = useLocationStore((s) => s.activeLocationId)
  const addLocation = useLocationStore((s) => s.addLocation)

  const activeLocation = locations.find((l) => l.id === activeLocationId) ?? locations[0] ?? null

  const timezone = useMemo(
    () =>
      activeLocation ? resolveTimezone(activeLocation.latitude, activeLocation.longitude) : null,
    [activeLocation],
  )

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

  return (
    <>
      <title>{`${t('app.name')} — ${t('app.tagline')}`}</title>
      <meta name="description" content={t('app.tagline')} />
      <meta property="og:title" content={`${t('app.name')} — ${t('app.tagline')}`} />
      <meta property="og:description" content={t('app.tagline')} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${SITE_URL}/`} />
      <meta property="og:image" content={OG_IMAGE_URL} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${t('app.name')} — ${t('app.tagline')}`} />
      <meta name="twitter:description" content={t('app.tagline')} />
      <meta name="twitter:image" content={OG_IMAGE_URL} />

      {!activeLocation ? (
        // Wider than before (max-w-2xl): LocationEmptyState now also renders
        // LocationGlobe, a genuine ~420-480px-diameter globe, which max-w-2xl
        // (42rem/672px) would leave feeling cramped/edge-to-edge next to its
        // own card padding. max-w-3xl gives the globe real breathing room
        // without reintroducing the "huge unused side gutters" problem —
        // this is still a single centered card, not a full-width grid like
        // LocationDashboard, so it doesn't need max-w-6xl's extra width.
        <div className="mx-auto w-full max-w-3xl px-4 py-16">
          <LocationEmptyState onSelectCity={handleSelectCity} isLocating={geolocation.isFetching} />
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
          {/* Search and the clock used to live in two separate rows with two
              different max-widths (this row capped at max-w-3xl, the clock
              full-width-right-aligned inside LocationDashboard's max-w-6xl)
              — visually that left a large, unbalanced gap between them.
              They're a single row now, capped together at max-w-4xl so the
              header stays a reasonably-sized, centered unit distinct from
              the wider max-w-6xl dashboard grid below (an uncapped row would
              stretch the search input edge-to-edge on wide screens, which is
              its own kind of awkward). Stacked on mobile, side by side from
              sm up. LocationDashboard's own clock row is suppressed
              (`showClock={false}`) since this one already covers it. */}
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 sm:flex-row sm:items-center">
            {/* glass-card, not a bare flex row: this sits directly over the
                weather-reactive gradient background (LocationDashboard below
                renders it fixed/full-viewport). The search input is
                bg-transparent by design elsewhere in the app (fine over the
                app's own solid page background), so without an opaque-enough
                backing here its placeholder text — which follows the app
                THEME — can land unreadably close to the gradient's own color
                when the gradient's day/night stop doesn't match the theme
                (e.g. light theme + night). */}
            <div className="glass-card flex min-w-0 flex-1 flex-wrap items-center justify-between gap-4 p-3">
              <CitySearch onSelect={handleSelectCity} />
              {locations.length > 1 && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/compare">{t('nav.compare')}</Link>
                </Button>
              )}
            </div>
            {timezone && (
              <Clock timezone={timezone} className="glass-card shrink-0 px-4 py-3 text-right" />
            )}
          </div>

          <LocationDashboard location={activeLocation} showClock={false} />
        </div>
      )}
    </>
  )
}
