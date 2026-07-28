import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocationStore } from '@/store/locationStore'
import { LocationDashboard } from '@/components/weather/LocationDashboard'
import { Button } from '@/components/ui/button'

export default function Location() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const locations = useLocationStore((s) => s.locations)
  const location = locations.find((l) => l.id === slug)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <title>{location ? `${location.name} — ${t('app.name')}` : t('app.name')}</title>

      {!location ? (
        <div className="mx-auto w-full max-w-2xl py-8 text-center">
          <p className="font-medium">{t('location.notFound')}</p>
          <p className="text-muted-foreground mt-1 text-sm">{t('location.notFoundBody')}</p>
          <Button asChild className="mt-4">
            <Link to="/">{t('notFound.backHome')}</Link>
          </Button>
        </div>
      ) : (
        <LocationDashboard location={location} />
      )}
    </div>
  )
}
