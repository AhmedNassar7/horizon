import type { WeatherData } from '@/schemas/weather'
import type { AirQuality } from '@/schemas/airQuality'

export interface WeatherProvider {
  id: string
  getWeather(latitude: number, longitude: number): Promise<WeatherData>
  getAirQuality(latitude: number, longitude: number): Promise<AirQuality>
}

/**
 * Adapter registry: the app depends on this single `weatherProvider`
 * binding, never on `openMeteoProvider` directly. Swapping or adding a
 * fallback data source later means implementing `WeatherProvider` and
 * changing the assignment below — no UI or hook code needs to change.
 */
import { openMeteoProvider } from '@/api/providers/openMeteo'

export const weatherProvider: WeatherProvider = openMeteoProvider
