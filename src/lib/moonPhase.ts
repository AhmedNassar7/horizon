const SYNODIC_MONTH_DAYS = 29.53058867
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0)

export type MoonPhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent'

export interface MoonPhase {
  /** 0 = new moon, 0.5 = full moon, approaching 1 wraps back to new moon. */
  fraction: number
  name: MoonPhaseName
  emoji: string
}

const PHASES: { max: number; name: MoonPhaseName; emoji: string }[] = [
  { max: 0.0625, name: 'New Moon', emoji: '🌑' },
  { max: 0.1875, name: 'Waxing Crescent', emoji: '🌒' },
  { max: 0.3125, name: 'First Quarter', emoji: '🌓' },
  { max: 0.4375, name: 'Waxing Gibbous', emoji: '🌔' },
  { max: 0.5625, name: 'Full Moon', emoji: '🌕' },
  { max: 0.6875, name: 'Waning Gibbous', emoji: '🌖' },
  { max: 0.8125, name: 'Last Quarter', emoji: '🌗' },
  { max: 0.9375, name: 'Waning Crescent', emoji: '🌘' },
  { max: 1, name: 'New Moon', emoji: '🌑' },
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
  return { fraction, name: match?.name ?? 'New Moon', emoji: match?.emoji ?? '🌑' }
}
