import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Maximize2 } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { getTileConfig } from '@/lib/mapTiles'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface LocationMapProps {
  latitude: number
  longitude: number
  name: string
}

const CITY_ZOOM = 11

// Leaflet's built-in L.Icon.Default references marker image assets by a
// relative path baked in at build time, which breaks under Vite bundling (a
// well-known Leaflet+bundler footgun). A custom divIcon with an inline SVG
// sidesteps that entirely, and — using `currentColor` + the `text-primary`
// utility, same as every icon elsewhere in this app — stays theme-consistent
// instead of hardcoding a hex value.
const PIN_ICON = L.divIcon({
  html: `<div class="text-primary" style="line-height:0">
    <svg width="28" height="40" viewBox="0 0 24 36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12zm0 16.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
    </svg>
  </div>`,
  className: '',
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -36],
})

/**
 * A single imperative Leaflet map instance, bound to a container div. Used
 * twice by LocationMap below — once for the inline in-page map, once for the
 * larger map inside the expand dialog — each a fully independent instance
 * with its own lifecycle, rather than trying to move one map's DOM node
 * between containers (fragile with Leaflet).
 */
function LeafletMapPane({
  latitude,
  longitude,
  name,
  isDark,
  heightClassName,
}: LocationMapProps & { isDark: boolean; heightClassName: string }) {
  const { t } = useTranslation()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Create the map once on mount, clean it up on unmount. Coordinate updates
  // and theme (tile layer) updates are handled by the effects below, against
  // this same instance, rather than tearing it down and recreating it.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const map = L.map(container, {
      scrollWheelZoom: false,
      zoomAnimation: !prefersReducedMotion,
      markerZoomAnimation: !prefersReducedMotion,
      fadeAnimation: !prefersReducedMotion,
    }).setView([latitude, longitude], CITY_ZOOM)
    mapRef.current = map

    const marker = L.marker([latitude, longitude], { icon: PIN_ICON }).addTo(map)
    marker.bindPopup(name)
    markerRef.current = marker

    let resizeObserver: ResizeObserver | undefined
    if (wrapperRef.current) {
      resizeObserver = new ResizeObserver(() => map.invalidateSize())
      resizeObserver.observe(wrapperRef.current)
    }

    return () => {
      resizeObserver?.disconnect()
      map.remove()
      mapRef.current = null
      markerRef.current = null
      tileLayerRef.current = null
    }
    // Intentionally mount-once: latitude/longitude/name changes are applied
    // to the existing instance by the effects below rather than remounting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Location.tsx is a single route component reused across /location/:slug
  // navigations — React Router doesn't remount it just because the URL
  // param changed, so this component receives new coordinates as props
  // without unmounting. Re-center the existing map/marker instead of
  // requiring a remount.
  useEffect(() => {
    const map = mapRef.current
    const marker = markerRef.current
    if (!map || !marker) return
    map.setView([latitude, longitude], CITY_ZOOM)
    marker.setLatLng([latitude, longitude])
  }, [latitude, longitude])

  useEffect(() => {
    const marker = markerRef.current
    marker?.setPopupContent(name)
  }, [name])

  // Swap the active tile layer in place when the theme changes, rather than
  // recreating the whole map instance.
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

  return (
    <div ref={wrapperRef} className={`relative overflow-hidden rounded-lg ${heightClassName}`}>
      {/* `isolate` is required, not decorative: Leaflet's internal panes set
          their own z-index up to 800 (see leaflet.css), and without this
          container establishing its own stacking context those panes would
          be compared directly against the hint button's z-10 below — and
          win, letting every Leaflet pane (tiles, markers, zoom controls)
          paint and receive clicks above the "click to interact" overlay
          instead of being blocked by it. */}
      <div ref={containerRef} className="absolute inset-0 isolate" />
      {!hasInteracted && (
        <button
          type="button"
          className="text-foreground bg-background/40 absolute inset-0 z-10 flex items-center justify-center px-4 text-center text-sm font-medium backdrop-blur-sm"
          onClick={() => {
            setHasInteracted(true)
            mapRef.current?.scrollWheelZoom.enable()
          }}
        >
          {t('weather.mapInteractHint')}
        </button>
      )}
    </div>
  )
}

export function LocationMap({ latitude, longitude, name }: LocationMapProps) {
  const { t } = useTranslation()
  const { isDark } = useTheme()

  return (
    <section aria-label={t('weather.map')} className="glass-card p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">{t('weather.map')}</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={t('weather.mapExpand')}>
              <Maximize2 aria-hidden="true" className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {name} — {t('weather.map')}
              </DialogTitle>
            </DialogHeader>
            <LeafletMapPane
              latitude={latitude}
              longitude={longitude}
              name={name}
              isDark={isDark}
              heightClassName="h-[60vh]"
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-4">
        <LeafletMapPane
          latitude={latitude}
          longitude={longitude}
          name={name}
          isDark={isDark}
          heightClassName="h-64"
        />
      </div>
    </section>
  )
}
