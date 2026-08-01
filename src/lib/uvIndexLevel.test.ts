import { describe, expect, it } from 'vitest'
import { getUvIndexLevel } from './uvIndexLevel'

describe('getUvIndexLevel', () => {
  it('categorizes low UV', () => {
    expect(getUvIndexLevel(1).labelKey).toBe('weather.uvLevel.low')
  })

  it('categorizes the low/moderate boundary as low', () => {
    expect(getUvIndexLevel(2).labelKey).toBe('weather.uvLevel.low')
  })

  it('categorizes moderate UV', () => {
    expect(getUvIndexLevel(4).labelKey).toBe('weather.uvLevel.moderate')
  })

  it('categorizes high UV', () => {
    expect(getUvIndexLevel(7).labelKey).toBe('weather.uvLevel.high')
  })

  it('categorizes very high UV', () => {
    expect(getUvIndexLevel(9).labelKey).toBe('weather.uvLevel.veryHigh')
  })

  it('categorizes extreme UV', () => {
    expect(getUvIndexLevel(12).labelKey).toBe('weather.uvLevel.extreme')
  })

  it('handles missing data', () => {
    expect(getUvIndexLevel(null).labelKey).toBe('weather.uvLevel.unknown')
  })
})
