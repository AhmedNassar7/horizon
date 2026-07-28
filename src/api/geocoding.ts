import { fetchValidated } from '@/api/httpClient'
import { openMeteoGeocodingSchema, type CityResult } from '@/schemas/geocoding'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

export async function searchCities(query: string, language = 'en'): Promise<CityResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const url = new URL(GEOCODING_URL)
  url.searchParams.set('name', trimmed)
  url.searchParams.set('count', '10')
  url.searchParams.set('language', language)
  url.searchParams.set('format', 'json')

  const raw = await fetchValidated(url, openMeteoGeocodingSchema)

  return (raw.results ?? []).map((result) => ({
    id: String(result.id),
    name: result.name,
    country: result.country ?? null,
    admin1: result.admin1 ?? null,
    latitude: result.latitude,
    longitude: result.longitude,
    population: result.population ?? null,
  }))
}
