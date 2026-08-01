import { test, expect } from '@playwright/test'
import { NEW_YORK, REAL_API, installApiMocks } from './fixtures/mock-api'
import { seedLocations } from './fixtures/seed'

/**
 * Verifies the underlying PWA plumbing (manifest link + reachable manifest,
 * service worker registration) rather than any install-prompt UI, which
 * isn't automatable — browsers only fire `beforeinstallprompt` based on
 * their own private engagement heuristics, not anything a test can force.
 *
 * playwright.config.ts always runs the suite against `vite preview` (a real
 * production build): vite-plugin-pwa only emits/registers a service worker
 * in production, never in `vite dev`, so this spec would be unable to pass
 * against a dev server regardless of network conditions.
 */
test.describe('PWA', () => {
  // Overrides playwright.config.ts's global `serviceWorkers: 'block'` — this
  // is the one spec that actually needs a real service worker to register.
  test.use({ serviceWorkers: 'allow' })

  test.beforeEach(async ({ page }) => {
    await seedLocations(page, [NEW_YORK])
    if (!REAL_API) await installApiMocks(page)
  })

  test('manifest is linked in the document and reachable', async ({ page, baseURL }) => {
    await page.goto('./')

    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href')
    expect(manifestHref).toBeTruthy()

    const manifestUrl = new URL(manifestHref!, baseURL).toString()
    const response = await page.request.get(manifestUrl)
    expect(response.ok()).toBe(true)

    const manifest = await response.json()
    expect(manifest.name).toBe('Horizon — Weather & Time')
    expect(manifest.short_name).toBe('Horizon')
    expect(manifest.display).toBe('standalone')
    expect(manifest.start_url).toBe('/horizon/')
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThan(0)
  })

  test('a service worker registers and activates for the app scope', async ({ page }) => {
    await page.goto('./')

    const registration = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return null
      const reg = await navigator.serviceWorker.ready
      return { scope: reg.scope, hasActiveWorker: !!reg.active }
    })

    expect(registration).not.toBeNull()
    expect(registration?.hasActiveWorker).toBe(true)
    expect(registration?.scope).toContain('/horizon/')
  })
})
