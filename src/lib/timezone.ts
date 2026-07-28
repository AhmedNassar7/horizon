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

export function isDaytime(date: Date, sunrise: Date, sunset: Date): boolean {
  return date >= sunrise && date <= sunset
}
