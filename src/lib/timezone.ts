import tzLookup from '@photostructure/tz-lookup'

/**
 * Resolves the IANA timezone for a coordinate entirely client-side —
 * no network request, no API key, works offline. Falls back to the
 * browser's own timezone if the coordinate is somehow out of range
 * (e.g. open ocean far from any land boundary).
 */
export function resolveTimezone(latitude: number, longitude: number): string {
  try {
    return tzLookup(latitude, longitude)
  } catch {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

export function formatTimeInZone(
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = {},
  locale = 'en',
): string {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
    ...options,
  }).format(date)
}

/** UTC offset in minutes for a given IANA timezone, at a given instant (DST-aware). */
export function getUtcOffsetMinutes(timeZone: string, date: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone,
    timeZoneName: 'shortOffset',
  }).formatToParts(date)

  const offsetPart = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+0'
  const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(offsetPart)
  if (!match) return 0

  const sign = match[1] === '-' ? -1 : 1
  const hours = Number(match[2] ?? 0)
  const minutes = Number(match[3] ?? 0)
  return sign * (hours * 60 + minutes)
}

export function formatUtcOffset(timeZone: string, date: Date = new Date()): string {
  const minutes = getUtcOffsetMinutes(timeZone, date)
  const sign = minutes >= 0 ? '+' : '-'
  const abs = Math.abs(minutes)
  const hours = Math.floor(abs / 60)
  const mins = abs % 60
  return mins === 0 ? `UTC${sign}${hours}` : `UTC${sign}${hours}:${String(mins).padStart(2, '0')}`
}

/** The local calendar date (YYYY-MM-DD) for a timezone, at a given instant. */
function localDateKey(timeZone: string, date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/**
 * Calendar-day difference between a timezone's "today" and the viewer's own
 * "today" — e.g. -1 means that location is a day behind the viewer. Used to
 * show "Yesterday"/"Tomorrow" badges on world clock cards.
 */
export function getDayOffset(timeZone: string, date: Date = new Date()): number {
  const there = new Date(localDateKey(timeZone, date))
  const here = new Date(localDateKey(Intl.DateTimeFormat().resolvedOptions().timeZone, date))
  return Math.round((there.getTime() - here.getTime()) / 86_400_000)
}

/** Hour of day (0-23) for a timezone at a given instant. */
export function getLocalHour(date: Date, timeZone: string): number {
  const hourStr = new Intl.DateTimeFormat('en', {
    timeZone,
    hour: 'numeric',
    hour12: false,
  }).format(date)
  const hour = Number(hourStr)
  return hour === 24 ? 0 : hour
}

export function isDaytime(date: Date, sunrise: Date, sunset: Date): boolean {
  return date >= sunrise && date <= sunset
}

/** Hours a timezone is ahead of (positive) or behind (negative) the viewer's
 * own timezone, at a given instant — e.g. "what time is it there vs. here". */
export function getRelativeOffsetHours(timeZone: string, date: Date = new Date()): number {
  const viewerTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  return (getUtcOffsetMinutes(timeZone, date) - getUtcOffsetMinutes(viewerTz, date)) / 60
}
