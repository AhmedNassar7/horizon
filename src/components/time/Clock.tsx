import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

export function Clock({ timezone, className }: { timezone: string; className?: string }) {
  const [now, setNow] = useState(() => new Date())
  const timeFormat = useSettingsStore((s) => s.timeFormat)

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const time = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: timeFormat === '12h',
  }).format(now)

  const date = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(now)

  return (
    <div className={className}>
      <p className="font-display text-3xl font-semibold tabular-nums" aria-live="off">
        <span aria-hidden="true">{time}</span>
        <span className="sr-only">Current time {time}</span>
      </p>
      <p className="text-muted-foreground text-sm">{date}</p>
    </div>
  )
}
