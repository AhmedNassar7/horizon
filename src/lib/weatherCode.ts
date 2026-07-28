/**
 * WMO weather interpretation codes (WMO code table 4677), as used by
 * Open-Meteo's `weather_code` field. https://open-meteo.com/en/docs
 */
export type WeatherTheme = 'clear' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm'

export type WeatherSeverity = 'calm' | 'moderate' | 'severe'

export interface WeatherCodeInfo {
  label: string
  theme: WeatherTheme
  severity: WeatherSeverity
}

export const WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: { label: 'Clear sky', theme: 'clear', severity: 'calm' },
  1: { label: 'Mainly clear', theme: 'clear', severity: 'calm' },
  2: { label: 'Partly cloudy', theme: 'cloudy', severity: 'calm' },
  3: { label: 'Overcast', theme: 'cloudy', severity: 'calm' },
  45: { label: 'Fog', theme: 'fog', severity: 'moderate' },
  48: { label: 'Depositing rime fog', theme: 'fog', severity: 'moderate' },
  51: { label: 'Light drizzle', theme: 'drizzle', severity: 'calm' },
  53: { label: 'Moderate drizzle', theme: 'drizzle', severity: 'calm' },
  55: { label: 'Dense drizzle', theme: 'drizzle', severity: 'moderate' },
  56: { label: 'Light freezing drizzle', theme: 'drizzle', severity: 'moderate' },
  57: { label: 'Dense freezing drizzle', theme: 'drizzle', severity: 'severe' },
  61: { label: 'Slight rain', theme: 'rain', severity: 'calm' },
  63: { label: 'Moderate rain', theme: 'rain', severity: 'moderate' },
  65: { label: 'Heavy rain', theme: 'rain', severity: 'severe' },
  66: { label: 'Light freezing rain', theme: 'rain', severity: 'moderate' },
  67: { label: 'Heavy freezing rain', theme: 'rain', severity: 'severe' },
  71: { label: 'Slight snow fall', theme: 'snow', severity: 'calm' },
  73: { label: 'Moderate snow fall', theme: 'snow', severity: 'moderate' },
  75: { label: 'Heavy snow fall', theme: 'snow', severity: 'severe' },
  77: { label: 'Snow grains', theme: 'snow', severity: 'moderate' },
  80: { label: 'Slight rain showers', theme: 'rain', severity: 'calm' },
  81: { label: 'Moderate rain showers', theme: 'rain', severity: 'moderate' },
  82: { label: 'Violent rain showers', theme: 'rain', severity: 'severe' },
  85: { label: 'Slight snow showers', theme: 'snow', severity: 'moderate' },
  86: { label: 'Heavy snow showers', theme: 'snow', severity: 'severe' },
  95: { label: 'Thunderstorm', theme: 'thunderstorm', severity: 'severe' },
  96: { label: 'Thunderstorm with slight hail', theme: 'thunderstorm', severity: 'severe' },
  99: { label: 'Thunderstorm with heavy hail', theme: 'thunderstorm', severity: 'severe' },
}

const FALLBACK: WeatherCodeInfo = { label: 'Unknown', theme: 'cloudy', severity: 'calm' }

export function getWeatherCodeInfo(code: number | null | undefined): WeatherCodeInfo {
  if (code == null) return FALLBACK
  return WEATHER_CODES[code] ?? FALLBACK
}
