import { Pause, Play, RotateCcw, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCountdown } from '@/hooks/useCountdown'
import { formatDuration } from '@/lib/duration'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CountdownTimerCard({
  label,
  durationMs,
  onRemove,
}: {
  label: string
  durationMs: number
  onRemove: () => void
}) {
  const { t } = useTranslation()
  const { remainingMs, isRunning, isFinished, start, pause, reset } = useCountdown(durationMs)

  return (
    <div
      className={cn(
        'glass-card relative flex flex-col gap-2 p-5',
        isFinished && 'ring-danger ring-2',
      )}
      role={isFinished ? 'alert' : undefined}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute top-2 right-2"
        onClick={onRemove}
        aria-label={t('timers.removeAria', { label })}
      >
        <X aria-hidden="true" className="size-4" />
      </Button>

      <p className="font-medium">{label}</p>
      <p
        className={cn(
          'font-display text-4xl font-semibold tabular-nums',
          isFinished && 'text-danger',
        )}
      >
        {isFinished ? t('timers.timesUp') : formatDuration(remainingMs, { showTenths: false })}
      </p>

      <div className="mt-2 flex gap-2">
        {isRunning ? (
          <Button onClick={pause} variant="secondary" size="sm">
            <Pause aria-hidden="true" /> {t('timers.pause')}
          </Button>
        ) : (
          <Button onClick={start} size="sm" disabled={isFinished}>
            <Play aria-hidden="true" /> {t('timers.start')}
          </Button>
        )}
        <Button onClick={reset} variant="ghost" size="sm">
          <RotateCcw aria-hidden="true" /> {t('timers.reset')}
        </Button>
      </div>
    </div>
  )
}
