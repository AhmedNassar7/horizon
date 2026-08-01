export interface VisibilityLevel {
  labelKey: string
  colorClass: string
}

/**
 * Qualitative visibility bands, thresholded in meters (matching the domain
 * model's `visibilityMeters`) regardless of the display unit the user has
 * chosen — the underlying distance is what determines the band, not how
 * it's formatted. Labels are i18next keys (`weather.visibilityLevel.*`),
 * resolved by the component that renders them.
 *
 * colorClass uses the same solid success/warning/danger surface+text pairs
 * as `airQualityLevel.ts` for visual consistency across metric badges.
 */
export function getVisibilityLevel(meters: number | null): VisibilityLevel {
  if (meters == null) {
    return {
      labelKey: 'weather.visibilityLevel.unknown',
      colorClass: 'bg-muted text-muted-foreground',
    }
  }
  if (meters >= 10_000) {
    return {
      labelKey: 'weather.visibilityLevel.excellent',
      colorClass: 'bg-success-surface text-success-text',
    }
  }
  if (meters >= 5_000) {
    return {
      labelKey: 'weather.visibilityLevel.good',
      colorClass: 'bg-success-surface text-success-text',
    }
  }
  if (meters >= 2_000) {
    return {
      labelKey: 'weather.visibilityLevel.moderate',
      colorClass: 'bg-warning-surface text-warning-text',
    }
  }
  return {
    labelKey: 'weather.visibilityLevel.poor',
    colorClass: 'bg-danger-surface text-danger-text',
  }
}
