import { z } from 'zod'

/**
 * USGS's GeoJSON FeatureCollection has many more properties per feature
 * (felt reports, alert level, network codes, ids...) than we use. We only
 * assert the shape of the fields we actually render and let everything
 * else pass through untouched via `.loose()`, matching the rainviewer
 * schema's precedent.
 */
export const earthquakeFeatureCollectionSchema = z
  .object({
    features: z.array(
      z
        .object({
          id: z.string(),
          properties: z
            .object({
              mag: z.number().nullable(),
              place: z.string().nullable(),
              // Epoch milliseconds, per the USGS API — not seconds.
              time: z.number(),
              url: z.string(),
              tsunami: z.union([z.literal(0), z.literal(1)]),
              sig: z.number(),
              magType: z.string().nullable(),
            })
            .loose(),
          geometry: z.object({
            type: z.literal('Point'),
            // [longitude, latitude, depthKm] — GeoJSON's coordinate order,
            // NOT [latitude, longitude]. Do not transpose this.
            coordinates: z.tuple([z.number(), z.number(), z.number()]),
          }),
        })
        .loose(),
    ),
  })
  .loose()

export type EarthquakeFeatureCollection = z.infer<typeof earthquakeFeatureCollectionSchema>
export type EarthquakeFeature = EarthquakeFeatureCollection['features'][number]

export interface Earthquake {
  id: string
  magnitude: number | null
  place: string | null
  timeMs: number
  url: string
  tsunami: boolean
  significance: number
  magType: string | null
  latitude: number
  longitude: number
  depthKm: number | null
}

/** Pure raw-feature-to-domain mapper, kept exported so the
 * longitude/latitude coordinate order (the single easiest thing to get
 * backwards in this whole feature) is unit-testable in isolation. */
export function mapFeatureToEarthquake(feature: EarthquakeFeature): Earthquake {
  const [longitude, latitude, depthKm] = feature.geometry.coordinates
  return {
    id: feature.id,
    magnitude: feature.properties.mag,
    place: feature.properties.place,
    timeMs: feature.properties.time,
    url: feature.properties.url,
    tsunami: feature.properties.tsunami === 1,
    significance: feature.properties.sig,
    magType: feature.properties.magType,
    latitude,
    longitude,
    depthKm,
  }
}
