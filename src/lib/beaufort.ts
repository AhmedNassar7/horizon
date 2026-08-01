export interface BeaufortScale {
  /** Beaufort force number, 0-12. */
  force: number
  /** i18next key (`weather.beaufort.*`), resolved by the component that renders it. */
  labelKey: string
}

/**
 * Standard 0-12 Beaufort wind force scale, thresholded on sustained wind
 * speed in km/h (upper bound of each force's official range).
 * https://en.wikipedia.org/wiki/Beaufort_scale
 */
const UPPER_BOUNDS_KMH = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117]

export function getBeaufortScale(kmh: number | null): BeaufortScale {
  if (kmh == null || kmh < 0) {
    return { force: 0, labelKey: 'weather.beaufort.0' }
  }
  const force = UPPER_BOUNDS_KMH.findIndex((upper) => kmh < upper)
  const resolvedForce = force === -1 ? 12 : force
  return { force: resolvedForce, labelKey: `weather.beaufort.${resolvedForce}` }
}
