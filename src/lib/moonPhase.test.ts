import { describe, expect, it } from 'vitest'
import { getMoonPhase } from './moonPhase'

describe('getMoonPhase', () => {
  it('identifies a new moon at the known reference instant', () => {
    const phase = getMoonPhase(new Date(Date.UTC(2000, 0, 6, 18, 14, 0)))
    expect(phase.nameKey).toBe('weather.moon.newMoon')
    expect(phase.fraction).toBeCloseTo(0, 2)
  })

  it('identifies a full moon roughly half a synodic month later', () => {
    const halfMonthLaterMs = Date.UTC(2000, 0, 6, 18, 14, 0) + 14.765 * 86_400_000
    const phase = getMoonPhase(new Date(halfMonthLaterMs))
    expect(phase.nameKey).toBe('weather.moon.fullMoon')
    expect(phase.fraction).toBeCloseTo(0.5, 1)
  })

  it('wraps around correctly for dates before the reference instant', () => {
    const phase = getMoonPhase(new Date(Date.UTC(1999, 11, 1)))
    expect(phase.fraction).toBeGreaterThanOrEqual(0)
    expect(phase.fraction).toBeLessThan(1)
  })
})
