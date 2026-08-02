import { test, expect } from '@playwright/test'
import { LONDON, REAL_API, installApiMocks } from './fixtures/mock-api'
import { seedLocations } from './fixtures/seed'

/**
 * Verifies the interactive location map section renders a real Leaflet map
 * (not just the section shell) and that the expand-to-larger-view dialog
 * opens a second, independent map instance. Deliberately does not assert on
 * tile image pixel content or mock tile requests — only Open-Meteo/geocoding
 * are mocked in this suite (see fixtures/mock-api.ts); tile requests behave
 * like production, so this only checks structure/behavior that holds
 * regardless of whether the real tile servers are reachable.
 */
test.describe('location map', () => {
  test.beforeEach(async ({ page }) => {
    await seedLocations(page, [LONDON])
    if (!REAL_API) await installApiMocks(page)
    await page.goto('./')
  })

  test('renders an interactive map for the active location', async ({ page }) => {
    // Leaflet is a genuinely heavier lazy chunk (~45KB gzip) than this
    // suite's default 5s assertion timeout comfortably covers under
    // contention (observed flaking when run alongside other spec files
    // competing for CPU across parallel workers, even though it's fast in
    // isolation) — a longer timeout here reflects that real cost rather
    // than papering over it.
    const mapSection = page.getByRole('region', { name: 'Map' })
    await expect(mapSection).toBeVisible({ timeout: 10_000 })
    await expect(mapSection.locator('.leaflet-container')).toBeVisible()
  })

  test('expand button opens a dialog containing a second map instance', async ({ page }) => {
    const mapSection = page.getByRole('region', { name: 'Map' })
    await expect(mapSection).toBeVisible({ timeout: 10_000 })

    await mapSection.getByRole('button', { name: 'View larger map' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('.leaflet-container')).toBeVisible()

    // Both the inline map and the dialog's map are mounted simultaneously —
    // two independent instances, not one moved around the DOM.
    await expect(page.locator('.leaflet-container')).toHaveCount(2)
  })
})
