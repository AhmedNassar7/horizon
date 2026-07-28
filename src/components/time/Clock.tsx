import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/settingsStore'

export function Clock({ timezone, className }: { timezone: string; className?: string }) {
  const { t, i18n } = useTranslation()
  const [now, setNow] = useState(() => new Date())
  const timeFormat = useSettingsStore((s) => s.timeFormat)

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Locale-aware weekday/month wording, but numerals stay Latin/Western
  // across every language for visual consistency with the rest of the UI.
  const time = new Intl.DateTimeFormat(i18n.language, {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: timeFormat === '12h',
    numberingSystem: 'latn',
  }).format(now)

  const date = new Intl.DateTimeFormat(i18n.language, {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    numberingSystem: 'latn',
  }).format(now)

  return (
    <div className={className}>
      <p className="font-display text-3xl font-semibold tabular-nums" aria-live="off">
        <span aria-hidden="true">{time}</span>
        <span className="sr-only">{t('clocks.srCurrentTime', { time })}</span>
      </p>
      <p className="text-muted-foreground text-sm">{date}</p>
    </div>
  )
}
