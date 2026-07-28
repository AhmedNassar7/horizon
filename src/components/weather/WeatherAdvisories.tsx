import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { Advisory } from '@/lib/advisories'

// Solid surface+text pairs (not translucent) so contrast holds regardless of
// what's behind the banner — see the token comment in index.css.
const SEVERITY_STYLES: Record<Advisory['severity'], string> = {
  moderate: 'border-warning-text/30 bg-warning-surface text-warning-text',
  severe: 'border-danger-text/30 bg-danger-surface text-danger-text',
}

export function WeatherAdvisories({ advisories }: { advisories: Advisory[] }) {
  const { t } = useTranslation()
  if (advisories.length === 0) return null

  return (
    // Plain divs, not a <ul>/<li> list: each item's real role is "status" (an
    // ARIA live region), not "listitem", and mixing the two breaks the
    // list/listitem structural relationship axe checks for.
    <div className="flex flex-col gap-2" aria-label="Forecast advisories">
      {advisories.map((advisory) => (
        <div
          key={advisory.id}
          // ARIA live-region status announcement, not a form result — <output> would be wrong here.
          role="status" // oxlint-disable-line prefer-tag-over-role
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium',
            SEVERITY_STYLES[advisory.severity],
          )}
        >
          <AlertTriangle aria-hidden="true" className="size-4 shrink-0" />
          {t(advisory.messageKey)}
        </div>
      ))}
    </div>
  )
}
