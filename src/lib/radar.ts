import type { RadarFrame } from '@/schemas/radar'

/** Returns up to the latest `count` frames (chronological order preserved)
 * from a RainViewer `past` array, which is ordered oldest-first. Used to
 * pick the frames shown by the radar play/pause animation. */
export function getLatestFrames(frames: RadarFrame[], count: number): RadarFrame[] {
  if (count <= 0) return []
  return frames.slice(Math.max(0, frames.length - count))
}

/** Builds a RainViewer tile URL for a single radar frame. `{z}/{x}/{y}` are
 * left as literal Leaflet placeholder tokens — Leaflet substitutes them
 * itself, so they must not be template-interpolated here. */
export function buildRadarTileUrl(host: string, frame: RadarFrame): string {
  return `${host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`
}

/** Minutes elapsed since a RainViewer frame's unix-seconds timestamp, for
 * the "Updated N min ago" caption. */
export function minutesSinceFrame(unixSeconds: number, now: number = Date.now()): number {
  return Math.max(0, Math.round((now - unixSeconds * 1000) / 60_000))
}
