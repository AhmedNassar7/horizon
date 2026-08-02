import { describe, expect, it } from 'vitest'
import { buildRadarTileUrl, getLatestFrames, minutesSinceFrame } from './radar'
import type { RadarFrame } from '@/schemas/radar'

const frames: RadarFrame[] = [
  { time: 1, path: '/v2/radar/a' },
  { time: 2, path: '/v2/radar/b' },
  { time: 3, path: '/v2/radar/c' },
  { time: 4, path: '/v2/radar/d' },
]

describe('getLatestFrames', () => {
  it('returns the last N frames in chronological order', () => {
    expect(getLatestFrames(frames, 2)).toEqual([
      { time: 3, path: '/v2/radar/c' },
      { time: 4, path: '/v2/radar/d' },
    ])
  })

  it('returns all frames when count exceeds the array length', () => {
    expect(getLatestFrames(frames, 10)).toEqual(frames)
  })

  it('returns an empty array for a non-positive count', () => {
    expect(getLatestFrames(frames, 0)).toEqual([])
    expect(getLatestFrames(frames, -1)).toEqual([])
  })
})

describe('buildRadarTileUrl', () => {
  it('builds a tile URL leaving the z/x/y placeholders literal for Leaflet', () => {
    const url = buildRadarTileUrl('https://tilecache.rainviewer.com', {
      time: 1785669600,
      path: '/v2/radar/b06f4d6bc0f0',
    })
    expect(url).toBe(
      'https://tilecache.rainviewer.com/v2/radar/b06f4d6bc0f0/256/{z}/{x}/{y}/2/1_1.png',
    )
  })
})

describe('minutesSinceFrame', () => {
  it('computes elapsed minutes from a unix-seconds timestamp', () => {
    const nowMs = 1_000_000_000_000
    const frameUnixSeconds = nowMs / 1000 - 5 * 60
    expect(minutesSinceFrame(frameUnixSeconds, nowMs)).toBe(5)
  })

  it('never returns a negative number for a frame timestamped after "now"', () => {
    const nowMs = 1_000_000_000_000
    const frameUnixSeconds = nowMs / 1000 + 60
    expect(minutesSinceFrame(frameUnixSeconds, nowMs)).toBe(0)
  })
})
