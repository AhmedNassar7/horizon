import { test, expect } from '@playwright/test'
import { LONDON, REAL_API, installApiMocks } from './fixtures/mock-api'
import { seedLocations } from './fixtures/seed'

/**
 * Verifies the two "genuinely useful, not decorative" map features added on
 * top of the plain Leaflet pin: the RainViewer radar overlay toggle, and
 * click-to-explore-anywhere (reverse-geocoding an arbitrary clicked point and
 * offering to save/jump to it as a new location).
 *
 * This spec deliberately mocks RainViewer and BigDataCloud itself (rather
 * than relying on installApiMocks(), which intentionally aborts BigDataCloud
 * for the rest of the suite) — both are unreachable from this sandbox, and
 * the explore flow needs a real, deterministic reverse-geocode result to
 * assert on.
 */

const EXPLORE_LOCATION = {
  latitude: 51.5,
  longitude: -0.1,
  city: 'Testville',
  principalSubdivision: 'Test County',
  countryName: 'Testland',
  countryCode: 'TL',
}

async function installExploreMocks(page: import('@playwright/test').Page) {
  await page.route('https://api.bigdatacloud.net/data/reverse-geocode-client**', (route) =>
    route.fulfill({ json: EXPLORE_LOCATION }),
  )

  await page.route('https://api.rainviewer.com/public/weather-maps.json', (route) =>
    route.fulfill({
      json: {
        host: 'https://tilecache.rainviewer.com',
        radar: {
          past: [
            { time: Math.floor(Date.now() / 1000) - 600, path: '/v2/radar/aaa' },
            { time: Math.floor(Date.now() / 1000), path: '/v2/radar/bbb' },
          ],
        },
      },
    }),
  )

  // 1x1 transparent PNG — the sandbox has no route to tilecache.rainviewer.com,
  // and pixel content isn't under test, only that Leaflet requests/renders a
  // radar tile layer at all.
  const TRANSPARENT_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  )
  await page.route('https://tilecache.rainviewer.com/**', (route) =>
    route.fulfill({ contentType: 'image/png', body: TRANSPARENT_PNG }),
  )
}

test.describe('location map — radar overlay', () => {
  test.beforeEach(async ({ page }) => {
    await seedLocations(page, [LONDON])
    if (!REAL_API) await installApiMocks(page)
    await installExploreMocks(page)
    await page.goto('./')
  })

  test('toggling radar shows the overlay, play control, and an "updated" caption', async ({
    page,
  }) => {
    const mapSection = page.getByRole('region', { name: 'Map' })
    await expect(mapSection).toBeVisible({ timeout: 10_000 })

    const radarToggle = mapSection.getByRole('button', { name: 'Toggle precipitation radar' })
    await expect(radarToggle).toHaveAttribute('aria-pressed', 'false')

    await radarToggle.click()
    await expect(radarToggle).toHaveAttribute('aria-pressed', 'true')

    // Latest frame's mocked timestamp is "now", so the caption should read 0.
    await expect(mapSection.getByText('Updated 0 min ago')).toBeVisible()
    await expect(mapSection.getByRole('button', { name: 'Play radar animation' })).toBeVisible()

    // Turning it back off removes the animation control and caption.
    await radarToggle.click()
    await expect(radarToggle).toHaveAttribute('aria-pressed', 'false')
    await expect(mapSection.getByRole('button', { name: 'Play radar animation' })).not.toBeVisible()
    await expect(mapSection.getByText('Updated 0 min ago')).not.toBeVisible()
  })

  test('play control swaps to pause while animating', async ({ page }) => {
    const mapSection = page.getByRole('region', { name: 'Map' })
    await expect(mapSection).toBeVisible({ timeout: 10_000 })

    await mapSection.getByRole('button', { name: 'Toggle precipitation radar' }).click()
    const playButton = mapSection.getByRole('button', { name: 'Play radar animation' })
    await expect(playButton).toBeVisible()

    await playButton.click()
    await expect(mapSection.getByRole('button', { name: 'Pause radar animation' })).toBeVisible()
  })
})

test.describe('location map — click to explore', () => {
  test.beforeEach(async ({ page }) => {
    await seedLocations(page, [LONDON])
    if (!REAL_API) await installApiMocks(page)
    await installExploreMocks(page)
    await page.goto('./')
  })

  test('first click only dismisses the interact hint; a second click explores that spot', async ({
    page,
  }) => {
    const mapSection = page.getByRole('region', { name: 'Map' })
    await expect(mapSection).toBeVisible({ timeout: 10_000 })
    const leafletContainer = mapSection.locator('.leaflet-container')
    await expect(leafletContainer).toBeVisible()

    const hint = mapSection.getByText('Click or tap to interact with the map')
    await expect(hint).toBeVisible()

    // First click anywhere on the map: consumed entirely by the "click to
    // interact" overlay (it's the topmost element there, which is exactly
    // the point — Leaflet itself never sees this click) — the hint
    // disappears and nothing else happens (no explore popup).
    await hint.click()
    await expect(hint).not.toBeVisible()
    await expect(page.locator('.leaflet-popup')).toHaveCount(0)

    // Second click now reaches Leaflet for real and should open the explore
    // popup, first in a loading state, then resolved. Clicking well away
    // from the top-left corner avoids Leaflet's default zoom control (which
    // otherwise intercepts a click there once the hint overlay is gone) and
    // away from dead center avoids the primary marker itself.
    await leafletContainer.click({ position: { x: 200, y: 200 } })
    const popup = page.locator('.leaflet-popup')
    await expect(popup).toBeVisible()
    await expect(popup.getByText('Testville, Testland')).toBeVisible()

    const addButton = popup.getByRole('button', { name: 'View weather here' })
    await expect(addButton).toBeVisible()
    await addButton.click()

    await expect(page).toHaveURL(/\/location\/51\.50,-0\.10$/)
    await expect(page.getByText('Testville, Testland').first()).toBeVisible()
  })

  test('clicking the primary marker opens only its own popup, not the explore flow', async ({
    page,
  }) => {
    const mapSection = page.getByRole('region', { name: 'Map' })
    await expect(mapSection).toBeVisible({ timeout: 10_000 })
    const leafletContainer = mapSection.locator('.leaflet-container')
    await expect(leafletContainer).toBeVisible()

    // First click (anywhere) unlocks the map — same as the "click to
    // interact" hint's documented behavior.
    await mapSection.getByText('Click or tap to interact with the map').click()
    await expect(page.locator('.leaflet-popup')).toHaveCount(0)

    // Second click, this time directly on the primary marker's own icon.
    const marker = mapSection.locator('.leaflet-marker-icon')
    await expect(marker).toBeVisible()
    await marker.click()

    // Exactly one popup — the marker's own ("London"), never a second
    // explore popup/marker for the same click.
    await expect(page.locator('.leaflet-popup')).toHaveCount(1)
    const popup = page.locator('.leaflet-popup')
    await expect(popup).toContainText('London')
    await expect(popup.getByText('Looking up this location')).toHaveCount(0)
  })
})
