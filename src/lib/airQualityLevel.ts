export interface AirQualityLevel {
  labelKey: string
  adviceKey: string
  colorClass: string
}

/**
 * US EPA AQI breakpoints (0-500 scale). Labels/advice are i18next keys
 * (`weather.aqiLevel.*`), resolved by the component that renders them.
 *
 * colorClass always uses the solid success/warning/danger surface+text
 * pairs (never a translucent opacity-based overlay) — those pairs are
 * pre-verified at WCAG AA contrast, which a translucent badge can't
 * guarantee since it composites with whatever sits behind it.
 */
export function getAirQualityLevel(usAqi: number | null): AirQualityLevel {
  if (usAqi == null) {
    return {
      labelKey: 'weather.aqiLevel.unknown.label',
      adviceKey: 'weather.aqiLevel.unknown.advice',
      colorClass: 'bg-muted text-muted-foreground',
    }
  }
  if (usAqi <= 50) {
    return {
      labelKey: 'weather.aqiLevel.good.label',
      adviceKey: 'weather.aqiLevel.good.advice',
      colorClass: 'bg-success-surface text-success-text',
    }
  }
  if (usAqi <= 100) {
    return {
      labelKey: 'weather.aqiLevel.moderate.label',
      adviceKey: 'weather.aqiLevel.moderate.advice',
      colorClass: 'bg-warning-surface text-warning-text',
    }
  }
  if (usAqi <= 150) {
    return {
      labelKey: 'weather.aqiLevel.sensitive.label',
      adviceKey: 'weather.aqiLevel.sensitive.advice',
      colorClass: 'bg-warning-surface text-warning-text',
    }
  }
  if (usAqi <= 200) {
    return {
      labelKey: 'weather.aqiLevel.unhealthy.label',
      adviceKey: 'weather.aqiLevel.unhealthy.advice',
      colorClass: 'bg-danger-surface text-danger-text',
    }
  }
  if (usAqi <= 300) {
    return {
      labelKey: 'weather.aqiLevel.veryUnhealthy.label',
      adviceKey: 'weather.aqiLevel.veryUnhealthy.advice',
      colorClass: 'bg-danger-surface text-danger-text',
    }
  }
  return {
    labelKey: 'weather.aqiLevel.hazardous.label',
    adviceKey: 'weather.aqiLevel.hazardous.advice',
    colorClass: 'bg-danger-surface text-danger-text',
  }
}
