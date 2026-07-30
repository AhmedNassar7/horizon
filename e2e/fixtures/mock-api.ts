import type { Page } from '@playwright/test'

/**
 * Horizon talks directly to Open-Meteo (and BigDataCloud, for IP-based
 * geolocation) from the browser — there's no backend to stand in front of.
 * For e2e we intercept those calls with Playwright route mocking by
 * default: it keeps the suite fast and fully deterministic (fixed
 * temperatures/conditions to assert on) and, crucially, lets it run in
 * network-restricted environments. This sandbox has no outbound access to
 * open-meteo.com or bigdatacloud.net at all (verified via curl — every
 * request times out with no route to host), so mocking isn't optional here.
 *
 * Set E2E_REAL_API=1 to skip installing these mocks and hit the live APIs
 * instead, in an environment that does have network access — the specs
 * that call `installApiMocks()` check this flag themselves and become
 * pure real-network integration tests when it's set, using real city names
 * that exist in Open-Meteo's actual geocoding index.
 */
export const REAL_API = process.env.E2E_REAL_API === '1'

export interface FixtureCity {
  id: number
  name: string
  country: string
  admin1: string
  latitude: number
  longitude: number
  timezone: string
  /** Deliberately distinct per city so specs can assert on specific,
   * unambiguous values rather than "some number rendered somewhere". */
  temperatureC: number
  weatherCode: number
}

export const LONDON: FixtureCity = {
  id: 2643743,
  name: 'London',
  country: 'United Kingdom',
  admin1: 'England',
  latitude: 51.50853,
  longitude: -0.12574,
  timezone: 'Europe/London',
  temperatureC: 14,
  weatherCode: 3, // Overcast
}

export const TOKYO: FixtureCity = {
  id: 1850147,
  name: 'Tokyo',
  country: 'Japan',
  admin1: 'Tokyo',
  latitude: 35.6895,
  longitude: 139.69171,
  timezone: 'Asia/Tokyo',
  temperatureC: 27,
  weatherCode: 1, // Mainly clear
}

export const NEW_YORK: FixtureCity = {
  id: 5128581,
  name: 'New York',
  country: 'United States',
  admin1: 'New York',
  latitude: 40.71427,
  longitude: -74.00597,
  timezone: 'America/New_York',
  temperatureC: 22,
  weatherCode: 0, // Clear sky
}

const CITY_INDEX = [LONDON, TOKYO, NEW_YORK]

function geocodingResultFor(city: FixtureCity) {
  return {
    id: city.id,
    name: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
    country: city.country,
    admin1: city.admin1,
    timezone: city.timezone,
    population: 1_000_000,
  }
}

function isoHourStrings(count: number): string[] {
  const start = new Date()
  start.setMinutes(0, 0, 0)
  return Array.from({ length: count }, (_, i) => {
    const t = new Date(start)
    t.setHours(t.getHours() + i)
    return t.toISOString().slice(0, 16)
  })
}

function isoDateStrings(count: number): string[] {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function buildForecastResponse(city: FixtureCity) {
  const { temperatureC, weatherCode } = city
  const hourly = isoHourStrings(48)
  const daily = isoDateStrings(8)

  return {
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
    utc_offset_seconds: 0,
    current: {
      time: hourly[0],
      temperature_2m: temperatureC,
      apparent_temperature: temperatureC - 1,
      relative_humidity_2m: 58,
      wind_speed_10m: 14,
      wind_direction_10m: 200,
      wind_gusts_10m: 22,
      weather_code: weatherCode,
      surface_pressure: 1015,
      cloud_cover: 20,
      is_day: 1,
      precipitation: 0,
    },
    hourly: {
      time: hourly,
      temperature_2m: hourly.map((_, i) => temperatureC + (i % 5) - 2),
      precipitation_probability: hourly.map((_, i) => (i * 3) % 40),
      weather_code: hourly.map(() => weatherCode),
      is_day: hourly.map((_, i) => (i % 24 < 12 ? 1 : 0)),
    },
    daily: {
      time: daily,
      temperature_2m_max: daily.map(() => temperatureC + 3),
      temperature_2m_min: daily.map(() => temperatureC - 4),
      precipitation_probability_max: daily.map(() => 10),
      weather_code: daily.map(() => weatherCode),
      sunrise: daily.map((d) => `${d}T06:00`),
      sunset: daily.map((d) => `${d}T20:00`),
      uv_index_max: daily.map(() => 5),
      wind_speed_10m_max: daily.map(() => 18),
      wind_gusts_10m_max: daily.map(() => 30),
    },
  }
}

function buildAirQualityResponse(city: FixtureCity) {
  return {
    latitude: city.latitude,
    longitude: city.longitude,
    current: {
      time: isoHourStrings(1)[0],
      pm2_5: 8.4,
      pm10: 12.1,
      us_aqi: 32,
      european_aqi: 18,
    },
  }
}

function findCityForCoords(latitude: string | null, longitude: string | null): FixtureCity {
  const lat = Number(latitude)
  const lon = Number(longitude)
  return CITY_INDEX.reduce((best, city) => {
    const d = Math.hypot(city.latitude - lat, city.longitude - lon)
    const bestD = Math.hypot(best.latitude - lat, best.longitude - lon)
    return d < bestD ? city : best
  }, CITY_INDEX[0]!)
}

/**
 * Installs route interception for every external API Horizon talks to
 * (Open-Meteo geocoding/forecast/air-quality, BigDataCloud reverse geocode).
 * Call before navigating. Forecast/air-quality responses are keyed off
 * whichever known FixtureCity's coordinates the request is closest to, so
 * any location added via the mocked geocoding search resolves to a
 * matching, deterministic forecast automatically.
 */
export async function installApiMocks(page: Page) {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    const url = new URL(route.request().url())
    const query = (url.searchParams.get('name') ?? '').toLowerCase()
    const results = CITY_INDEX.filter((city) => city.name.toLowerCase().startsWith(query)).map(
      geocodingResultFor,
    )
    await route.fulfill({ json: { results } })
  })

  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    const url = new URL(route.request().url())
    const city = findCityForCoords(
      url.searchParams.get('latitude'),
      url.searchParams.get('longitude'),
    )
    await route.fulfill({ json: buildForecastResponse(city) })
  })

  await page.route('https://air-quality-api.open-meteo.com/v1/air-quality**', async (route) => {
    const url = new URL(route.request().url())
    const city = findCityForCoords(
      url.searchParams.get('latitude'),
      url.searchParams.get('longitude'),
    )
    await route.fulfill({ json: buildAirQualityResponse(city) })
  })

  // IP/reverse geolocation isn't under test here — every spec seeds a
  // starting location directly (see seed.ts) so this endpoint is only ever
  // hit by Home's silent background auto-locate-on-empty-state attempt.
  // Fail it fast and deterministically rather than let it hang or flake.
  await page.route('https://api.bigdatacloud.net/**', (route) => route.abort('failed'))
}
