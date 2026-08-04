import { describe, expect, it } from 'vitest'
import { getMagnitudeLevel } from './earthquakeMagnitude'

describe('getMagnitudeLevel', () => {
  it('returns unknown for null', () => {
    expect(getMagnitudeLevel(null).labelKey).toBe('earthquake.magnitudeLevel.unknown.label')
  })

  it('buckets minor (< 3)', () => {
    expect(getMagnitudeLevel(0).labelKey).toBe('earthquake.magnitudeLevel.minor.label')
    expect(getMagnitudeLevel(2.9).labelKey).toBe('earthquake.magnitudeLevel.minor.label')
  })

  it('buckets light (3 - 4.9)', () => {
    expect(getMagnitudeLevel(3).labelKey).toBe('earthquake.magnitudeLevel.light.label')
    expect(getMagnitudeLevel(4.9).labelKey).toBe('earthquake.magnitudeLevel.light.label')
  })

  it('buckets moderate (5 - 5.9)', () => {
    expect(getMagnitudeLevel(5).labelKey).toBe('earthquake.magnitudeLevel.moderate.label')
    expect(getMagnitudeLevel(5.9).labelKey).toBe('earthquake.magnitudeLevel.moderate.label')
  })

  it('buckets strong (6 - 6.9)', () => {
    expect(getMagnitudeLevel(6).labelKey).toBe('earthquake.magnitudeLevel.strong.label')
    expect(getMagnitudeLevel(6.9).labelKey).toBe('earthquake.magnitudeLevel.strong.label')
  })

  it('buckets major (>= 7)', () => {
    expect(getMagnitudeLevel(7).labelKey).toBe('earthquake.magnitudeLevel.major.label')
    expect(getMagnitudeLevel(9.1).labelKey).toBe('earthquake.magnitudeLevel.major.label')
  })

  it('scales markerRadiusPx with severity', () => {
    const radii = [0, 3, 5, 6, 7].map((mag) => getMagnitudeLevel(mag).markerRadiusPx)
    for (let i = 1; i < radii.length; i++) {
      expect(radii[i]).toBeGreaterThan(radii[i - 1]!)
    }
  })
})
