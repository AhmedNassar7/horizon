import { MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CitySearch } from '@/components/search/CitySearch'
import type { CityResult } from '@/schemas/geocoding'

export function LocationEmptyState({
  onSelectCity,
  isLocating,
}: {
  onSelectCity: (city: CityResult) => void
  isLocating: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className="glass-card flex flex-col items-center gap-4 p-10 text-center">
      <MapPin aria-hidden="true" className="text-muted-foreground size-10" />
      <div>
        <p className="font-medium">
          {isLocating ? t('home.findingLocation') : t('home.getStarted')}
        </p>
        <p className="text-muted-foreground text-sm">{t('home.getStartedBody')}</p>
      </div>
      <CitySearch onSelect={onSelectCity} />
    </div>
  )
}
