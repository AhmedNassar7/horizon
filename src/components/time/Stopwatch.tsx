import { Pause, Play, RotateCcw, Flag } from 'lucide-react'
import { useStopwatch } from '@/hooks/useStopwatch'
import { formatDuration } from '@/lib/duration'
import { Button } from '@/components/ui/button'

export function Stopwatch() {
  const { elapsedMs, isRunning, laps, start, pause, reset, lap } = useStopwatch()

  return (
    <section aria-label="Stopwatch" className="glass-card p-6">
      <h2 className="font-display text-lg font-semibold">Stopwatch</h2>
      <p className="font-display mt-4 text-5xl font-semibold tabular-nums" aria-live="off">
        {formatDuration(elapsedMs)}
      </p>

      <div className="mt-4 flex gap-2">
        {isRunning ? (
          <Button onClick={pause} variant="secondary">
            <Pause aria-hidden="true" /> Pause
          </Button>
        ) : (
          <Button onClick={start}>
            <Play aria-hidden="true" /> {elapsedMs > 0 ? 'Resume' : 'Start'}
          </Button>
        )}
        <Button onClick={lap} variant="outline" disabled={!isRunning}>
          <Flag aria-hidden="true" /> Lap
        </Button>
        <Button onClick={reset} variant="ghost" disabled={elapsedMs === 0 && laps.length === 0}>
          <RotateCcw aria-hidden="true" /> Reset
        </Button>
      </div>

      {laps.length > 0 && (
        <ol className="mt-4 flex max-h-40 flex-col gap-1 overflow-y-auto text-sm">
          {laps.map((lapMs, index) => (
            <li key={laps.length - index} className="text-muted-foreground flex justify-between">
              <span>Lap {laps.length - index}</span>
              <span className="tabular-nums">{formatDuration(lapMs)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
