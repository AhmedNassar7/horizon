import { getWeatherCodeInfo } from '@/lib/weatherCode'
import type { CurrentConditions, DailyForecastPoint } from '@/schemas/weather'

export type AdvisorySeverity = 'moderate' | 'severe'

export interface Advisory {
  id: string
  severity: AdvisorySeverity
  messageKey: string
}

/**
 * Horizon has no access to an official government weather-alerts feed —
 * Open-Meteo doesn't provide one, and there's no free, global, keyless
 * equivalent. These are honestly-labeled advisories computed from
 * thresholds in the forecast data we already have, not a substitute for an
 * official warning. Messages are translation keys (`weather.advisory.*`),
 * resolved via i18next by the component that renders them.
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
      messageKey: 'weather.advisory.thunderstorm',
    })
  } else if (codeSeverity === 'severe') {
    advisories.push({
      id: 'severe-precip',
      severity: 'severe',
      messageKey: 'weather.advisory.severePrecip',
    })
  }

  if (current.windGustsKmh >= 70) {
    advisories.push({ id: 'wind', severity: 'severe', messageKey: 'weather.advisory.windSevere' })
  } else if (current.windGustsKmh >= 50) {
    advisories.push({
      id: 'wind',
      severity: 'moderate',
      messageKey: 'weather.advisory.windModerate',
    })
  }

  if (today?.uvIndexMax != null && today.uvIndexMax >= 8) {
    advisories.push({ id: 'uv', severity: 'moderate', messageKey: 'weather.advisory.uv' })
  }

  if (
    today?.precipitationProbabilityMaxPercent != null &&
    today.precipitationProbabilityMaxPercent >= 80
  ) {
    advisories.push({
      id: 'precip-probability',
      severity: 'moderate',
      messageKey: 'weather.advisory.precipProbability',
    })
  }

  return advisories
}
