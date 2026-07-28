import { describe, expect, it } from 'vitest'
import { getAirQualityLevel } from './airQualityLevel'

describe('getAirQualityLevel', () => {
  it('categorizes good air quality', () => {
    expect(getAirQualityLevel(25).labelKey).toBe('weather.aqiLevel.good.label')
  })

  it('categorizes moderate air quality', () => {
    expect(getAirQualityLevel(75).labelKey).toBe('weather.aqiLevel.moderate.label')
  })

  it('categorizes hazardous air quality', () => {
    expect(getAirQualityLevel(350).labelKey).toBe('weather.aqiLevel.hazardous.label')
  })

  it('handles missing data', () => {
    expect(getAirQualityLevel(null).labelKey).toBe('weather.aqiLevel.unknown.label')
  })
})
