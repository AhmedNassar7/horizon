import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { getWeatherCodeInfo } from '@/lib/weatherCode'
import { getWeatherBackgroundGradient } from '@/lib/weatherBackgroundGradients'

export function WeatherBackground({ code, isDay }: { code: number | null; isDay: boolean }) {
  const { theme } = getWeatherCodeInfo(code)
  const prefersReducedMotion = useReducedMotion()
  const key = `${theme}-${isDay ? 'day' : 'night'}`
  const gradient = getWeatherBackgroundGradient(theme, isDay)

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
