import { describe, expect, it } from 'vitest'
import { getVisibilityLevel } from './visibilityLevel'

describe('getVisibilityLevel', () => {
  it('categorizes excellent visibility at the boundary', () => {
    expect(getVisibilityLevel(10_000).labelKey).toBe('weather.visibilityLevel.excellent')
  })

  it('categorizes good visibility', () => {
    expect(getVisibilityLevel(7_000).labelKey).toBe('weather.visibilityLevel.good')
  })

  it('categorizes moderate visibility', () => {
    expect(getVisibilityLevel(3_000).labelKey).toBe('weather.visibilityLevel.moderate')
  })

  it('categorizes poor visibility', () => {
    expect(getVisibilityLevel(500).labelKey).toBe('weather.visibilityLevel.poor')
  })

  it('categorizes zero visibility as poor', () => {
    expect(getVisibilityLevel(0).labelKey).toBe('weather.visibilityLevel.poor')
  })

  it('handles missing data', () => {
    expect(getVisibilityLevel(null).labelKey).toBe('weather.visibilityLevel.unknown')
  })
})
