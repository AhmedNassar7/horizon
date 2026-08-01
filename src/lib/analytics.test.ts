import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// import.meta.env.PROD / VITE_GA_MEASUREMENT_ID are read once at module load,
// so each scenario stubs the env first and imports the module fresh.
async function loadAnalytics() {
  vi.resetModules()
  return import('./analytics')
}

describe('analytics', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    document.head.querySelectorAll('script').forEach((el) => el.remove())
    delete window.gtag
    delete window.dataLayer
  })

  describe('when running in dev (PROD=false), regardless of the measurement ID', () => {
    beforeEach(() => {
      vi.stubEnv('PROD', false)
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TESTID123')
    })

    it('reports analytics as disabled', async () => {
      const { isAnalyticsEnabled } = await loadAnalytics()
      expect(isAnalyticsEnabled).toBe(false)
    })

    it('injects no script tag and never touches window.gtag', async () => {
      const { initAnalytics, trackPageview } = await loadAnalytics()
      initAnalytics()
      trackPageview('/somewhere')
      expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull()
      expect(window.gtag).toBeUndefined()
    })
  })

  describe('when in production with no measurement ID configured', () => {
    beforeEach(() => {
      vi.stubEnv('PROD', true)
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', '')
    })

    it('reports analytics as disabled and stays a no-op', async () => {
      const { isAnalyticsEnabled, initAnalytics } = await loadAnalytics()
      expect(isAnalyticsEnabled).toBe(false)
      initAnalytics()
      expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull()
    })
  })

  describe('when in production with a measurement ID configured', () => {
    beforeEach(() => {
      vi.stubEnv('PROD', true)
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TESTID123')
    })

    it('reports analytics as enabled', async () => {
      const { isAnalyticsEnabled } = await loadAnalytics()
      expect(isAnalyticsEnabled).toBe(true)
    })

    it('injects the gtag.js script tag pointed at the configured ID', async () => {
      const { initAnalytics } = await loadAnalytics()
      initAnalytics()
      const script = document.querySelector<HTMLScriptElement>('script[src*="googletagmanager"]')
      expect(script).not.toBeNull()
      expect(script?.async).toBe(true)
      expect(script?.src).toContain('G-TESTID123')
    })

    it('is idempotent — calling initAnalytics twice injects only one script', async () => {
      const { initAnalytics } = await loadAnalytics()
      initAnalytics()
      initAnalytics()
      expect(document.querySelectorAll('script[src*="googletagmanager"]')).toHaveLength(1)
    })

    it('records pageviews through window.gtag once initialized', async () => {
      const { initAnalytics, trackPageview } = await loadAnalytics()
      initAnalytics()
      const gtagSpy = vi.fn<NonNullable<Window['gtag']>>()
      window.gtag = gtagSpy
      trackPageview('/clocks')
      expect(gtagSpy).toHaveBeenCalledWith('event', 'page_view', { page_path: '/clocks' })
    })
  })
})
