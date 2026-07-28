import { useQuery } from '@tanstack/react-query'
import { geolocateByIp, reverseGeocode } from '@/api/location'
import type { ResolvedLocation } from '@/schemas/location'

function getBrowserPosition(timeoutMs = 8000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported in this browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: timeoutMs,
      maximumAge: 5 * 60 * 1000,
    })
  })
}

/** Resolves the user's current location: browser Geolocation API first
 * (most accurate, requires permission), falling back to IP-based
 * geolocation via BigDataCloud if permission is denied, unavailable, or
 * the request times out — so the app always has a starting location. */
async function resolveCurrentLocation(): Promise<ResolvedLocation> {
  try {
    const position = await getBrowserPosition()
    return await reverseGeocode(position.coords.latitude, position.coords.longitude)
  } catch {
    return geolocateByIp()
  }
}

export function useGeolocation(enabled: boolean) {
  return useQuery({
    queryKey: ['geolocation'],
    queryFn: resolveCurrentLocation,
    enabled,
    staleTime: Infinity,
    retry: false,
  })
}
