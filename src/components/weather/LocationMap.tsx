import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Maximize2, CloudRain, Play, Pause } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { getTileConfig } from '@/lib/mapTiles'
import { getLatestFrames, buildRadarTileUrl, minutesSinceFrame } from '@/lib/radar'
import { useRadarFrames } from '@/hooks/useRadar'
import { reverseGeocode } from '@/api/location'
import { useLocationStore, MAX_SAVED_LOCATIONS } from '@/store/locationStore'
import type { ResolvedLocation } from '@/schemas/location'
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

/** Loose signature covering both react-i18next's `t` and a plain stand-in —
 * kept intentionally simple (rather than importing i18next's own generically
 * overloaded `TFunction`) since it's only ever used to pass a small,
 * concrete set of translated strings into the imperatively-mounted popup
 * subtree below. */
type TranslateFn = (key: string, options?: Record<string, unknown>) => string

const CITY_ZOOM = 11
const RADAR_ANIMATION_FRAME_COUNT = 6
const RADAR_ANIMATION_INTERVAL_MS = 500
const RADAR_ATTRIBUTION = 'Radar © <a href="https://www.rainviewer.com/">RainViewer</a>'

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

// Deliberately distinct from PIN_ICON above: a plain muted dot rather than a
// colored pin, so a place the user clicked to explore never reads as "the
// saved location this section is about".
const EXPLORE_MARKER_OPTIONS: L.CircleMarkerOptions = {
  radius: 8,
  color: '#ffffff',
  weight: 2,
  fillColor: '#64748b',
  fillOpacity: 0.9,
}

type ExploreStatus =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'full' }
  | { status: 'resolved'; location: ResolvedLocation }

/**
 * The content of the "explore anywhere" popup, mounted into a Leaflet popup's
 * DOM node via createRoot (see handleMapClick below) rather than built with
 * manual innerHTML strings — this app doesn't use react-leaflet, so this is
 * the standard way to get real, translated, stateful React content inside an
 * imperative Leaflet popup.
 */
function ExplorePopupContent({
  latitude,
  longitude,
  signal,
  t,
  onConfirm,
}: {
  latitude: number
  longitude: number
  signal: AbortSignal
  t: TranslateFn
  onConfirm: (location: ResolvedLocation) => 'ok' | 'full'
}) {
  const [state, setState] = useState<ExploreStatus>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    reverseGeocode(latitude, longitude, signal)
      .then((location) => {
        if (cancelled) return
        setState({ status: 'resolved', location })
      })
      .catch(() => {
        if (cancelled) return
        setState({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [latitude, longitude, signal])

  if (state.status === 'loading') {
    return <p className="text-muted-foreground m-0 text-sm">{t('weather.mapExploreLoading')}</p>
  }
  if (state.status === 'error') {
    return <p className="text-destructive m-0 text-sm">{t('weather.mapExploreError')}</p>
  }
  if (state.status === 'full') {
    return <p className="text-muted-foreground m-0 text-sm">{t('weather.mapExploreFull')}</p>
  }

  const displayName = [state.location.label, state.location.country].filter(Boolean).join(', ')

  return (
    <div className="flex flex-col gap-2">
      <p className="m-0 text-sm font-medium">{displayName}</p>
      <Button
        type="button"
        size="sm"
        onClick={() => {
          const result = onConfirm(state.location)
          if (result === 'full') setState({ status: 'full' })
        }}
      >
        {t('weather.mapExploreAdd')}
      </Button>
    </div>
  )
}

/**
 * A single imperative Leaflet map instance, bound to a container div. Used
 * twice by LocationMap below — once for the inline in-page map, once for the
 * larger map inside the expand dialog — each a fully independent instance
 * with its own lifecycle, rather than trying to move one map's DOM node
 * between containers (fragile with Leaflet). Both instances get the radar
 * overlay and click-to-explore behavior independently, since both are
 * self-contained here rather than lifted up to LocationMap — there's no
 * single "section header" shared by the inline map and the dialog map to
 * hang shared controls off, so each pane owns and renders its own small
 * radar toolbar as an overlay in its own top-right corner instead.
 */
function LeafletMapPane({
  latitude,
  longitude,
  name,
  isDark,
  heightClassName,
}: LocationMapProps & { isDark: boolean; heightClassName: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const radarLayerRef = useRef<L.TileLayer | null>(null)
  const exploreRef = useRef<{ marker: L.CircleMarker; cleanup: () => void } | null>(null)
  const handleMapClickRef = useRef<(event: L.LeafletMouseEvent) => void>(() => {})
  const [hasInteracted, setHasInteracted] = useState(false)
  const [radarOn, setRadarOn] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animFrameIndex, setAnimFrameIndex] = useState(0)

  const radarFramesQuery = useRadarFrames(radarOn)

  // Kept up to date every render (a "latest ref" pattern) so the map-click
  // listener attached once in the mount-once effect below never closes over
  // a stale `t`/`navigate`/store snapshot.
  handleMapClickRef.current = (event: L.LeafletMouseEvent) => {
    const map = mapRef.current
    if (!map) return

    const existing = exploreRef.current
    if (existing) {
      exploreRef.current = null
      existing.marker.off('popupclose')
      existing.cleanup()
      existing.marker.remove()
    }

    const { lat, lng } = event.latlng
    const controller = new AbortController()
    const marker = L.circleMarker([lat, lng], EXPLORE_MARKER_OPTIONS).addTo(map)
    const popupContainer = document.createElement('div')
    const root = createRoot(popupContainer)
    let cleanedUp = false
    const cleanup = () => {
      if (cleanedUp) return
      cleanedUp = true
      controller.abort()
      root.unmount()
    }

    marker.bindPopup(popupContainer, { closeButton: true, minWidth: 200, maxWidth: 260 })
    marker.on('popupclose', () => {
      cleanup()
      if (exploreRef.current?.marker === marker) exploreRef.current = null
      marker.remove()
    })
    exploreRef.current = { marker, cleanup }
    marker.openPopup()

    root.render(
      <ExplorePopupContent
        latitude={lat}
        longitude={lng}
        signal={controller.signal}
        t={t}
        onConfirm={(location) => {
          const { locations, addLocation } = useLocationStore.getState()
          if (locations.length >= MAX_SAVED_LOCATIONS) return 'full'
          const id = `${location.latitude.toFixed(2)},${location.longitude.toFixed(2)}`
          addLocation({
            id,
            name: location.label,
            country: location.country,
            admin1: location.region,
            latitude: location.latitude,
            longitude: location.longitude,
          })
          void navigate(`/location/${id}`)
          return 'ok'
        }}
      />,
    )
  }

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
    // Clicking the primary marker must only open its own popup, never also
    // trigger click-to-explore for the same click. Leaflet markers with a
    // bound popup already stop this DOM event from reaching the map's own
    // click handler internally (see Marker._onMouseClick), but that's
    // implicit and easy to regress across Leaflet versions — this is the
    // exact class of z-index/event-propagation bug the `isolate` comment
    // below already warns about, so make it explicit rather than relying on
    // undocumented default behavior.
    marker.on('click', (event) => {
      L.DomEvent.stopPropagation(event)
    })
    markerRef.current = marker

    map.on('click', (event: L.LeafletMouseEvent) => handleMapClickRef.current(event))

    let resizeObserver: ResizeObserver | undefined
    if (wrapperRef.current) {
      resizeObserver = new ResizeObserver(() => map.invalidateSize())
      resizeObserver.observe(wrapperRef.current)
    }

    return () => {
      resizeObserver?.disconnect()
      exploreRef.current?.cleanup()
      exploreRef.current = null
      map.remove()
      mapRef.current = null
      markerRef.current = null
      tileLayerRef.current = null
      radarLayerRef.current = null
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

  // Swap the active radar tile layer in place — the same remove-old/add-new
  // pattern as the base tile-layer theme swap above — whenever radar is
  // toggled on/off, new frame data arrives, or the animation advances to a
  // different frame. Leaflet's attribution control picks up/drops the
  // RainViewer credit automatically as this layer is added/removed, so there
  // is no manual attribution-string bookkeeping here.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (!radarOn || !radarFramesQuery.data) {
      const previous = radarLayerRef.current
      radarLayerRef.current = null
      previous?.remove()
      return
    }

    const frames = getLatestFrames(radarFramesQuery.data.frames, RADAR_ANIMATION_FRAME_COUNT)
    const frame = isAnimating ? frames[animFrameIndex] : frames.at(-1)
    if (!frame) return

    const nextLayer = L.tileLayer(buildRadarTileUrl(radarFramesQuery.data.host, frame), {
      opacity: 0.65,
      attribution: RADAR_ATTRIBUTION,
      zIndex: 450,
    })
    nextLayer.addTo(map)
    const previous = radarLayerRef.current
    radarLayerRef.current = nextLayer
    previous?.remove()
  }, [radarOn, radarFramesQuery.data, isAnimating, animFrameIndex])

  // Drives the play/pause animation by advancing animFrameIndex on a timer —
  // the effect above reacts to that index changing and does the actual
  // layer swap. Cleared on pause, on radar-off (both drop out of the guard
  // below) and on unmount, via the effect cleanup function.
  useEffect(() => {
    if (!radarOn || !isAnimating || !radarFramesQuery.data) return
    const frameCount = getLatestFrames(
      radarFramesQuery.data.frames,
      RADAR_ANIMATION_FRAME_COUNT,
    ).length
    if (frameCount === 0) return
    const interval = setInterval(() => {
      setAnimFrameIndex((index) => (index + 1) % frameCount)
    }, RADAR_ANIMATION_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [radarOn, isAnimating, radarFramesQuery.data])

  function handleRadarToggle() {
    setRadarOn((prev) => {
      const next = !prev
      if (!next) {
        setIsAnimating(false)
        setAnimFrameIndex(0)
      }
      return next
    })
  }

  function handleAnimationToggle() {
    setIsAnimating((prev) => {
      const next = !prev
      if (next) setAnimFrameIndex(0)
      return next
    })
  }

  const latestRadarFrame = radarFramesQuery.data?.frames.at(-1)
  const radarUpdatedMinutes = latestRadarFrame ? minutesSinceFrame(latestRadarFrame.time) : null

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
      <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1">
        <div className="bg-background/80 flex items-center gap-1 rounded-md p-1 shadow-sm backdrop-blur-sm">
          {radarOn && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={isAnimating ? t('weather.mapRadarPause') : t('weather.mapRadarPlay')}
              onClick={handleAnimationToggle}
            >
              {isAnimating ? (
                <Pause aria-hidden="true" className="size-4" />
              ) : (
                <Play aria-hidden="true" className="size-4" />
              )}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-pressed={radarOn}
            aria-label={t('weather.mapRadarToggle')}
            onClick={handleRadarToggle}
          >
            <CloudRain aria-hidden="true" className="size-4" />
          </Button>
        </div>
        {radarOn && !isAnimating && radarUpdatedMinutes !== null && (
          <span className="bg-background/80 text-muted-foreground rounded px-1.5 py-0.5 text-[11px] backdrop-blur-sm">
            {t('weather.mapRadarUpdated', { minutes: radarUpdatedMinutes })}
          </span>
        )}
      </div>
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
    <section
      aria-label={t('weather.map')}
      className="glass-card animate-in fade-in slide-in-from-bottom-2 ease-expo-out p-6 duration-300"
    >
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
