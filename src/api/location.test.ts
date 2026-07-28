import { describe, expect, it } from 'vitest'
import { geolocateByIp, reverseGeocode } from './location'

describe('reverseGeocode', () => {
  it('resolves a human-readable label for coordinates', async () => {
    const location = await reverseGeocode(51.5, -0.11)
    expect(location.label).toBe('London')
    expect(location.country).toBe('United Kingdom')
  })
})

describe('geolocateByIp', () => {
  it('resolves a location without providing coordinates', async () => {
    const location = await geolocateByIp()
    expect(location.label).toBe('London')
  })
})
