/** Rounds a coordinate to ~1.1km precision so tiny GPS jitter on a saved
 * location doesn't produce a slightly different TanStack Query cache key
 * (and therefore an unnecessary refetch) on every visit. */
export function roundCoordinate(value: number): number {
  return Math.round(value * 100) / 100
}

const EARTH_RADIUS_KM = 6371

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/** Great-circle distance between two coordinates in kilometers (standard
 * haversine formula) — used to show how far away a point feature (e.g. an
 * earthquake epicenter) is from a saved location, without pulling in a
 * mapping library just for arithmetic. */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}
