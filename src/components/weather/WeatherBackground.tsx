import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { getWeatherCodeInfo, type WeatherTheme } from '@/lib/weatherCode'

const GRADIENTS: Record<WeatherTheme, { day: string; night: string }> = {
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

export function WeatherBackground({ code, isDay }: { code: number | null; isDay: boolean }) {
  const { theme } = getWeatherCodeInfo(code)
  const prefersReducedMotion = useReducedMotion()
  const key = `${theme}-${isDay ? 'day' : 'night'}`
  const gradient = GRADIENTS[theme][isDay ? 'day' : 'night']

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 1.2 }}
          className={`absolute inset-0 bg-gradient-to-b ${gradient}`}
        />
      </AnimatePresence>
    </div>
  )
}
