import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLocationStore } from '@/store/locationStore'
import { useGeolocation } from '@/hooks/useGeolocation'
import { LocationDashboard } from '@/components/weather/LocationDashboard'
import { LocationEmptyState } from '@/components/weather/LocationEmptyState'
import { CitySearch } from '@/components/search/CitySearch'
import { Button } from '@/components/ui/button'
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
        {locations.length > 1 && (
          <Button asChild variant="outline" size="sm">
            <Link to="/compare">Compare</Link>
          </Button>
        )}
      </div>

      <LocationDashboard location={activeLocation} />
    </div>
  )
}
