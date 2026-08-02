export interface TileConfig {
  url: string
  attribution: string
}

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

/**
 * CARTO's free, keyless "basemaps" tiles — no signup/API key required,
 * unlike Mapbox/MapTiler, which would violate this app's no-secrets/no-
 * accounts constraint. Plain OpenStreetMap tiles are white-heavy and look
 * broken in dark mode, so light/dark variants are picked based on the
 * app's current theme instead of always using one basemap.
 */
export function getTileConfig(isDark: boolean): TileConfig {
  return {
    url: isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: ATTRIBUTION,
  }
}
