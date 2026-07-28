import { getWeatherCodeInfo } from '@/lib/weatherCode'
import type { CurrentConditions, DailyForecastPoint } from '@/schemas/weather'

export type AdvisorySeverity = 'moderate' | 'severe'

export interface Advisory {
  id: string
  severity: AdvisorySeverity
  message: string
}

/**
 * Horizon has no access to an official government weather-alerts feed —
 * Open-Meteo doesn't provide one, and there's no free, global, keyless
 * equivalent. These are honestly-labeled advisories computed from
 * thresholds in the forecast data we already have, not a substitute for an
 * official warning.
 */
export function computeAdvisories(
  current: CurrentConditions,
  today: DailyForecastPoint | undefined,
): Advisory[] {
  const advisories: Advisory[] = []
  const { severity: codeSeverity, theme } = getWeatherCodeInfo(current.weatherCode)

  if (theme === 'thunderstorm') {
    advisories.push({
      id: 'thunderstorm',
      severity: 'severe',
      message: 'Thunderstorms in the area',
    })
  } else if (codeSeverity === 'severe') {
    advisories.push({
      id: 'severe-precip',
      severity: 'severe',
      message: 'Heavy precipitation expected',
    })
  }

  if (current.windGustsKmh >= 70) {
    advisories.push({ id: 'wind', severity: 'severe', message: 'Strong wind gusts expected' })
  } else if (current.windGustsKmh >= 50) {
    advisories.push({
      id: 'wind',
      severity: 'moderate',
      message: 'Breezy conditions with gusty wind',
    })
  }

  if (today?.uvIndexMax != null && today.uvIndexMax >= 8) {
    advisories.push({
      id: 'uv',
      severity: 'moderate',
      message: 'Very high UV — limit sun exposure',
    })
  }

  if (
    today?.precipitationProbabilityMaxPercent != null &&
    today.precipitationProbabilityMaxPercent >= 80
  ) {
    advisories.push({
      id: 'precip-probability',
      severity: 'moderate',
      message: 'High chance of rain today',
    })
  }

  return advisories
}
