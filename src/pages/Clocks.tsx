import { useEffect, useState } from 'react'
// Clocks.tsx is already behind React.lazy() in App.tsx, so importing
// framer-motion here never touches the eagerly-bundled main chunk (see
// WeatherBackground.tsx for the precedent). AnimatePresence lets a removed
// card animate out instead of just vanishing, and `layout` on the survivors
// smoothly closes the gap it leaves in the grid.
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useLocationStore } from '@/store/locationStore'
import { CitySearch } from '@/components/search/CitySearch'
import { WorldClockCard } from '@/components/time/WorldClockCard'
import { TimeDifference } from '@/components/time/TimeDifference'
import { SITE_URL, OG_IMAGE_URL } from '@/lib/seo'
import type { CityResult } from '@/schemas/geocoding'

export default function Clocks() {
  const { t } = useTranslation()
  const locations = useLocationStore((s) => s.locations)
  const addLocation = useLocationStore((s) => s.addLocation)
  const removeLocation = useLocationStore((s) => s.removeLocation)

  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const prefersReducedMotion = useReducedMotion()
  const cardTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }

  const handleSelect = (city: CityResult) => {
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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <title>{`${t('clocks.title')} — ${t('app.name')}`}</title>
      <meta name="description" content={t('clocks.subtitle')} />
      <meta property="og:title" content={`${t('clocks.title')} — ${t('app.name')}`} />
      <meta property="og:description" content={t('clocks.subtitle')} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${SITE_URL}/clocks`} />
      <meta property="og:image" content={OG_IMAGE_URL} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${t('clocks.title')} — ${t('app.name')}`} />
      <meta name="twitter:description" content={t('clocks.subtitle')} />
      <meta name="twitter:image" content={OG_IMAGE_URL} />

      <div>
        <h1 className="font-display text-2xl font-semibold">{t('clocks.title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('clocks.subtitle')}</p>
      </div>

      <CitySearch onSelect={handleSelect} />

      {locations.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t('clocks.empty')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false} mode="popLayout">
            {locations.map((location) => (
              <motion.div
                key={location.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={cardTransition}
              >
                <WorldClockCard
                  location={location}
                  now={now}
                  onRemove={() => removeLocation(location.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <TimeDifference />
    </div>
  )
}
