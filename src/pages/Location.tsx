import { Link, useParams } from 'react-router-dom'
import { useLocationStore } from '@/store/locationStore'
import { LocationDashboard } from '@/components/weather/LocationDashboard'
import { Button } from '@/components/ui/button'

export default function Location() {
  const { slug } = useParams<{ slug: string }>()
  const locations = useLocationStore((s) => s.locations)
  const location = locations.find((l) => l.id === slug)

  if (!location) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
        <p className="font-medium">Location not found</p>
        <p className="text-muted-foreground mt-1 text-sm">
          It may have been removed from your saved locations.
        </p>
        <Button asChild className="mt-4">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <LocationDashboard location={location} />
    </div>
  )
}
