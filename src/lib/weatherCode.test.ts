import { describe, expect, it } from 'vitest'
import { getWeatherCodeInfo } from './weatherCode'

describe('getWeatherCodeInfo', () => {
  it('maps known WMO codes to a label key, theme, and severity', () => {
    expect(getWeatherCodeInfo(0)).toEqual({
      labelKey: 'weather.code.0',
      theme: 'clear',
      severity: 'calm',
    })
    expect(getWeatherCodeInfo(95)).toEqual({
      labelKey: 'weather.code.95',
      theme: 'thunderstorm',
      severity: 'severe',
    })
  })

  it('falls back gracefully for unknown or missing codes', () => {
    expect(getWeatherCodeInfo(9999).labelKey).toBe('weather.code.unknown')
    expect(getWeatherCodeInfo(null).labelKey).toBe('weather.code.unknown')
    expect(getWeatherCodeInfo(undefined).labelKey).toBe('weather.code.unknown')
  })
})
