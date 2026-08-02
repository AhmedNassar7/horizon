import { z } from 'zod'

/**
 * RainViewer's public weather-maps.json response has many more fields
 * (nowcast, satellite, version, generated…) than we use. We only assert the
 * shape of the `radar.past` frames we actually render and let everything
 * else pass through untouched.
 */
export const rainviewerSchema = z
  .object({
    host: z.string(),
    radar: z.object({
      past: z.array(z.object({ time: z.number(), path: z.string() })),
    }),
  })
  .loose()

export type RainviewerResponse = z.infer<typeof rainviewerSchema>

export interface RadarFrame {
  time: number
  path: string
}
