export interface AirQualityLevel {
  labelKey: string
  adviceKey: string
  colorClass: string
}

/** US EPA AQI breakpoints (0-500 scale). Labels/advice are i18next keys
 * (`weather.aqiLevel.*`), resolved by the component that renders them. */
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
      colorClass: 'bg-success/15 text-success',
    }
  }
  if (usAqi <= 100) {
    return {
      labelKey: 'weather.aqiLevel.moderate.label',
      adviceKey: 'weather.aqiLevel.moderate.advice',
      colorClass: 'bg-amber-200/60 text-amber-700 dark:bg-amber-800/40 dark:text-amber-200',
    }
  }
  if (usAqi <= 150) {
    return {
      labelKey: 'weather.aqiLevel.sensitive.label',
      adviceKey: 'weather.aqiLevel.sensitive.advice',
      colorClass: 'bg-amber-300/70 text-amber-800 dark:bg-amber-700/50 dark:text-amber-100',
    }
  }
  if (usAqi <= 200) {
    return {
      labelKey: 'weather.aqiLevel.unhealthy.label',
      adviceKey: 'weather.aqiLevel.unhealthy.advice',
      colorClass: 'bg-danger/20 text-danger',
    }
  }
  if (usAqi <= 300) {
    return {
      labelKey: 'weather.aqiLevel.veryUnhealthy.label',
      adviceKey: 'weather.aqiLevel.veryUnhealthy.advice',
      colorClass: 'bg-danger/30 text-danger',
    }
  }
  return {
    labelKey: 'weather.aqiLevel.hazardous.label',
    adviceKey: 'weather.aqiLevel.hazardous.advice',
    colorClass: 'bg-danger/40 text-danger',
  }
}
