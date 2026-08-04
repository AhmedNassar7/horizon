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
      visibility: 24140,
      uv_index: 5,
      dew_point_2m: temperatureC - 6,
    },
    hourly: {
      time: hourly,
      temperature_2m: hourly.map((_, i) => temperatureC + (i % 5) - 2),
      precipitation_probability: hourly.map((_, i) => (i * 3) % 40),
      weather_code: hourly.map(() => weatherCode),
      is_day: hourly.map((_, i) => (i % 24 < 12 ? 1 : 0)),
      wind_speed_10m: hourly.map((_, i) => 8 + (i % 6)),
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

export interface FixtureEarthquake {
  id: string
  place: string
  magnitude: number
  /** Resolved to an absolute epoch-ms `time` when the response is built
   * (not at module load), mirroring isoHourStrings()'s pattern above — so
   * "N hours/days ago" assertions in specs stay stable regardless of when
   * the test suite actually runs. */
  ageMs: number
  latitude: number
  longitude: number
  depthKm: number
  tsunami: 0 | 1
  significance: number
  magType: string
}

// Deliberately within 300km of LONDON's coordinates (see the nearby-card's
// fixed radius in useEarthquakes.ts) so the dashboard-card spec has a
// deterministic nearby result to assert on.
export const NEAR_LONDON_EARTHQUAKE: FixtureEarthquake = {
  id: 'test-near-london',
  place: 'Kent, England',
  magnitude: 3.2,
  ageMs: 3 * 60 * 60 * 1000, // 3 hours ago
  latitude: 51.0,
  longitude: 0.5,
  depthKm: 10,
  tsunami: 0,
  significance: 200,
  magType: 'ml',
}

export const STRONG_EARTHQUAKE: FixtureEarthquake = {
  id: 'test-strong',
  place: '128km SSE of Tokyo, Japan',
  magnitude: 6.5,
  ageMs: 30 * 60 * 1000, // 30 minutes ago
  latitude: 34.9,
  longitude: 141.0,
  depthKm: 35,
  tsunami: 1,
  significance: 780,
  magType: 'mww',
}

export const MODERATE_EARTHQUAKE: FixtureEarthquake = {
  id: 'test-moderate',
  place: '64km W of Ridgecrest, CA',
  magnitude: 4.8,
  ageMs: 26 * 60 * 60 * 1000, // just over a day ago
  latitude: 35.6,
  longitude: -117.9,
  depthKm: 8,
  tsunami: 0,
  significance: 350,
  magType: 'ml',
}

function earthquakeFeature(eq: FixtureEarthquake) {
  return {
    id: eq.id,
    properties: {
      mag: eq.magnitude,
      place: eq.place,
      time: Date.now() - eq.ageMs,
      url: `https://earthquake.usgs.gov/earthquakes/eventpage/${eq.id}`,
      tsunami: eq.tsunami,
      sig: eq.significance,
      magType: eq.magType,
    },
    geometry: {
      type: 'Point',
      // [longitude, latitude, depthKm] — GeoJSON's coordinate order.
      coordinates: [eq.longitude, eq.latitude, eq.depthKm],
    },
  }
}

export function buildEarthquakeResponse(features: FixtureEarthquake[]) {
  return {
    type: 'FeatureCollection',
    features: features.map(earthquakeFeature),
  }
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

  // The nearby-card query includes `latitude`/`longitude` (see
  // useNearbyEarthquakes); the global page's query omits them entirely —
  // branch on that to decide which fixture set to serve, mirroring the
  // forecast/air-quality handlers' coordinate-based branching above.
  await page.route('https://earthquake.usgs.gov/fdsnws/event/1/query**', async (route) => {
    const url = new URL(route.request().url())
    const isNearby = url.searchParams.has('latitude') && url.searchParams.has('longitude')
    const features = isNearby
      ? [NEAR_LONDON_EARTHQUAKE]
      : [STRONG_EARTHQUAKE, NEAR_LONDON_EARTHQUAKE, MODERATE_EARTHQUAKE]
    await route.fulfill({ json: buildEarthquakeResponse(features) })
  })
}
