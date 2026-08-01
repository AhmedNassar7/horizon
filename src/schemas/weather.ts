import { z } from 'zod'

const arrayField = z.array(z.number().nullable())

export const openMeteoForecastSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  utc_offset_seconds: z.number(),
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    apparent_temperature: z.number(),
    relative_humidity_2m: z.number(),
    wind_speed_10m: z.number(),
    wind_direction_10m: z.number(),
    wind_gusts_10m: z.number(),
    weather_code: z.number(),
    surface_pressure: z.number(),
    cloud_cover: z.number(),
    is_day: z.union([z.literal(0), z.literal(1)]),
    precipitation: z.number(),
    visibility: z.number(),
    uv_index: z.number(),
    dew_point_2m: z.number(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: arrayField,
    precipitation_probability: arrayField,
    weather_code: arrayField,
    is_day: arrayField,
    wind_speed_10m: arrayField,
  }),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: arrayField,
    temperature_2m_min: arrayField,
    precipitation_probability_max: arrayField,
    weather_code: arrayField,
    sunrise: z.array(z.string()),
    sunset: z.array(z.string()),
    uv_index_max: arrayField,
    wind_speed_10m_max: arrayField,
    wind_gusts_10m_max: arrayField,
  }),
})

export type OpenMeteoForecastResponse = z.infer<typeof openMeteoForecastSchema>

// --- Internal, provider-agnostic domain model ---
// UI code depends on these types only, never on a specific provider's response
// shape, so a second WeatherProvider could be added without touching the UI.

export interface CurrentConditions {
  time: string
  temperatureC: number
  apparentTemperatureC: number
  humidityPercent: number
  windSpeedKmh: number
  windDirectionDeg: number
  windGustsKmh: number
  weatherCode: number
  surfacePressureHpa: number
  cloudCoverPercent: number
  isDay: boolean
  precipitationMm: number
  visibilityMeters: number
  uvIndex: number
  dewPointC: number
}

export interface HourlyForecastPoint {
  time: string
  temperatureC: number | null
  precipitationProbabilityPercent: number | null
  weatherCode: number | null
  isDay: boolean
  windSpeedKmh: number | null
}

export interface DailyForecastPoint {
  date: string
  tempMaxC: number | null
  tempMinC: number | null
  precipitationProbabilityMaxPercent: number | null
  weatherCode: number | null
  sunrise: string
  sunset: string
  uvIndexMax: number | null
  windSpeedMaxKmh: number | null
  windGustsMaxKmh: number | null
}

export interface WeatherData {
  latitude: number
  longitude: number
  timezone: string
  utcOffsetSeconds: number
  current: CurrentConditions
  hourly: HourlyForecastPoint[]
  daily: DailyForecastPoint[]
}
