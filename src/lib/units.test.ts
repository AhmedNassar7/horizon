import { describe, expect, it } from 'vitest'
import { celsiusTo, degreesToCompass, formatTemperature, formatWindSpeed, kmhTo } from './units'

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

describe('degreesToCompass', () => {
  it('maps degrees to the nearest compass direction', () => {
    expect(degreesToCompass(0)).toBe('N')
    expect(degreesToCompass(90)).toBe('E')
    expect(degreesToCompass(180)).toBe('S')
    expect(degreesToCompass(270)).toBe('W')
    expect(degreesToCompass(359)).toBe('N')
  })
})
