/**
 * Minimal GA4 (gtag.js) loader.
 *
 * This is a deliberate, no-consent-banner integration (explicit product
 * decision) — when a Measurement ID is configured, GA loads unconditionally
 * in production. It stays a complete no-op otherwise: no script tag, no
 * network request, nothing added to the DOM.
 *
 * Two gates must both pass:
 *  - `import.meta.env.PROD` — never loads in dev or in the Vitest test run
 *  - `VITE_GA_MEASUREMENT_ID` — set as a GitHub Actions repo *variable* (not
 *    a secret; GA4 IDs are public, visible in any deployed site's source)
 *    and inlined by Vite at build time. Unset until the GA4 property exists.
 *
 * Injected at mount time rather than as a static <script> in index.html so
 * gtag.js never competes with critical-path resources for the first paint
 * (see the Lighthouse performance work referenced in the README).
 */

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

export const isAnalyticsEnabled = import.meta.env.PROD && Boolean(MEASUREMENT_ID)

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let initialized = false

/** Injects gtag.js and fires the initial config call. Safe to call more than once. */
export function initAnalytics() {
  if (!isAnalyticsEnabled || initialized) return
  initialized = true

  window.dataLayer = window.dataLayer ?? []
  const gtag: NonNullable<Window['gtag']> = (...args) => {
    window.dataLayer?.push(args)
  }
  window.gtag = gtag

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)

  gtag('js', new Date())
  // send_page_view is turned off here because this is a client-side-routed
  // SPA — the automatic load-time pageview would only ever fire once, for
  // whichever route the visitor lands on. Pageviews are instead sent
  // explicitly via trackPageview() on every route change (including the
  // first one), see useAnalytics().
  gtag('config', MEASUREMENT_ID, { send_page_view: false })
}

/** Records a pageview for `path`. No-ops unless analytics is enabled and initialized. */
export function trackPageview(path: string) {
  if (!isAnalyticsEnabled || !window.gtag) return
  window.gtag('event', 'page_view', { page_path: path })
}
