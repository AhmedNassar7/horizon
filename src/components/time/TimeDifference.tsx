import { X } from 'lucide-react'
// framer-motion is safe to import here: TimeDifference is only ever rendered
// from Clocks.tsx, which App.tsx already loads via React.lazy — so this never
// touches the eagerly-bundled main chunk (see WeatherBackground.tsx for the
// same reasoning applied to the dashboard). AnimatePresence is used here
// because a removed <li> can't animate itself out with CSS alone — the DOM
// node needs to still be present, mid-exit-animation, after React would
// otherwise have already removed it.
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTimezoneStore } from '@/store/timezoneStore'
import { useSettingsStore } from '@/store/settingsStore'
import { formatTimeInZone, getRelativeOffsetHours, resolveTimezone } from '@/lib/timezone'
import { CitySearch } from '@/components/search/CitySearch'
import { Button } from '@/components/ui/button'
import type { CityResult } from '@/schemas/geocoding'

function relativeLabel(
  hours: number,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  if (hours === 0) return t('timeDifference.sameTime')
  const rounded = Math.round(hours * 2) / 2
  const magnitude = Math.abs(rounded)
  return rounded > 0
    ? t('timeDifference.hourAhead', { count: magnitude })
    : t('timeDifference.hourBehind', { count: magnitude })
}

export function TimeDifference() {
  const { t } = useTranslation()
  const { selections, addSelection, removeSelection } = useTimezoneStore()
  const timeFormat = useSettingsStore((s) => s.timeFormat)
  const now = new Date()
  const prefersReducedMotion = useReducedMotion()
  const itemTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }

  const handleSelect = (city: CityResult) => {
    addSelection({
      id: String(city.id),
      label: [city.name, city.country].filter(Boolean).join(', '),
      timezone: resolveTimezone(city.latitude, city.longitude),
    })
  }

  return (
    <section aria-label={t('timeDifference.title')} className="glass-card p-6">
      <h2 className="font-display text-lg font-semibold">{t('timeDifference.title')}</h2>
      <p className="text-muted-foreground text-sm">{t('timeDifference.subtitle')}</p>
      <div className="mt-4">
        <CitySearch onSelect={handleSelect} />
      </div>

      {selections.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {selections.map((selection) => (
              <motion.li
                key={selection.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={itemTransition}
                className="bg-muted/60 flex items-center justify-between gap-3 rounded-lg px-4 py-2"
              >
                <div>
                  <p className="font-medium">{selection.label}</p>
                  <p className="text-muted-foreground text-sm">
                    {formatTimeInZone(now, selection.timezone, {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: timeFormat === '12h',
                    })}
                    {' · '}
                    {relativeLabel(getRelativeOffsetHours(selection.timezone, now), t)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeSelection(selection.id)}
                  aria-label={t('timeDifference.removeAria', { name: selection.label })}
                >
                  <X aria-hidden="true" className="size-4" />
                </Button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  )
}
