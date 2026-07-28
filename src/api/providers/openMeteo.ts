import { fetchValidated } from '@/api/httpClient'
import { openMeteoForecastSchema, type WeatherData } from '@/schemas/weather'
import { openMeteoAirQualitySchema, type AirQuality } from '@/schemas/airQuality'
import type { WeatherProvider } from '@/api/weatherProvider'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'weather_code',
  'surface_pressure',
  'cloud_cover',
  'is_day',
  'precipitation',
].join(',')

const HOURLY_FIELDS = [
  'temperature_2m',
  'precipitation_probability',
  'weather_code',
  'is_day',
].join(',')

const DAILY_FIELDS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'weather_code',
  'sunrise',
  'sunset',
  'uv_index_max',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
].join(',')

async function getWeather(latitude: number, longitude: number): Promise<WeatherData> {
  const url = new URL(FORECAST_URL)
  url.searchParams.set('latitude', latitude.toFixed(4))
  url.searchParams.set('longitude', longitude.toFixed(4))
  url.searchParams.set('current', CURRENT_FIELDS)
  url.searchParams.set('hourly', HOURLY_FIELDS)
  url.searchParams.set('daily', DAILY_FIELDS)
  url.searchParams.set('forecast_days', '8')
  url.searchParams.set('forecast_hours', '48')
  url.searchParams.set('timezone', 'auto')

  const raw = await fetchValidated(url, openMeteoForecastSchema)

  return {
    latitude: raw.latitude,
    longitude: raw.longitude,
    timezone: raw.timezone,
    utcOffsetSeconds: raw.utc_offset_seconds,
    current: {
      time: raw.current.time,
      temperatureC: raw.current.temperature_2m,
      apparentTemperatureC: raw.current.apparent_temperature,
      humidityPercent: raw.current.relative_humidity_2m,
      windSpeedKmh: raw.current.wind_speed_10m,
      windDirectionDeg: raw.current.wind_direction_10m,
      windGustsKmh: raw.current.wind_gusts_10m,
      weatherCode: raw.current.weather_code,
      surfacePressureHpa: raw.current.surface_pressure,
      cloudCoverPercent: raw.current.cloud_cover,
      isDay: raw.current.is_day === 1,
      precipitationMm: raw.current.precipitation,
    },
    hourly: raw.hourly.time.map((time, i) => ({
      time,
      temperatureC: raw.hourly.temperature_2m[i] ?? null,
      precipitationProbabilityPercent: raw.hourly.precipitation_probability[i] ?? null,
      weatherCode: raw.hourly.weather_code[i] ?? null,
      isDay: raw.hourly.is_day[i] === 1,
    })),
    daily: raw.daily.time.map((date, i) => ({
      date,
      tempMaxC: raw.daily.temperature_2m_max[i] ?? null,
      tempMinC: raw.daily.temperature_2m_min[i] ?? null,
      precipitationProbabilityMaxPercent: raw.daily.precipitation_probability_max[i] ?? null,
      weatherCode: raw.daily.weather_code[i] ?? null,
      sunrise: raw.daily.sunrise[i] ?? raw.current.time,
      sunset: raw.daily.sunset[i] ?? raw.current.time,
      uvIndexMax: raw.daily.uv_index_max[i] ?? null,
      windSpeedMaxKmh: raw.daily.wind_speed_10m_max[i] ?? null,
      windGustsMaxKmh: raw.daily.wind_gusts_10m_max[i] ?? null,
    })),
  }
}

async function getAirQuality(latitude: number, longitude: number): Promise<AirQuality> {
  const url = new URL(AIR_QUALITY_URL)
  url.searchParams.set('latitude', latitude.toFixed(4))
  url.searchParams.set('longitude', longitude.toFixed(4))
  url.searchParams.set('current', 'pm2_5,pm10,us_aqi,european_aqi')

  const raw = await fetchValidated(url, openMeteoAirQualitySchema)

  return {
    time: raw.current.time,
    pm2_5: raw.current.pm2_5,
    pm10: raw.current.pm10,
    usAqi: raw.current.us_aqi,
    europeanAqi: raw.current.european_aqi,
  }
}

export const openMeteoProvider: WeatherProvider = {
  id: 'open-meteo',
  getWeather,
  getAirQuality,
}
