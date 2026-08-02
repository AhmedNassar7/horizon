import { fetchValidated } from '@/api/httpClient'
import { bigDataCloudLocationSchema, type ResolvedLocation } from '@/schemas/location'

const REVERSE_GEOCODE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client'

function toResolvedLocation(
  raw: import('@/schemas/location').BigDataCloudLocationResponse,
  fallback: { latitude: number; longitude: number },
): ResolvedLocation {
  return {
    latitude: raw.latitude ?? fallback.latitude,
    longitude: raw.longitude ?? fallback.longitude,
    label:
      raw.city || raw.locality || raw.principalSubdivision || raw.countryName || 'Unknown location',
    region: raw.principalSubdivision ?? null,
    country: raw.countryName ?? null,
    countryCode: raw.countryCode ?? null,
  }
}

/** Resolves a human-readable place name for coordinates the user picked
 * (e.g. via the browser's Geolocation API). */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<ResolvedLocation> {
  const url = new URL(REVERSE_GEOCODE_URL)
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set('localityLanguage', 'en')

  const raw = await fetchValidated(url, bigDataCloudLocationSchema, { signal })
  return toResolvedLocation(raw, { latitude, longitude })
}

/** Same BigDataCloud endpoint, called with no coordinates: it estimates the
 * caller's location from their IP address. Used as the fallback when the
 * browser Geolocation API is denied, unavailable, or times out. */
export async function geolocateByIp(): Promise<ResolvedLocation> {
  const url = new URL(REVERSE_GEOCODE_URL)
  url.searchParams.set('localityLanguage', 'en')

  const raw = await fetchValidated(url, bigDataCloudLocationSchema)
  return toResolvedLocation(raw, { latitude: raw.latitude ?? 0, longitude: raw.longitude ?? 0 })
}
