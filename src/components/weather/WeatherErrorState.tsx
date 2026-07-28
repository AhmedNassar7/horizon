import { CloudOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function WeatherErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <div role="alert" className="glass-card flex flex-col items-center gap-3 p-10 text-center">
      <CloudOff aria-hidden="true" className="text-muted-foreground size-10" />
      <p className="font-medium">{t('weather.errorTitle')}</p>
      <p className="text-muted-foreground text-sm">{t('weather.errorBody')}</p>
      <Button onClick={onRetry}>{t('weather.retry')}</Button>
    </div>
  )
}
