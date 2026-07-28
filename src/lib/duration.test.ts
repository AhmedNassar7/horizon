import { describe, expect, it } from 'vitest'
import { formatDuration } from './duration'

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
