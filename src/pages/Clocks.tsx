import { useEffect, useState } from 'react'
import { useLocationStore } from '@/store/locationStore'
import { CitySearch } from '@/components/search/CitySearch'
import { WorldClockCard } from '@/components/time/WorldClockCard'
import { TimeDifference } from '@/components/time/TimeDifference'
import type { CityResult } from '@/schemas/geocoding'

export default function Clocks() {
  const locations = useLocationStore((s) => s.locations)
  const addLocation = useLocationStore((s) => s.addLocation)
  const removeLocation = useLocationStore((s) => s.removeLocation)

  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

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
      <div>
        <h1 className="font-display text-2xl font-semibold">World clocks</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Live local time for every place you're tracking.
        </p>
      </div>

      <CitySearch onSelect={handleSelect} />

      {locations.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No saved locations yet — search for a city above to add one.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <WorldClockCard
              key={location.id}
              location={location}
              now={now}
              onRemove={() => removeLocation(location.id)}
            />
          ))}
        </div>
      )}

      <TimeDifference />
    </div>
  )
}
