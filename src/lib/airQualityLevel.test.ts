import { describe, expect, it } from 'vitest'
import { getAirQualityLevel } from './airQualityLevel'

describe('getAirQualityLevel', () => {
  it('categorizes good air quality', () => {
    expect(getAirQualityLevel(25).label).toBe('Good')
  })

  it('categorizes moderate air quality', () => {
    expect(getAirQualityLevel(75).label).toBe('Moderate')
  })

  it('categorizes hazardous air quality', () => {
    expect(getAirQualityLevel(350).label).toBe('Hazardous')
  })

  it('handles missing data', () => {
    expect(getAirQualityLevel(null).label).toBe('Unknown')
  })
})
