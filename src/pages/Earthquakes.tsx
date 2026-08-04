import { lazy, Suspense, useState } from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useGlobalEarthquakes, GLOBAL_LIMIT } from '@/hooks/useEarthquakes'
import { getMagnitudeLevel } from '@/lib/earthquakeMagnitude'
import { formatTimeAgo } from '@/lib/relativeTime'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { SITE_URL, OG_IMAGE_URL } from '@/lib/seo'

// Leaflet is only needed for this one section — same reasoning as
// LocationMap.tsx's own lazy-loading — so it shouldn't block the rest of
// this page (filters, list, safety info) from rendering immediately.
const EarthquakeMap = lazy(() =>
  import('@/components/earthquakes/EarthquakeMap').then((m) => ({ default: m.EarthquakeMap })),
)

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

const DEFAULT_MIN_MAGNITUDE = 4.5
const DEFAULT_WINDOW_MS = 7 * DAY_MS

const MAGNITUDE_PRESETS = [
  { value: 0, label: 'earthquake.filters.magnitudeAll' },
  { value: 2.5, label: '2.5+' },
  { value: 4.5, label: '4.5+' },
  { value: 6, label: '6.0+' },
] as const

const WINDOW_PRESETS = [
  { value: DAY_MS, labelKey: 'earthquake.filters.window24h' },
  { value: 7 * DAY_MS, labelKey: 'earthquake.filters.window7d' },
  { value: 30 * DAY_MS, labelKey: 'earthquake.filters.window30d' },
] as const

const SAFETY_ITEM_KEYS = ['1', '2', '3', '4', '5', '6'] as const

export default function Earthquakes() {
  const { t, i18n } = useTranslation()
  const [minMagnitude, setMinMagnitude] = useState<number>(DEFAULT_MIN_MAGNITUDE)
  const [windowMs, setWindowMs] = useState<number>(DEFAULT_WINDOW_MS)

  const { data, isPending, isError, refetch } = useGlobalEarthquakes(minMagnitude, windowMs)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <title>{`${t('earthquake.title')} — ${t('app.name')}`}</title>
      <meta name="description" content={t('earthquake.subtitle')} />
      <meta property="og:title" content={`${t('earthquake.title')} — ${t('app.name')}`} />
      <meta property="og:description" content={t('earthquake.subtitle')} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${SITE_URL}/earthquakes`} />
      <meta property="og:image" content={OG_IMAGE_URL} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${t('earthquake.title')} — ${t('app.name')}`} />
      <meta name="twitter:description" content={t('earthquake.subtitle')} />
      <meta name="twitter:image" content={OG_IMAGE_URL} />

      <h1 className="font-display text-3xl font-semibold">{t('earthquake.title')}</h1>
      <p className="text-muted-foreground mt-2">{t('earthquake.subtitle')}</p>

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium">
            {t('earthquake.filters.minMagnitude')}
          </p>
          <ToggleGroup
            type="single"
            variant="outline"
            value={String(minMagnitude)}
            onValueChange={(value) => value && setMinMagnitude(Number(value))}
            aria-label={t('earthquake.filters.minMagnitude')}
          >
            {MAGNITUDE_PRESETS.map((preset) => (
              <ToggleGroupItem key={preset.value} value={String(preset.value)}>
                {preset.value === 0 ? t(preset.label) : preset.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium">
            {t('earthquake.filters.timeWindow')}
          </p>
          <ToggleGroup
            type="single"
            variant="outline"
            value={String(windowMs)}
            onValueChange={(value) => value && setWindowMs(Number(value))}
            aria-label={t('earthquake.filters.timeWindow')}
          >
            {WINDOW_PRESETS.map((preset) => (
              <ToggleGroupItem key={preset.value} value={String(preset.value)}>
                {t(preset.labelKey)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      {isPending && (
        <div className="mt-6 flex flex-col gap-4" aria-busy="true" aria-live="polite">
          <span className="sr-only">{t('weather.loading')}</span>
          <div className="glass-card h-[28rem] animate-pulse" />
          <div className="glass-card h-64 animate-pulse" />
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="glass-card mt-6 flex flex-col items-center gap-3 p-10 text-center"
        >
          <AlertTriangle aria-hidden="true" className="text-muted-foreground size-10" />
          <p className="font-medium">{t('earthquake.errorTitle')}</p>
          <p className="text-muted-foreground text-sm">{t('earthquake.errorBody')}</p>
          <Button onClick={() => refetch()}>{t('earthquake.retry')}</Button>
        </div>
      )}

      {data && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="glass-card h-[28rem] animate-pulse" />}>
              <EarthquakeMap earthquakes={data} />
            </Suspense>
          </div>

          <section aria-label={t('earthquake.title')} className="glass-card lg:col-span-1">
            {data.length === 0 ? (
              <p className="text-muted-foreground p-6 text-sm">{t('earthquake.empty')}</p>
            ) : (
              <>
                <ul className="divide-border/60 max-h-[28rem] divide-y overflow-y-auto">
                  {data.map((eq) => {
                    const level = getMagnitudeLevel(eq.magnitude)
                    return (
                      <li key={eq.id} className="flex items-start gap-3 p-4">
                        <span
                          className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
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
                            {eq.depthKm != null && (
                              <>
                                {t('earthquake.depth')}: {eq.depthKm.toFixed(1)} km ·{' '}
                              </>
                            )}
                            {formatTimeAgo(eq.timeMs, i18n.language)}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                {data.length >= GLOBAL_LIMIT && (
                  <p className="text-muted-foreground border-border/60 border-t p-4 text-xs">
                    {t('earthquake.truncatedNotice', { count: data.length })}
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      )}

      <section id="safety" className="glass-card mt-10 p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck aria-hidden="true" className="text-primary size-5" />
          <h2 className="font-display text-lg font-semibold">{t('earthquake.safety.title')}</h2>
        </div>
        <p className="text-muted-foreground mt-2 text-sm">{t('earthquake.safety.intro')}</p>
        <ul className="mt-4 flex flex-col gap-2">
          {SAFETY_ITEM_KEYS.map((key) => (
            <li key={key} className="flex gap-2 text-sm">
              <span aria-hidden="true">•</span>
              <span>{t(`earthquake.safety.items.${key}`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-muted-foreground mt-6 text-xs">
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
  )
}
