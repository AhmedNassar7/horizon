import { Pause, Play, RotateCcw, Flag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useStopwatch } from '@/hooks/useStopwatch'
import { formatDuration } from '@/lib/duration'
import { Button } from '@/components/ui/button'

export function Stopwatch() {
  const { t } = useTranslation()
  const { elapsedMs, isRunning, laps, start, pause, reset, lap } = useStopwatch()

  return (
    <section aria-label={t('timers.stopwatch')} className="glass-card p-6">
      <h2 className="font-display text-lg font-semibold">{t('timers.stopwatch')}</h2>
      <p className="font-display mt-4 text-5xl font-semibold tabular-nums" aria-live="off">
        {formatDuration(elapsedMs)}
      </p>

      <div className="mt-4 flex gap-2">
        {isRunning ? (
          <Button onClick={pause} variant="secondary">
            <Pause aria-hidden="true" /> {t('timers.pause')}
          </Button>
        ) : (
          <Button onClick={start}>
            <Play aria-hidden="true" /> {elapsedMs > 0 ? t('timers.resume') : t('timers.start')}
          </Button>
        )}
        <Button onClick={lap} variant="outline" disabled={!isRunning}>
          <Flag aria-hidden="true" /> {t('timers.lap')}
        </Button>
        <Button onClick={reset} variant="ghost" disabled={elapsedMs === 0 && laps.length === 0}>
          <RotateCcw aria-hidden="true" /> {t('timers.reset')}
        </Button>
      </div>

      {laps.length > 0 && (
        <ol className="mt-4 flex max-h-40 flex-col gap-1 overflow-y-auto text-sm">
          {laps.map((lapMs, index) => (
            <li key={laps.length - index} className="text-muted-foreground flex justify-between">
              <span>{t('timers.lapNumber', { number: laps.length - index })}</span>
              <span className="tabular-nums">{formatDuration(lapMs)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
