import { useQuery } from '@tanstack/react-query'
import { weatherProvider } from '@/api/weatherProvider'
import { roundCoordinate } from '@/lib/geo'

export function useWeather(latitude: number, longitude: number, enabled = true) {
  const lat = roundCoordinate(latitude)
  const lon = roundCoordinate(longitude)

  return useQuery({
    queryKey: ['weather', lat, lon],
    queryFn: () => weatherProvider.getWeather(lat, lon),
    staleTime: 10 * 60 * 1000,
    enabled,
  })
}

export function useAirQuality(latitude: number, longitude: number, enabled = true) {
  const lat = roundCoordinate(latitude)
  const lon = roundCoordinate(longitude)

  return useQuery({
    queryKey: ['air-quality', lat, lon],
    queryFn: () => weatherProvider.getAirQuality(lat, lon),
    staleTime: 30 * 60 * 1000,
    enabled,
  })
}
