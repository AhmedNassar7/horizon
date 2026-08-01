import type { WeatherTheme } from '@/lib/weatherCode'

/**
 * Background gradient classes per weather theme/time-of-day, shared between
 * the animated `WeatherBackground` (framer-motion) and its lightweight
 * `WeatherBackgroundFallback` (plain CSS, no animation library). Kept in its
 * own module — with no framer-motion import — so the fallback can render the
 * correct colors immediately without pulling in the animation chunk.
 */
export const WEATHER_BACKGROUND_GRADIENTS: Record<WeatherTheme, { day: string; night: string }> = {
  clear: {
    day: 'from-amber-100 via-ocean-50 to-ocean-100',
    night: 'from-ocean-800 via-ocean-900 to-ocean-950',
  },
  cloudy: {
    day: 'from-ocean-200 via-ocean-100 to-ocean-50',
    night: 'from-ocean-800 via-ocean-900 to-ocean-950',
  },
  fog: {
    day: 'from-ocean-200 via-ocean-100 to-ocean-100',
    night: 'from-ocean-800 via-ocean-900 to-ocean-900',
  },
  drizzle: {
    day: 'from-ocean-300 via-ocean-200 to-ocean-100',
    night: 'from-ocean-800 via-ocean-900 to-ocean-950',
  },
  rain: {
    day: 'from-ocean-400 via-ocean-300 to-ocean-100',
    night: 'from-ocean-700 via-ocean-800 to-ocean-950',
  },
  snow: {
    day: 'from-ocean-100 via-ocean-50 to-ocean-100',
    night: 'from-ocean-700 via-ocean-800 to-ocean-900',
  },
  thunderstorm: {
    day: 'from-ocean-600 via-ocean-400 to-amber-200',
    night: 'from-ocean-900 via-ocean-950 to-amber-950',
  },
}

export function getWeatherBackgroundGradient(theme: WeatherTheme, isDay: boolean): string {
  return WEATHER_BACKGROUND_GRADIENTS[theme][isDay ? 'day' : 'night']
}
