import { describe, expect, it } from 'vitest'
import { haversineDistance, roundCoordinate } from './geo'

describe('haversineDistance', () => {
  it('returns 0 for the same coordinate', () => {
    expect(haversineDistance(51.5074, -0.1278, 51.5074, -0.1278)).toBeCloseTo(0, 5)
  })

  it('computes a known great-circle distance (London to Paris)', () => {
    // Widely cited reference value is ~344 km.
    const distance = haversineDistance(51.5074, -0.1278, 48.8566, 2.3522)
    expect(distance).toBeCloseTo(344, -1)
  })

  it('computes a known great-circle distance (London to New York)', () => {
    // Widely cited reference value is ~5570 km.
    const distance = haversineDistance(51.5074, -0.1278, 40.7128, -74.006)
    expect(distance).toBeCloseTo(5570, -2)
  })
})

describe('roundCoordinate', () => {
  it('rounds to two decimal places', () => {
    expect(roundCoordinate(51.50853)).toBeCloseTo(51.51, 5)
  })
})
