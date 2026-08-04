import type { TemperatureUnit, WindUnit } from '@/store/settingsStore'

export function celsiusTo(unit: TemperatureUnit, celsius: number): number {
  return unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius
}

export function formatTemperature(
  celsius: number | null,
  unit: TemperatureUnit,
  locale = 'en',
): string {
  if (celsius == null) return '—'
  const value = celsiusTo(unit, celsius)
  return `${Math.round(value).toLocaleString(locale)}°`
}

const KMH_TO_MPH = 0.621371
const KMH_TO_KN = 0.539957

export function kmhTo(unit: WindUnit, kmh: number): number {
  if (unit === 'mph') return kmh * KMH_TO_MPH
  if (unit === 'kn') return kmh * KMH_TO_KN
  return kmh
}

export function formatWindSpeed(kmh: number | null, unit: WindUnit, locale = 'en'): string {
  if (kmh == null) return '—'
  const value = kmhTo(unit, kmh)
  const label = unit === 'kmh' ? 'km/h' : unit === 'mph' ? 'mph' : 'kn'
  return `${Math.round(value).toLocaleString(locale)} ${label}`
}

export function formatPercent(value: number | null, locale = 'en'): string {
  if (value == null) return '—'
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(
    value / 100,
  )
}

const M_TO_KM = 1 / 1000
const M_TO_MI = 1 / 1609.344

/**
 * There's no dedicated distance-unit setting in the store, so visibility
 * follows the same metric/imperial split as `windUnit`: miles when the
 * user picked mph (an imperial wind unit), km otherwise (including knots,
 * which pairs with metric distances in most weather UIs).
 */
export function formatVisibility(meters: number | null, windUnit: WindUnit, locale = 'en'): string {
  if (meters == null) return '—'
  const useMiles = windUnit === 'mph'
  const value = useMiles ? meters * M_TO_MI : meters * M_TO_KM
  const label = useMiles ? 'mi' : 'km'
  const maximumFractionDigits = value < 10 ? 1 : 0
  return `${value.toLocaleString(locale, { maximumFractionDigits })} ${label}`
}

const KM_TO_MI = 1 / 1.609344

/**
 * Sibling to formatVisibility, but takes kilometers directly (e.g. distance
 * to an earthquake epicenter) instead of meters. Same metric/imperial split
 * keyed off windUnit, since there's no dedicated distance-unit setting.
 */
export function formatDistance(km: number | null, windUnit: WindUnit, locale = 'en'): string {
  if (km == null) return '—'
  const useMiles = windUnit === 'mph'
  const value = useMiles ? km * KM_TO_MI : km
  const label = useMiles ? 'mi' : 'km'
  const maximumFractionDigits = value < 10 ? 1 : 0
  return `${value.toLocaleString(locale, { maximumFractionDigits })} ${label}`
}

const COMPASS_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

export function degreesToCompass(deg: number): string {
  const index = Math.round(deg / 45) % 8
  return COMPASS_DIRECTIONS[((index % 8) + 8) % 8] as string
}
