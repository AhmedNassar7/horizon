import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '@/hooks/useTheme'
import { getTileConfig } from '@/lib/mapTiles'
import { getMagnitudeLevel } from '@/lib/earthquakeMagnitude'
import { formatTimeAgo } from '@/lib/relativeTime'
import type { Earthquake } from '@/schemas/earthquake'

const WORLD_VIEW_CENTER: [number, number] = [20, 0]
const WORLD_VIEW_ZOOM = 2
const BOUNDS_PADDING = 0.1

/** Escapes a string for safe interpolation into a plain-string Leaflet
 * popup — `bindPopup(string)` renders its argument as raw HTML, and place
 * names/etc. here come from an external API. */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

/**
 * A Leaflet map that plots one circle marker per fetched earthquake, sized
 * and colored by magnitude (see earthquakeMagnitude.ts). Deliberately not a
 * reuse of LocationMap.tsx: that component is built around exactly one
 * persistent marker plus a createRoot-mounted interactive popup for the
 * "explore anywhere" flow, neither of which applies here — this map only
 * ever needs plain-string popups over a set of markers that changes
 * wholesale when the page's filters change.
 */
export function EarthquakeMap({ earthquakes }: { earthquakes: Earthquake[] }) {
  const { t, i18n } = useTranslation()
  const { isDark } = useTheme()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)

  // Create the map once on mount, clean it up on unmount. Theme and marker
  // updates are applied to this same instance by the effects below.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const map = L.map(container, {
      zoomAnimation: !prefersReducedMotion,
      markerZoomAnimation: !prefersReducedMotion,
      fadeAnimation: !prefersReducedMotion,
    }).setView(WORLD_VIEW_CENTER, WORLD_VIEW_ZOOM)
    mapRef.current = map
    markersLayerRef.current = L.layerGroup().addTo(map)

    let resizeObserver: ResizeObserver | undefined
    if (wrapperRef.current) {
      resizeObserver = new ResizeObserver(() => map.invalidateSize())
      resizeObserver.observe(wrapperRef.current)
    }

    return () => {
      resizeObserver?.disconnect()
      map.remove()
      mapRef.current = null
      tileLayerRef.current = null
      markersLayerRef.current = null
    }
    // Intentionally mount-once — see LocationMap.tsx for the same pattern.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Swap the active tile layer in place when the theme changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const config = getTileConfig(isDark)
    const nextLayer = L.tileLayer(config.url, { attribution: config.attribution, maxZoom: 19 })
    nextLayer.addTo(map)
    const previousLayer = tileLayerRef.current
    tileLayerRef.current = nextLayer
    previousLayer?.remove()
  }, [isDark])

  // Rebuild the marker set whenever the fetched earthquakes change (a new
  // filter selection replaces the data wholesale), then fit the view to
  // whatever is now on the map — or a sane world view if there's nothing.
  useEffect(() => {
    const map = mapRef.current
    const markersLayer = markersLayerRef.current
    if (!map || !markersLayer) return

    markersLayer.clearLayers()

    const markers = earthquakes.map((eq) => {
      const level = getMagnitudeLevel(eq.magnitude)
      const marker = L.circleMarker([eq.latitude, eq.longitude], {
        radius: level.markerRadiusPx,
        color: '#ffffff',
        weight: 1,
        fillColor: level.markerColor,
        fillOpacity: 0.85,
      })
      const magnitudeText = eq.magnitude != null ? eq.magnitude.toFixed(1) : '—'
      const placeText = escapeHtml(eq.place ?? t('earthquake.place'))
      const timeText = escapeHtml(formatTimeAgo(eq.timeMs, i18n.language))
      const linkText = escapeHtml(t('earthquake.viewOnUsgs'))
      marker.bindPopup(
        `<div class="text-sm"><p class="font-semibold">${magnitudeText} — ${placeText}</p><p class="text-xs text-muted-foreground">${timeText}</p><a href="${eq.url}" target="_blank" rel="noreferrer" class="text-xs underline">${linkText}</a></div>`,
      )
      markersLayer.addLayer(marker)
      return marker
    })

    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((marker) => marker.getLatLng()))
      map.fitBounds(bounds.pad(BOUNDS_PADDING))
    } else {
      map.setView(WORLD_VIEW_CENTER, WORLD_VIEW_ZOOM)
    }
  }, [earthquakes, t, i18n.language])

  return (
    <div ref={wrapperRef} className="relative h-[28rem] overflow-hidden rounded-lg">
      <div ref={containerRef} className="absolute inset-0 isolate" />
    </div>
  )
}
