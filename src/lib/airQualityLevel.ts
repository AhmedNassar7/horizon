export interface AirQualityLevel {
  label: string
  healthAdvice: string
  colorClass: string
}

/** US EPA AQI breakpoints (0-500 scale). */
export function getAirQualityLevel(usAqi: number | null): AirQualityLevel {
  if (usAqi == null) {
    return {
      label: 'Unknown',
      healthAdvice: 'No air quality data available.',
      colorClass: 'bg-muted text-muted-foreground',
    }
  }
  if (usAqi <= 50) {
    return {
      label: 'Good',
      healthAdvice: 'Air quality is satisfactory for everyone.',
      colorClass: 'bg-success/15 text-success',
    }
  }
  if (usAqi <= 100) {
    return {
      label: 'Moderate',
      healthAdvice:
        'Unusually sensitive people should consider limiting prolonged outdoor exertion.',
      colorClass: 'bg-amber-200/60 text-amber-700 dark:bg-amber-800/40 dark:text-amber-200',
    }
  }
  if (usAqi <= 150) {
    return {
      label: 'Unhealthy for sensitive groups',
      healthAdvice:
        'People with respiratory or heart conditions, children, and older adults should reduce prolonged outdoor exertion.',
      colorClass: 'bg-amber-300/70 text-amber-800 dark:bg-amber-700/50 dark:text-amber-100',
    }
  }
  if (usAqi <= 200) {
    return {
      label: 'Unhealthy',
      healthAdvice: 'Everyone should reduce prolonged outdoor exertion.',
      colorClass: 'bg-danger/20 text-danger',
    }
  }
  if (usAqi <= 300) {
    return {
      label: 'Very unhealthy',
      healthAdvice: 'Everyone should avoid prolonged outdoor exertion.',
      colorClass: 'bg-danger/30 text-danger',
    }
  }
  return {
    label: 'Hazardous',
    healthAdvice: 'Everyone should avoid all outdoor exertion.',
    colorClass: 'bg-danger/40 text-danger',
  }
}
