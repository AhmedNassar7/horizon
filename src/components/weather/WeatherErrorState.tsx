import { CloudOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WeatherErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="glass-card flex flex-col items-center gap-3 p-10 text-center">
      <CloudOff aria-hidden="true" className="text-muted-foreground size-10" />
      <p className="font-medium">Couldn't load the weather</p>
      <p className="text-muted-foreground text-sm">
        Check your connection and try again — Horizon will keep showing the last data it had.
      </p>
      <Button onClick={onRetry}>Try again</Button>
    </div>
  )
}
