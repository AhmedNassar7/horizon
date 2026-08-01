import { describe, expect, it } from 'vitest'
import { formatDuration, formatHoursMinutes } from './duration'

describe('formatDuration', () => {
  it('formats minutes and seconds without hours', () => {
    expect(formatDuration(65_400)).toBe('1:05.4')
  })

  it('formats hours when present', () => {
    expect(formatDuration(3_661_000, { showTenths: false })).toBe('1:01:01')
  })

  it('formats zero', () => {
    expect(formatDuration(0)).toBe('0:00.0')
  })
})

describe('formatHoursMinutes', () => {
  it('formats a typical daylight span', () => {
    expect(formatHoursMinutes(13 * 3_600_000 + 35 * 60_000)).toBe('13h 35m')
  })

  it('omits hours when under an hour', () => {
    expect(formatHoursMinutes(45 * 60_000)).toBe('45m')
  })

  it('formats zero', () => {
    expect(formatHoursMinutes(0)).toBe('0m')
  })

  it('rounds to the nearest minute', () => {
    expect(formatHoursMinutes(59 * 60_000 + 45_000)).toBe('1h 0m')
  })

  it('clamps negative durations to zero', () => {
    expect(formatHoursMinutes(-1000)).toBe('0m')
  })
})
