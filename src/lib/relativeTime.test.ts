import { describe, expect, it } from 'vitest'
import { formatTimeAgo } from './relativeTime'

const NOW = new Date('2026-08-04T12:00:00Z').getTime()

describe('formatTimeAgo', () => {
  it('renders "now" for anything under a minute old', () => {
    expect(formatTimeAgo(NOW, 'en', NOW)).toBe('now')
    expect(formatTimeAgo(NOW - 59_000, 'en', NOW)).toBe('now')
  })

  it('renders whole minutes once a minute has passed', () => {
    expect(formatTimeAgo(NOW - 60_000, 'en', NOW)).toBe('1 minute ago')
    expect(formatTimeAgo(NOW - 5 * 60_000, 'en', NOW)).toBe('5 minutes ago')
    expect(formatTimeAgo(NOW - (60 * 60_000 - 1), 'en', NOW)).toBe('59 minutes ago')
  })

  it('renders whole hours once an hour has passed', () => {
    expect(formatTimeAgo(NOW - 60 * 60_000, 'en', NOW)).toBe('1 hour ago')
    expect(formatTimeAgo(NOW - 5 * 60 * 60_000, 'en', NOW)).toBe('5 hours ago')
    expect(formatTimeAgo(NOW - (24 * 60 * 60_000 - 1), 'en', NOW)).toBe('23 hours ago')
  })

  it('renders whole days once a day has passed', () => {
    // `numeric: 'auto'` renders exactly -1 day as the idiomatic "yesterday"
    // rather than a literal "1 day ago".
    expect(formatTimeAgo(NOW - 24 * 60 * 60_000, 'en', NOW)).toBe('yesterday')
    expect(formatTimeAgo(NOW - 3 * 24 * 60 * 60_000, 'en', NOW)).toBe('3 days ago')
    expect(formatTimeAgo(NOW - (7 * 24 * 60 * 60_000 - 1), 'en', NOW)).toBe('6 days ago')
  })

  it('falls back to a plain date at a week or older', () => {
    const eightDaysAgo = NOW - 8 * 24 * 60 * 60_000
    const result = formatTimeAgo(eightDaysAgo, 'en', NOW)
    expect(result).not.toMatch(/ago$/)
    expect(result).toBe(
      new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(
        new Date(eightDaysAgo),
      ),
    )
  })

  it('defaults `now` to the current time when omitted', () => {
    expect(formatTimeAgo(Date.now())).toBe('now')
  })
})
