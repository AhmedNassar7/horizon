const SECOND_MS = 1000
const MINUTE_MS = 60 * SECOND_MS
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS
const WEEK_MS = 7 * DAY_MS

/**
 * Formats a timestamp as a relative "time ago" string (e.g. "5 minutes
 * ago"), bucketed into seconds/minutes/hours/days and rendered through
 * Intl.RelativeTimeFormat so pluralization/wording stays correct per
 * locale. Beyond a week, "N days ago" stops being a useful unit, so it
 * falls back to a plain calendar date instead.
 *
 * `now` defaults to Date.now() but is an explicit parameter (rather than
 * always reading the clock internally) so tests can assert exact bucket
 * boundaries deterministically.
 */
export function formatTimeAgo(timeMs: number, locale = 'en', now: number = Date.now()): string {
  const diffMs = now - timeMs
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (diffMs < MINUTE_MS) {
    // `numeric: 'auto'` renders 0 seconds as the locale's idiomatic "now"
    // phrasing rather than a literal "0 seconds ago".
    return rtf.format(0, 'second')
  }
  if (diffMs < HOUR_MS) {
    return rtf.format(-Math.floor(diffMs / MINUTE_MS), 'minute')
  }
  if (diffMs < DAY_MS) {
    return rtf.format(-Math.floor(diffMs / HOUR_MS), 'hour')
  }
  if (diffMs < WEEK_MS) {
    return rtf.format(-Math.floor(diffMs / DAY_MS), 'day')
  }
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(timeMs))
}
