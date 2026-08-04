import { fetchValidated } from '@/api/httpClient'
import {
  earthquakeFeatureCollectionSchema,
  mapFeatureToEarthquake,
  type Earthquake,
} from '@/schemas/earthquake'

const USGS_EVENT_QUERY_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query'

export interface FetchEarthquakesParams {
  minMagnitude: number
  windowMs: number
  limit: number
  /** Supplying all three of latitude/longitude/radiusKm switches on USGS's
   * server-side radius filter (used by the "nearby" card); omitting them
   * fetches the unfiltered global feed (used by the browsable page). */
  latitude?: number
  longitude?: number
  radiusKm?: number
}

/**
 * Fetches earthquake events from USGS's free, keyless FDSN event query API.
 * One function serves both the global page (no lat/lon) and the
 * per-location "nearby" card (lat/lon + radius, filtered server-side)
 * rather than two near-duplicate functions — the only difference between
 * them is which query params get set.
 */
export async function fetchEarthquakes(
  params: FetchEarthquakesParams,
  signal?: AbortSignal,
): Promise<Earthquake[]> {
  const url = new URL(USGS_EVENT_QUERY_URL)
  url.searchParams.set('format', 'geojson')
  // Excludes quarry blasts, explosions, and other non-earthquake catalog
  // entries that USGS's event feed otherwise includes.
  url.searchParams.set('eventtype', 'earthquake')
  url.searchParams.set('orderby', 'time')
  url.searchParams.set('minmagnitude', String(params.minMagnitude))
  url.searchParams.set('starttime', new Date(Date.now() - params.windowMs).toISOString())
  url.searchParams.set('limit', String(params.limit))
  if (params.latitude != null && params.longitude != null && params.radiusKm != null) {
    url.searchParams.set('latitude', String(params.latitude))
    url.searchParams.set('longitude', String(params.longitude))
    url.searchParams.set('maxradiuskm', String(params.radiusKm))
  }

  const raw = await fetchValidated(url, earthquakeFeatureCollectionSchema, { signal })
  return raw.features.map(mapFeatureToEarthquake)
}
