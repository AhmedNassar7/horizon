import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { initAnalytics, trackPageview } from '@/lib/analytics'

/**
 * Mounts the GA4 loader once and reports a pageview on every route change.
 * A no-op end-to-end when analytics is disabled (see src/lib/analytics.ts) —
 * cheap enough to call unconditionally near the router root, no per-page
 * wiring needed.
 */
export function useAnalytics() {
  const location = useLocation()

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    trackPageview(location.pathname + location.search)
  }, [location.pathname, location.search])
}
