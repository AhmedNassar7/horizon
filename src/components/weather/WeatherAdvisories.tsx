import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Advisory } from '@/lib/advisories'

const SEVERITY_STYLES: Record<Advisory['severity'], string> = {
  moderate:
    'border-amber-400/50 bg-amber-100/60 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
  severe: 'border-danger/40 bg-danger/10 text-danger',
}

export function WeatherAdvisories({ advisories }: { advisories: Advisory[] }) {
  if (advisories.length === 0) return null

  return (
    <ul className="flex flex-col gap-2" aria-label="Forecast advisories">
      {advisories.map((advisory) => (
        <li
          key={advisory.id}
          // ARIA live-region status announcement, not a form result — <output> would be wrong here.
          role="status" // oxlint-disable-line prefer-tag-over-role
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium',
            SEVERITY_STYLES[advisory.severity],
          )}
        >
          <AlertTriangle aria-hidden="true" className="size-4 shrink-0" />
          {advisory.message}
        </li>
      ))}
    </ul>
  )
}
