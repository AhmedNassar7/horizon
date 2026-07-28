import { describe, expect, it } from 'vitest'
import { getWeatherCodeInfo } from './weatherCode'

describe('getWeatherCodeInfo', () => {
  it('maps known WMO codes to a label, theme, and severity', () => {
    expect(getWeatherCodeInfo(0)).toEqual({ label: 'Clear sky', theme: 'clear', severity: 'calm' })
    expect(getWeatherCodeInfo(95)).toEqual({
      label: 'Thunderstorm',
      theme: 'thunderstorm',
      severity: 'severe',
    })
  })

  it('falls back gracefully for unknown or missing codes', () => {
    expect(getWeatherCodeInfo(9999).label).toBe('Unknown')
    expect(getWeatherCodeInfo(null).label).toBe('Unknown')
    expect(getWeatherCodeInfo(undefined).label).toBe('Unknown')
  })
})
