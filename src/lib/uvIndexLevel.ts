export interface UvIndexLevel {
  labelKey: string
  colorClass: string
}

/**
 * Standard WHO/EPA UV index bands. Labels are i18next keys
 * (`weather.uvLevel.*`), resolved by the component that renders them.
 *
 * colorClass uses the same solid success/warning/danger surface+text pairs
 * as `airQualityLevel.ts` for visual consistency across metric badges.
 */
export function getUvIndexLevel(uvIndex: number | null): UvIndexLevel {
  if (uvIndex == null) {
    return {
      labelKey: 'weather.uvLevel.unknown',
      colorClass: 'bg-muted text-muted-foreground',
    }
  }
  if (uvIndex <= 2) {
    return {
      labelKey: 'weather.uvLevel.low',
      colorClass: 'bg-success-surface text-success-text',
    }
  }
  if (uvIndex <= 5) {
    return {
      labelKey: 'weather.uvLevel.moderate',
      colorClass: 'bg-warning-surface text-warning-text',
    }
  }
  if (uvIndex <= 7) {
    return {
      labelKey: 'weather.uvLevel.high',
      colorClass: 'bg-warning-surface text-warning-text',
    }
  }
  if (uvIndex <= 10) {
    return {
      labelKey: 'weather.uvLevel.veryHigh',
      colorClass: 'bg-danger-surface text-danger-text',
    }
  }
  return {
    labelKey: 'weather.uvLevel.extreme',
    colorClass: 'bg-danger-surface text-danger-text',
  }
}
