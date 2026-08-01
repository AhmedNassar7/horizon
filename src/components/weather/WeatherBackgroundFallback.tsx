import { getWeatherCodeInfo } from '@/lib/weatherCode'
import { getWeatherBackgroundGradient } from '@/lib/weatherBackgroundGradients'

/**
 * Static stand-in for the animated `WeatherBackground` while its chunk
 * (which pulls in framer-motion — ~100kB gzipped, otherwise unused
 * anywhere else in the app) is still downloading. Renders the same
 * decorative gradient with the correct colors immediately, just without
 * the cross-fade transition between weather themes, so there's no visible
 * flash of an unstyled/blank background and no layout shift once the real
 * component takes over.
 */
export function WeatherBackgroundFallback({
  code,
  isDay,
}: {
  code: number | null
  isDay: boolean
}) {
  const { theme } = getWeatherCodeInfo(code)
  const gradient = getWeatherBackgroundGradient(theme, isDay)

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
    </div>
  )
}
