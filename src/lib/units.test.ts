import { describe, expect, it } from 'vitest'
import {
  celsiusTo,
  degreesToCompass,
  formatTemperature,
  formatVisibility,
  formatWindSpeed,
  kmhTo,
} from './units'

describe('temperature conversion', () => {
  it('passes celsius through unchanged', () => {
    expect(celsiusTo('celsius', 21.4)).toBeCloseTo(21.4)
  })

  it('converts celsius to fahrenheit', () => {
    expect(celsiusTo('fahrenheit', 0)).toBeCloseTo(32)
    expect(celsiusTo('fahrenheit', 100)).toBeCloseTo(212)
  })

  it('formats and rounds for display', () => {
    expect(formatTemperature(21.4, 'celsius')).toBe('21°')
    expect(formatTemperature(0, 'fahrenheit')).toBe('32°')
    expect(formatTemperature(null, 'celsius')).toBe('—')
  })
})

describe('wind speed conversion', () => {
  it('converts km/h to mph and knots', () => {
    expect(kmhTo('mph', 100)).toBeCloseTo(62.1371, 2)
    expect(kmhTo('kn', 100)).toBeCloseTo(53.9957, 2)
  })

  it('formats with the correct unit label', () => {
    expect(formatWindSpeed(20, 'kmh')).toBe('20 km/h')
    expect(formatWindSpeed(null, 'mph')).toBe('—')
  })
})

describe('formatVisibility', () => {
  it('formats in kilometers by default', () => {
    expect(formatVisibility(10_000, 'kmh')).toBe('10 km')
  })

  it('formats in kilometers for knots too', () => {
    expect(formatVisibility(10_000, 'kn')).toBe('10 km')
  })

  it('formats in miles when the wind unit is mph', () => {
    expect(formatVisibility(16_093.44, 'mph')).toBe('10 mi')
  })

  it('keeps one decimal place under 10 units', () => {
    expect(formatVisibility(4_800, 'kmh')).toBe('4.8 km')
  })

  it('handles missing data', () => {
    expect(formatVisibility(null, 'kmh')).toBe('—')
  })
})

describe('degreesToCompass', () => {
  it('maps degrees to the nearest compass direction', () => {
    expect(degreesToCompass(0)).toBe('N')
    expect(degreesToCompass(90)).toBe('E')
    expect(degreesToCompass(180)).toBe('S')
    expect(degreesToCompass(270)).toBe('W')
    expect(degreesToCompass(359)).toBe('N')
  })
})
