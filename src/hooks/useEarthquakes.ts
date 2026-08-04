import { useQuery } from '@tanstack/react-query'
import { fetchEarthquakes } from '@/api/earthquakes'
import { roundCoordinate } from '@/lib/geo'

// Exported so the Earthquakes page can tell whether a full page of results
// means "this is everything" or "there may be more — narrow your filters".
export const GLOBAL_LIMIT = 200
const NEARBY_LIMIT = 20
// Earthquake reporting doesn't need aggressive freshness (this is a
// read-only report, not early-warning infra) and there is deliberately no
// refetchInterval/polling here — see the feature's "no background infra"
// constraint.
const STALE_TIME_MS = 5 * 60 * 1000

/** Backs the global, filterable /earthquakes page. */
export function useGlobalEarthquakes(minMagnitude: number, windowMs: number) {
  return useQuery({
    queryKey: ['earthquakes', 'global', minMagnitude, windowMs],
    queryFn: ({ signal }) =>
      fetchEarthquakes({ minMagnitude, windowMs, limit: GLOBAL_LIMIT }, signal),
    staleTime: STALE_TIME_MS,
  })
}

/** Backs the per-location "nearby" dashboard card. Coordinates are rounded
 * before entering the query key, same as useWeather, so tiny GPS jitter on
 * a saved location doesn't produce spurious cache misses/refetches. */
export function useNearbyEarthquakes(
  latitude: number,
  longitude: number,
  radiusKm: number,
  minMagnitude: number,
  windowMs: number,
) {
  const lat = roundCoordinate(latitude)
  const lon = roundCoordinate(longitude)

  return useQuery({
    queryKey: ['earthquakes', 'nearby', lat, lon, radiusKm, minMagnitude, windowMs],
    queryFn: ({ signal }) =>
      fetchEarthquakes(
        { minMagnitude, windowMs, limit: NEARBY_LIMIT, latitude: lat, longitude: lon, radiusKm },
        signal,
      ),
    staleTime: STALE_TIME_MS,
  })
}
