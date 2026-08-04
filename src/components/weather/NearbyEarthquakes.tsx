import { Activity } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { getMagnitudeLevel } from '@/lib/earthquakeMagnitude'
import { haversineDistance } from '@/lib/geo'
import { formatDistance } from '@/lib/units'
import { formatTimeAgo } from '@/lib/relativeTime'
import { cn } from '@/lib/utils'
import type { Earthquake } from '@/schemas/earthquake'
import type { SavedLocation } from '@/store/locationStore'
import type { WindUnit } from '@/store/settingsStore'

const MAX_VISIBLE = 5

export function NearbyEarthquakes({
  data,
  location,
  windUnit,
}: {
  data: Earthquake[]
  location: SavedLocation
  windUnit: WindUnit
}) {
  const { t, i18n } = useTranslation()
  const visible = data.slice(0, MAX_VISIBLE)

  return (
    <section
      aria-label={t('earthquake.nearby.title')}
      className="glass-card animate-in fade-in slide-in-from-bottom-2 ease-expo-out p-6 duration-300"
    >
      <div className="flex items-center gap-2">
        <Activity aria-hidden="true" className="text-primary size-5" />
        <h2 className="font-display text-lg font-semibold">{t('earthquake.nearby.title')}</h2>
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground mt-4 text-sm">{t('earthquake.nearby.empty')}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {visible.map((eq) => {
            const level = getMagnitudeLevel(eq.magnitude)
            const distanceKm = haversineDistance(
              location.latitude,
              location.longitude,
              eq.latitude,
              eq.longitude,
            )
            return (
              <li key={eq.id} className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums',
                    level.colorClass,
                  )}
                >
                  {eq.magnitude != null ? eq.magnitude.toFixed(1) : '—'}
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={eq.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-primary block truncate text-sm font-medium underline-offset-2 hover:underline"
                  >
                    {eq.place ?? t('earthquake.place')}
                  </a>
                  <p className="text-muted-foreground text-xs">
                    {formatDistance(distanceKm, windUnit, i18n.language)} ·{' '}
                    {formatTimeAgo(eq.timeMs, i18n.language)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="border-border/60 mt-4 flex flex-col gap-1 border-t pt-3">
        <Link to="/earthquakes#safety" className="text-primary text-xs hover:underline">
          {t('earthquake.nearby.safetyPrompt')}
        </Link>
        <p className="text-muted-foreground text-xs">
          <a
            href="https://earthquake.usgs.gov/"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            {t('earthquake.attribution')}
          </a>
        </p>
      </div>
    </section>
  )
}
