import { fetchValidated } from '@/api/httpClient'
import { rainviewerSchema, type RadarFrame } from '@/schemas/radar'

const RAINVIEWER_URL = 'https://api.rainviewer.com/public/weather-maps.json'

/** Fetches RainViewer's free, keyless precipitation radar frame index.
 * `frames` is ordered oldest-first, matching the upstream API. */
export async function fetchRadarFrames(
  signal?: AbortSignal,
): Promise<{ host: string; frames: RadarFrame[] }> {
  const raw = await fetchValidated(RAINVIEWER_URL, rainviewerSchema, { signal })
  return { host: raw.host, frames: raw.radar.past }
}
