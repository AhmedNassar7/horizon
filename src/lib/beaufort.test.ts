import { describe, expect, it } from 'vitest'
import { getBeaufortScale } from './beaufort'

describe('getBeaufortScale', () => {
  it('categorizes calm as force 0', () => {
    expect(getBeaufortScale(0).force).toBe(0)
  })

  it('categorizes a light breeze as force 2', () => {
    expect(getBeaufortScale(8).force).toBe(2)
  })

  it('categorizes right at a boundary as the lower force', () => {
    // Force 3 (gentle breeze) upper bound is 19 km/h — 19 itself belongs to force 4.
    expect(getBeaufortScale(19).force).toBe(4)
    expect(getBeaufortScale(18).force).toBe(3)
  })

  it('categorizes a strong hurricane-force wind as force 12', () => {
    expect(getBeaufortScale(150).force).toBe(12)
  })

  it('treats null as calm', () => {
    expect(getBeaufortScale(null).force).toBe(0)
  })

  it('treats negative values as calm', () => {
    expect(getBeaufortScale(-5).force).toBe(0)
  })

  it('returns a matching labelKey for the force', () => {
    expect(getBeaufortScale(8).labelKey).toBe('weather.beaufort.2')
  })
})
