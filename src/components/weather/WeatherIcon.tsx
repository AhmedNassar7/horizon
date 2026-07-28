import {
  Sun,
  Moon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  type LucideProps,
} from 'lucide-react'
import { getWeatherCodeInfo } from '@/lib/weatherCode'

const ICONS = {
  clear: { day: Sun, night: Moon },
  cloudy: { day: Cloud, night: Cloud },
  fog: { day: CloudFog, night: CloudFog },
  drizzle: { day: CloudDrizzle, night: CloudDrizzle },
  rain: { day: CloudRain, night: CloudRain },
  snow: { day: CloudSnow, night: CloudSnow },
  thunderstorm: { day: CloudLightning, night: CloudLightning },
} as const

export function WeatherIcon({
  code,
  isDay,
  ...props
}: { code: number | null; isDay: boolean } & LucideProps) {
  const { theme } = getWeatherCodeInfo(code)
  const Icon = ICONS[theme][isDay ? 'day' : 'night']
  return <Icon aria-hidden="true" {...props} />
}
