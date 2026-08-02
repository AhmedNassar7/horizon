import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { geoOrthographic, geoPath, geoGraticule, type GeoProjection } from 'd3-geo'
import { drag as d3drag, type D3DragEvent } from 'd3-drag'
import { zoom as d3zoom, type D3ZoomEvent } from 'd3-zoom'
import { select } from 'd3-selection'
import { timer as d3timer, type Timer } from 'd3-timer'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import landTopology from 'world-atlas/land-110m.json'
import { useTheme } from '@/hooks/useTheme'
import { reverseGeocode } from '@/api/location'
import { useLocationStore, MAX_SAVED_LOCATIONS } from '@/store/locationStore'
import type { ResolvedLocation } from '@/schemas/location'
import { Button } from '@/components/ui/button'
import {
  applyRotationDelta,
  dragDeltaToRotationDelta,
  isPointVisible,
  type Rotation,
} from '@/lib/globeMath'

// world-atlas's JSON ships as a plain, untyped structure once imported —
// this cast just tells TypeScript it matches the TopoJSON spec's shape (one
// "land" object, a GeometryCollection of every landmass) rather than
// re-deriving the whole topology's types from the raw JSON literal.
const LAND_TOPOLOGY = landTopology as unknown as Topology<{ land: GeometryCollection }>

// Computed once at module scope — this is the single (Multi)Polygon feature
// for every landmass on Earth, not per-country borders. Reused by every
// LocationGlobe render/instance; there's only ever one country-borders-free
// feature to turn into a `<path d>`, so there's no reason to recompute it
// per mount.
const LAND_FEATURE = feature(LAND_TOPOLOGY, LAND_TOPOLOGY.objects.land)
const GRATICULE = geoGraticule()()

const VIEWBOX_SIZE = 500
const CENTER = VIEWBOX_SIZE / 2
const BASE_RADIUS = 210
const MIN_SCALE_FACTOR = 0.6
const MAX_SCALE_FACTOR = 2
const MARKER_RADIUS = 7

// A gentle default tilt (rather than looking straight down the equator/prime
// meridian) so the globe reads as three-dimensional even before the user
// touches it. Purely cosmetic — everything below works from any starting
// rotation.
const INITIAL_ROTATION: Rotation = [-20, -15, 0]

// One full rotation roughly every 100 seconds: slow and ambient, meant to
// hint "this is alive and can be spun" without ever being dizzying or
// competing for attention with the rest of the empty state.
const IDLE_ROTATION_DEG_PER_MS = 360 / 100_000

// Below this total drag distance (in the SVG's own viewBox units), a
// pointer-down/pointer-up pair is treated as a click-to-pick rather than a
// rotate — distinguished by tracking cumulative movement across d3-drag's
// own "drag" events rather than relying on the browser's native click event
// (which a real drag can also trigger on mouseup over the same element).
const CLICK_DISTANCE_THRESHOLD = 4

type PickState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'full' }
  | { status: 'resolved'; location: ResolvedLocation }

interface PickedPoint {
  latitude: number
  longitude: number
}

/**
 * The floating card shown once the user clicks a point on the globe — the
 * SVG-only equivalent of LocationMap's "explore anywhere" Leaflet popup, and
 * deliberately reusing that same four-state shape and i18n copy (loading /
 * resolved / error / full) since the semantics are identical: an arbitrary
 * picked coordinate awaiting confirmation before it becomes a real saved
 * location.
 */
function GlobePickCard({ latitude, longitude }: PickedPoint) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [state, setState] = useState<PickState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })
    reverseGeocode(latitude, longitude, controller.signal)
      .then((location) => setState({ status: 'resolved', location }))
      .catch(() => {
        if (controller.signal.aborted) return
        setState({ status: 'error' })
      })
    return () => controller.abort()
  }, [latitude, longitude])

  function handleConfirm(location: ResolvedLocation) {
    const { locations, addLocation } = useLocationStore.getState()
    if (locations.length >= MAX_SAVED_LOCATIONS) {
      setState({ status: 'full' })
      return
    }
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
  }

  return (
    <div className="glass-card mt-4 flex w-full max-w-[420px] flex-col gap-2 p-4 text-center sm:max-w-[480px]">
      {state.status === 'loading' && (
        <p className="text-muted-foreground m-0 text-sm">{t('weather.mapExploreLoading')}</p>
      )}
      {state.status === 'error' && (
        <p className="text-destructive m-0 text-sm">{t('weather.mapExploreError')}</p>
      )}
      {state.status === 'full' && (
        <p className="text-muted-foreground m-0 text-sm">{t('weather.mapExploreFull')}</p>
      )}
      {state.status === 'resolved' && (
        <>
          <p className="m-0 text-sm font-medium">
            {[state.location.label, state.location.country].filter(Boolean).join(', ')}
          </p>
          <Button type="button" size="sm" onClick={() => handleConfirm(state.location)}>
            {t('weather.mapExploreAdd')}
          </Button>
        </>
      )}
    </div>
  )
}

export function LocationGlobe() {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const svgRef = useRef<SVGSVGElement>(null)
  const sphereElRef = useRef<SVGCircleElement>(null)
  const graticuleElRef = useRef<SVGPathElement>(null)
  const landElRef = useRef<SVGPathElement>(null)
  const markerElRef = useRef<SVGCircleElement>(null)

  const projectionRef = useRef<GeoProjection | null>(null)
  const redrawRef = useRef<() => void>(() => {})
  const stopIdleRef = useRef<() => void>(() => {})
  const startIdleRef = useRef<() => void>(() => {})
  const pickedPointRef = useRef<PickedPoint | null>(null)

  const [pickedPoint, setPickedPoint] = useState<PickedPoint | null>(null)

  // Kept in sync so the imperative redraw loop (defined once, in the
  // mount-once effect below) always sees the latest picked point — without
  // this, the marker would be stuck showing whatever was picked (or
  // nothing) at the moment the effect first ran.
  useEffect(() => {
    pickedPointRef.current = pickedPoint
    redrawRef.current()
  }, [pickedPoint])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const projection = geoOrthographic()
      .translate([CENTER, CENTER])
      .scale(BASE_RADIUS)
      .rotate([...INITIAL_ROTATION])
      .clipAngle(90)
    projectionRef.current = projection
    const pathGenerator = geoPath(projection)

    function redraw() {
      const landD = pathGenerator(LAND_FEATURE) ?? ''
      const graticuleD = pathGenerator(GRATICULE) ?? ''
      landElRef.current?.setAttribute('d', landD)
      graticuleElRef.current?.setAttribute('d', graticuleD)
      sphereElRef.current?.setAttribute('r', String(projection.scale()))

      const picked = pickedPointRef.current
      const markerEl = markerElRef.current
      if (!markerEl) return
      if (!picked) {
        markerEl.style.display = 'none'
        return
      }
      const rotation = projection.rotate() as Rotation
      const point: [number, number] = [picked.longitude, picked.latitude]
      const projected = isPointVisible(rotation, point) ? projection(point) : null
      if (!projected) {
        markerEl.style.display = 'none'
        return
      }
      markerEl.style.display = ''
      markerEl.setAttribute('cx', String(projected[0]))
      markerEl.setAttribute('cy', String(projected[1]))
    }
    redrawRef.current = redraw
    redraw()

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let idleTimer: Timer | undefined

    function stopIdle() {
      idleTimer?.stop()
      idleTimer = undefined
    }
    function startIdle() {
      if (prefersReducedMotion) return
      stopIdle()
      let lastElapsed = 0
      idleTimer = d3timer((elapsed) => {
        const dt = elapsed - lastElapsed
        lastElapsed = elapsed
        const current = projection.rotate() as Rotation
        projection.rotate([current[0] + dt * IDLE_ROTATION_DEG_PER_MS, current[1], current[2]])
        redraw()
      })
    }
    stopIdleRef.current = stopIdle
    startIdleRef.current = startIdle
    startIdle()

    function handlePick(x: number, y: number) {
      const inverted = projection.invert?.([x, y])
      if (!inverted) return // off the visible sphere entirely — not a real pick
      const [longitude, latitude] = inverted
      const next = { latitude, longitude }
      pickedPointRef.current = next
      setPickedPoint(next)
      redraw()
    }

    let dragDistance = 0
    const dragBehavior = d3drag<SVGSVGElement, unknown>()
      .container(svg)
      .on('start', () => {
        dragDistance = 0
        stopIdle()
      })
      .on('drag', (event: D3DragEvent<SVGSVGElement, unknown, unknown>) => {
        dragDistance += Math.hypot(event.dx, event.dy)
        const { deltaLambda, deltaPhi } = dragDeltaToRotationDelta(
          event.dx,
          event.dy,
          projection.scale(),
        )
        projection.rotate([
          ...applyRotationDelta(projection.rotate() as Rotation, deltaLambda, deltaPhi),
        ])
        redraw()
      })
      .on('end', (event: D3DragEvent<SVGSVGElement, unknown, unknown>) => {
        if (dragDistance < CLICK_DISTANCE_THRESHOLD) {
          handlePick(event.x, event.y)
        }
        startIdle()
      })

    // Wheel and two-finger pinch scale the globe; a plain mouse-button drag
    // or single-finger touch is left entirely to d3-drag above (rotate),
    // rather than d3-zoom's own default panning behavior, which would
    // otherwise fight the same gesture for the same purpose.
    const zoomBehavior = d3zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_SCALE_FACTOR, MAX_SCALE_FACTOR])
      .filter((event: Event) => {
        if (event.type === 'wheel') return true
        const touches = (event as TouchEvent).touches
        return touches ? touches.length > 1 : false
      })
      .on('start', () => stopIdle())
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        projection.scale(BASE_RADIUS * event.transform.k)
        redraw()
      })
      .on('end', () => startIdle())

    const selection = select(svg)
    selection.call(dragBehavior)
    selection.call(zoomBehavior)

    return () => {
      stopIdle()
      selection.on('.drag', null)
      selection.on('.zoom', null)
    }
  }, [])

  function handleKeyDown(event: React.KeyboardEvent<SVGSVGElement>) {
    const projection = projectionRef.current
    const step = 6
    let deltaLambda = 0
    let deltaPhi = 0
    switch (event.key) {
      case 'ArrowLeft':
        deltaLambda = -step
        break
      case 'ArrowRight':
        deltaLambda = step
        break
      case 'ArrowUp':
        deltaPhi = step
        break
      case 'ArrowDown':
        deltaPhi = -step
        break
      default:
        return
    }
    if (!projection) return
    event.preventDefault()
    stopIdleRef.current()
    projection.rotate([
      ...applyRotationDelta(projection.rotate() as Rotation, deltaLambda, deltaPhi),
    ])
    redrawRef.current()
    startIdleRef.current()
  }

  const oceanClassName = isDark ? 'fill-ocean-900' : 'fill-ocean-100'
  const landClassName = isDark ? 'fill-amber-700' : 'fill-amber-400'
  const graticuleClassName = isDark ? 'stroke-ocean-700' : 'stroke-ocean-300'
  const sphereStrokeClassName = isDark ? 'stroke-ocean-800' : 'stroke-ocean-200'

  return (
    <div className="flex flex-col items-center gap-4">
      {/*
        This SVG is a genuinely custom interactive widget (drag-to-rotate,
        wheel/pinch-to-zoom, arrow-key nudging, click-to-pick) with no native
        HTML element or ARIA role that maps onto it cleanly — role="application"
        is the standard ARIA pattern for exactly that ("a widget that manages
        its own keyboard interaction"), same reasoning as CitySearch's
        role="combobox" on a plain <input> elsewhere in this app. oxlint's
        a11y ruleset doesn't have a carve-out for that pattern, hence the
        disables below.
      */}
      {/* oxlint-disable-next-line no-noninteractive-element-interactions */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        role="application"
        // oxlint-disable-next-line no-noninteractive-tabindex
        tabIndex={0}
        aria-label={t('home.globeAriaLabel')}
        className="[aspect-ratio:1] w-full max-w-[420px] cursor-grab touch-none select-none [-webkit-tap-highlight-color:transparent] active:cursor-grabbing sm:max-w-[480px]"
        onKeyDown={handleKeyDown}
      >
        <circle
          ref={sphereElRef}
          cx={CENTER}
          cy={CENTER}
          r={BASE_RADIUS}
          className={`${oceanClassName} ${sphereStrokeClassName}`}
          strokeWidth={1}
        />
        <path ref={graticuleElRef} fill="none" className={graticuleClassName} strokeWidth={0.5} />
        <path ref={landElRef} className={landClassName} />
        <circle
          ref={markerElRef}
          r={MARKER_RADIUS}
          className="fill-muted-foreground stroke-background"
          strokeWidth={2}
          style={{ display: 'none' }}
        />
      </svg>
      {pickedPoint && (
        <GlobePickCard latitude={pickedPoint.latitude} longitude={pickedPoint.longitude} />
      )}
    </div>
  )
}
