import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Stopwatch } from '@/components/time/Stopwatch'
import { CountdownTimerCard } from '@/components/time/CountdownTimerCard'

interface TimerDraft {
  id: string
  label: string
  durationMs: number
}

export default function Timers() {
  const { t } = useTranslation()
  const [timers, setTimers] = useState<TimerDraft[]>([])
  const [label, setLabel] = useState('')
  const [minutes, setMinutes] = useState('5')
  const [seconds, setSeconds] = useState('0')

  const addTimer = (event: React.FormEvent) => {
    event.preventDefault()
    const totalMs = (Number(minutes) || 0) * 60_000 + (Number(seconds) || 0) * 1000
    if (totalMs <= 0) return

    setTimers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: label.trim() || t('timers.defaultLabel'),
        durationMs: totalMs,
      },
    ])
    setLabel('')
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <Helmet>
        <title>
          {t('timers.title')} — {t('app.name')}
        </title>
      </Helmet>

      <h1 className="font-display text-2xl font-semibold">{t('timers.title')}</h1>

      <form onSubmit={addTimer} className="glass-card flex flex-wrap items-end gap-3 p-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="timer-label" className="text-muted-foreground text-xs">
            {t('timers.label')}
          </label>
          <Input
            id="timer-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t('timers.labelPlaceholder')}
            className="w-36"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="timer-minutes" className="text-muted-foreground text-xs">
            {t('timers.minutes')}
          </label>
          <Input
            id="timer-minutes"
            type="number"
            min={0}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="timer-seconds" className="text-muted-foreground text-xs">
            {t('timers.seconds')}
          </label>
          <Input
            id="timer-seconds"
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            className="w-20"
          />
        </div>
        <Button type="submit">
          <Plus aria-hidden="true" /> {t('timers.addTimer')}
        </Button>
      </form>

      {timers.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {timers.map((timer) => (
            <CountdownTimerCard
              key={timer.id}
              label={timer.label}
              durationMs={timer.durationMs}
              onRemove={() =>
                setTimers((prev) => prev.filter((current) => current.id !== timer.id))
              }
            />
          ))}
        </div>
      )}

      <Stopwatch />
    </div>
  )
}
