import { describe, expect, it } from 'vitest'
import { buildViewerDayTimeline, isBusinessHour } from './meetingPlanner'

describe('buildViewerDayTimeline', () => {
  it('returns 24 hourly instants starting at local midnight', () => {
    const reference = new Date(2026, 6, 28, 15, 30)
    const timeline = buildViewerDayTimeline(reference)

    expect(timeline).toHaveLength(24)
    expect(timeline[0]?.getHours()).toBe(0)
    expect(timeline[23]?.getHours()).toBe(23)
    expect(timeline[1]!.getTime() - timeline[0]!.getTime()).toBe(3_600_000)
  })
})

describe('isBusinessHour', () => {
  it('treats 9am-5pm as business hours', () => {
    expect(isBusinessHour(9)).toBe(true)
    expect(isBusinessHour(16)).toBe(true)
    expect(isBusinessHour(17)).toBe(false)
    expect(isBusinessHour(8)).toBe(false)
    expect(isBusinessHour(0)).toBe(false)
  })
})
