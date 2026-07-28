/**
 * WMO weather interpretation codes (WMO code table 4677), as used by
 * Open-Meteo's `weather_code` field. https://open-meteo.com/en/docs
 *
 * Labels are looked up via i18next (`weather.code.<code>`) rather than
 * stored here, so every supported language gets a real translated label
 * instead of falling back to English.
 */
export type WeatherTheme = 'clear' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm'

export type WeatherSeverity = 'calm' | 'moderate' | 'severe'

export interface WeatherCodeInfo {
  labelKey: string
  theme: WeatherTheme
  severity: WeatherSeverity
}

const WEATHER_CODES: Record<number, Omit<WeatherCodeInfo, 'labelKey'>> = {
  0: { theme: 'clear', severity: 'calm' },
  1: { theme: 'clear', severity: 'calm' },
  2: { theme: 'cloudy', severity: 'calm' },
  3: { theme: 'cloudy', severity: 'calm' },
  45: { theme: 'fog', severity: 'moderate' },
  48: { theme: 'fog', severity: 'moderate' },
  51: { theme: 'drizzle', severity: 'calm' },
  53: { theme: 'drizzle', severity: 'calm' },
  55: { theme: 'drizzle', severity: 'moderate' },
  56: { theme: 'drizzle', severity: 'moderate' },
  57: { theme: 'drizzle', severity: 'severe' },
  61: { theme: 'rain', severity: 'calm' },
  63: { theme: 'rain', severity: 'moderate' },
  65: { theme: 'rain', severity: 'severe' },
  66: { theme: 'rain', severity: 'moderate' },
  67: { theme: 'rain', severity: 'severe' },
  71: { theme: 'snow', severity: 'calm' },
  73: { theme: 'snow', severity: 'moderate' },
  75: { theme: 'snow', severity: 'severe' },
  77: { theme: 'snow', severity: 'moderate' },
  80: { theme: 'rain', severity: 'calm' },
  81: { theme: 'rain', severity: 'moderate' },
  82: { theme: 'rain', severity: 'severe' },
  85: { theme: 'snow', severity: 'moderate' },
  86: { theme: 'snow', severity: 'severe' },
  95: { theme: 'thunderstorm', severity: 'severe' },
  96: { theme: 'thunderstorm', severity: 'severe' },
  99: { theme: 'thunderstorm', severity: 'severe' },
}

const FALLBACK: Omit<WeatherCodeInfo, 'labelKey'> = { theme: 'cloudy', severity: 'calm' }

export function getWeatherCodeInfo(code: number | null | undefined): WeatherCodeInfo {
  const info = code != null ? (WEATHER_CODES[code] ?? FALLBACK) : FALLBACK
  const labelKey =
    code != null && WEATHER_CODES[code] ? `weather.code.${code}` : 'weather.code.unknown'
  return { ...info, labelKey }
}
