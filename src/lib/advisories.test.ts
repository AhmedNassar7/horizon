import { describe, expect, it } from 'vitest'
import { computeAdvisories } from './advisories'
import type { CurrentConditions, DailyForecastPoint } from '@/schemas/weather'

function makeCurrent(overrides: Partial<CurrentConditions> = {}): CurrentConditions {
  return {
    time: '2026-07-28T12:00',
    temperatureC: 22,
    apparentTemperatureC: 22,
    humidityPercent: 50,
    windSpeedKmh: 10,
    windDirectionDeg: 180,
    windGustsKmh: 15,
    weatherCode: 1,
    surfacePressureHpa: 1013,
    cloudCoverPercent: 10,
    isDay: true,
    precipitationMm: 0,
    ...overrides,
  }
}

function makeDaily(overrides: Partial<DailyForecastPoint> = {}): DailyForecastPoint {
  return {
    date: '2026-07-28',
    tempMaxC: 25,
    tempMinC: 15,
    precipitationProbabilityMaxPercent: 10,
    weatherCode: 1,
    sunrise: '2026-07-28T05:00',
    sunset: '2026-07-28T20:00',
    uvIndexMax: 4,
    windSpeedMaxKmh: 15,
    windGustsMaxKmh: 20,
    ...overrides,
  }
}

describe('computeAdvisories', () => {
  it('returns no advisories for calm conditions', () => {
    expect(computeAdvisories(makeCurrent(), makeDaily())).toEqual([])
  })

  it('flags a thunderstorm as severe', () => {
    const advisories = computeAdvisories(makeCurrent({ weatherCode: 95 }), makeDaily())
    expect(advisories).toContainEqual({
      id: 'thunderstorm',
      severity: 'severe',
      message: 'Thunderstorms in the area',
    })
  })

  it('flags very high UV as moderate', () => {
    const advisories = computeAdvisories(makeCurrent(), makeDaily({ uvIndexMax: 9 }))
    expect(advisories.some((a) => a.id === 'uv' && a.severity === 'moderate')).toBe(true)
  })

  it('flags strong wind gusts as severe', () => {
    const advisories = computeAdvisories(makeCurrent({ windGustsKmh: 80 }), makeDaily())
    expect(advisories.some((a) => a.id === 'wind' && a.severity === 'severe')).toBe(true)
  })

  it('flags high rain probability as moderate', () => {
    const advisories = computeAdvisories(
      makeCurrent(),
      makeDaily({ precipitationProbabilityMaxPercent: 90 }),
    )
    expect(advisories.some((a) => a.id === 'precip-probability')).toBe(true)
  })
})
