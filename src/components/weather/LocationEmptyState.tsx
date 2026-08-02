import { lazy, Suspense } from 'react'
import { MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CitySearch } from '@/components/search/CitySearch'
import type { CityResult } from '@/schemas/geocoding'

// d3-geo/topojson/world-atlas add real weight (the land topology data
// itself, plus the drag/zoom/timer machinery) that only this empty state
// ever needs — most sessions have a saved location and never render it, so
// it's split into its own chunk exactly like LocationMap/HourlyForecast are
// in LocationDashboard.
const LocationGlobe = lazy(() =>
  import('@/components/globe/LocationGlobe').then((m) => ({ default: m.LocationGlobe })),
)

function GlobeSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="bg-muted mx-auto [aspect-ratio:1] w-full max-w-[420px] animate-pulse rounded-full sm:max-w-[480px]"
    />
  )
}

export function LocationEmptyState({
  onSelectCity,
  isLocating,
}: {
  onSelectCity: (city: CityResult) => void
  isLocating: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className="glass-card flex flex-col items-center gap-6 p-10 text-center">
      <MapPin aria-hidden="true" className="text-muted-foreground size-10" />
      <div>
        <p className="font-medium">
          {isLocating ? t('home.findingLocation') : t('home.getStarted')}
        </p>
        <p className="text-muted-foreground text-sm">{t('home.getStartedBody')}</p>
      </div>
      <CitySearch onSelect={onSelectCity} />
      <Suspense fallback={<GlobeSkeleton />}>
        <LocationGlobe />
      </Suspense>
    </div>
  )
}
