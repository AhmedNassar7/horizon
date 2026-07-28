const SYNODIC_MONTH_DAYS = 29.53058867
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0)

export interface MoonPhase {
  /** 0 = new moon, 0.5 = full moon, approaching 1 wraps back to new moon. */
  fraction: number
  /** i18next key (`weather.moon.*`), resolved by the component that renders it. */
  nameKey: string
  emoji: string
}

const PHASES: { max: number; nameKey: string; emoji: string }[] = [
  { max: 0.0625, nameKey: 'weather.moon.newMoon', emoji: '🌑' },
  { max: 0.1875, nameKey: 'weather.moon.waxingCrescent', emoji: '🌒' },
  { max: 0.3125, nameKey: 'weather.moon.firstQuarter', emoji: '🌓' },
  { max: 0.4375, nameKey: 'weather.moon.waxingGibbous', emoji: '🌔' },
  { max: 0.5625, nameKey: 'weather.moon.fullMoon', emoji: '🌕' },
  { max: 0.6875, nameKey: 'weather.moon.waningGibbous', emoji: '🌖' },
  { max: 0.8125, nameKey: 'weather.moon.lastQuarter', emoji: '🌗' },
  { max: 0.9375, nameKey: 'weather.moon.waningCrescent', emoji: '🌘' },
  { max: 1, nameKey: 'weather.moon.newMoon', emoji: '🌑' },
]

/**
 * Approximate moon phase for a given instant, accurate to roughly a day —
 * a simple synodic-month calculation, computed entirely client-side with
 * no API. Good enough for a decorative weather-app display, not intended
 * for astronomical precision.
 */
export function getMoonPhase(date: Date): MoonPhase {
  const daysSinceNewMoon = (date.getTime() - KNOWN_NEW_MOON_UTC) / 86_400_000
  const fraction =
    (((daysSinceNewMoon % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS) /
    SYNODIC_MONTH_DAYS

  const match = PHASES.find((p) => fraction <= p.max)
  return {
    fraction,
    nameKey: match?.nameKey ?? 'weather.moon.newMoon',
    emoji: match?.emoji ?? '🌑',
  }
}
