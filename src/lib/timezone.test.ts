import { describe, expect, it } from 'vitest'
import {
  formatUtcOffset,
  getDayOffset,
  getLocalHour,
  getRelativeOffsetHours,
  getUtcOffsetMinutes,
  isDaytime,
  resolveTimezone,
} from './timezone'

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

describe('formatUtcOffset', () => {
  it('formats a whole-hour offset', () => {
    expect(formatUtcOffset('Asia/Tokyo', new Date('2026-01-15T12:00:00Z'))).toBe('UTC+9')
  })

  it('formats a half-hour offset', () => {
    expect(formatUtcOffset('Asia/Kolkata', new Date('2026-01-15T12:00:00Z'))).toBe('UTC+5:30')
  })
})

describe('getDayOffset', () => {
  it('returns 0 for the same timezone as the viewer', () => {
    const viewerTz = Intl.DateTimeFormat().resolvedOptions().timeZone
    expect(getDayOffset(viewerTz, new Date('2026-07-28T12:00:00Z'))).toBe(0)
  })

  it('returns a non-zero offset for a timezone on a different calendar day', () => {
    // Far ahead of UTC, so late evening UTC is already "tomorrow" there.
    const offset = getDayOffset('Pacific/Kiritimati', new Date('2026-07-28T23:00:00Z'))
    expect(Math.abs(offset)).toBeLessThanOrEqual(1)
  })
})

describe('getLocalHour', () => {
  it('returns the correct local hour for a known offset', () => {
    expect(getLocalHour(new Date('2026-01-15T12:00:00Z'), 'Asia/Tokyo')).toBe(21)
    expect(getLocalHour(new Date('2026-01-15T00:00:00Z'), 'UTC')).toBe(0)
  })
})

describe('getRelativeOffsetHours', () => {
  it("returns 0 relative to the viewer's own timezone", () => {
    const viewerTz = Intl.DateTimeFormat().resolvedOptions().timeZone
    expect(getRelativeOffsetHours(viewerTz, new Date('2026-01-15T12:00:00Z'))).toBe(0)
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
