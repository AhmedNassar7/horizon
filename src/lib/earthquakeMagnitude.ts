export interface EarthquakeMagnitudeLevel {
  labelKey: string
  colorClass: string
  /** Raw hex string, not a Tailwind class — Leaflet circle markers are
   * drawn on a canvas/SVG layer and need a literal color value, they can't
   * consume CSS classes the way the rest of the UI does. */
  markerColor: string
  markerRadiusPx: number
}

/**
 * Buckets a Richter/moment magnitude into a severity tier, mirroring
 * `airQualityLevel.ts`'s shape and conventions exactly: labels are i18next
 * keys (`earthquake.magnitudeLevel.*`) resolved by the caller, and
 * colorClass always uses the solid success/warning/danger surface+text
 * pairs (pre-verified at WCAG AA contrast) rather than a translucent
 * overlay. markerColor/markerRadiusPx are the map-marker equivalents of
 * that same tier, in a form Leaflet can actually consume.
 */
export function getMagnitudeLevel(mag: number | null): EarthquakeMagnitudeLevel {
  if (mag == null) {
    return {
      labelKey: 'earthquake.magnitudeLevel.unknown.label',
      colorClass: 'bg-muted text-muted-foreground',
      markerColor: '#94a3b8',
      markerRadiusPx: 6,
    }
  }
  if (mag < 3) {
    return {
      labelKey: 'earthquake.magnitudeLevel.minor.label',
      colorClass: 'bg-success-surface text-success-text',
      markerColor: '#22c55e',
      markerRadiusPx: 6,
    }
  }
  if (mag < 5) {
    return {
      labelKey: 'earthquake.magnitudeLevel.light.label',
      colorClass: 'bg-warning-surface text-warning-text',
      markerColor: '#eab308',
      markerRadiusPx: 8,
    }
  }
  if (mag < 6) {
    return {
      labelKey: 'earthquake.magnitudeLevel.moderate.label',
      colorClass: 'bg-warning-surface text-warning-text',
      markerColor: '#f97316',
      markerRadiusPx: 11,
    }
  }
  if (mag < 7) {
    return {
      labelKey: 'earthquake.magnitudeLevel.strong.label',
      colorClass: 'bg-danger-surface text-danger-text',
      markerColor: '#ef4444',
      markerRadiusPx: 14,
    }
  }
  return {
    labelKey: 'earthquake.magnitudeLevel.major.label',
    colorClass: 'bg-danger-surface text-danger-text',
    markerColor: '#991b1b',
    markerRadiusPx: 18,
  }
}
