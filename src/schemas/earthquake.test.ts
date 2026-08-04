import { describe, expect, it } from 'vitest'
import { mapFeatureToEarthquake, type EarthquakeFeature } from './earthquake'

function buildFeature(overrides: Partial<EarthquakeFeature['properties']> = {}): EarthquakeFeature {
  return {
    id: 'us7000abcd',
    properties: {
      mag: 5.4,
      place: '10km SW of Somewhere',
      time: 1_735_000_000_000,
      url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us7000abcd',
      tsunami: 0,
      sig: 460,
      magType: 'mww',
      ...overrides,
    },
    geometry: {
      type: 'Point',
      // [longitude, latitude, depthKm] — GeoJSON order.
      coordinates: [139.6503, 35.6762, 35.2],
    },
  }
}

describe('mapFeatureToEarthquake', () => {
  it('maps GeoJSON [longitude, latitude, depth] coordinates without transposing them', () => {
    const eq = mapFeatureToEarthquake(buildFeature())
    // longitude (139.65..) must land on `longitude`, latitude (35.67..) on
    // `latitude` — the single easiest mistake to make in this feature.
    expect(eq.longitude).toBeCloseTo(139.6503)
    expect(eq.latitude).toBeCloseTo(35.6762)
    expect(eq.depthKm).toBeCloseTo(35.2)
  })

  it('maps tsunami: 1 to tsunami: true, and 0 to false', () => {
    expect(mapFeatureToEarthquake(buildFeature({ tsunami: 1 })).tsunami).toBe(true)
    expect(mapFeatureToEarthquake(buildFeature({ tsunami: 0 })).tsunami).toBe(false)
  })

  it('maps the remaining scalar fields straight through', () => {
    const eq = mapFeatureToEarthquake(buildFeature())
    expect(eq.id).toBe('us7000abcd')
    expect(eq.magnitude).toBe(5.4)
    expect(eq.place).toBe('10km SW of Somewhere')
    expect(eq.timeMs).toBe(1_735_000_000_000)
    expect(eq.url).toBe('https://earthquake.usgs.gov/earthquakes/eventpage/us7000abcd')
    expect(eq.significance).toBe(460)
    expect(eq.magType).toBe('mww')
  })

  it('passes through null magnitude/place/magType', () => {
    const eq = mapFeatureToEarthquake(buildFeature({ mag: null, place: null, magType: null }))
    expect(eq.magnitude).toBeNull()
    expect(eq.place).toBeNull()
    expect(eq.magType).toBeNull()
  })
})
