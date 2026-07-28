import { MapPin } from 'lucide-react'
import { CitySearch } from '@/components/search/CitySearch'
import type { CityResult } from '@/schemas/geocoding'

export function LocationEmptyState({
  onSelectCity,
  isLocating,
}: {
  onSelectCity: (city: CityResult) => void
  isLocating: boolean
}) {
  return (
    <div className="glass-card flex flex-col items-center gap-4 p-10 text-center">
      <MapPin aria-hidden="true" className="text-muted-foreground size-10" />
      <div>
        <p className="font-medium">
          {isLocating ? 'Finding your location…' : "Let's find your weather"}
        </p>
        <p className="text-muted-foreground text-sm">
          Search for a city to get started, or allow location access.
        </p>
      </div>
      <CitySearch onSelect={onSelectCity} />
    </div>
  )
}
