import { describe, expect, it } from 'vitest'
import { getUtcOffsetMinutes, isDaytime, resolveTimezone } from './timezone'

describe('resolveTimezone', () => {
  it('resolves the IANA timezone for known coordinates', () => {
    expect(resolveTimezone(51.5074, -0.1278)).toBe('Europe/London')
    expect(resolveTimezone(35.6762, 139.6503)).toBe('Asia/Tokyo')
  })
})

describe('getUtcOffsetMinutes', () => {
  it('returns 0 for UTC', () => {
    expect(getUtcOffsetMinutes('UTC', new Date('2026-01-15T12:00:00Z'))).toBe(0)
  })

  it('returns a negative offset for US timezones', () => {
    expect(getUtcOffsetMinutes('America/New_York', new Date('2026-01-15T12:00:00Z'))).toBeLessThan(
      0,
    )
  })
})

describe('isDaytime', () => {
  it('returns true between sunrise and sunset', () => {
    const sunrise = new Date('2026-07-28T05:00:00Z')
    const sunset = new Date('2026-07-28T21:00:00Z')
    expect(isDaytime(new Date('2026-07-28T12:00:00Z'), sunrise, sunset)).toBe(true)
    expect(isDaytime(new Date('2026-07-28T23:00:00Z'), sunrise, sunset)).toBe(false)
  })
})
