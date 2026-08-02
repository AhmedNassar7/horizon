import { test, expect, type Page } from '@playwright/test'
import { REAL_API, installApiMocks } from './fixtures/mock-api'

/**
 * Covers LocationGlobe, the d3-geo orthographic-projection globe shown on
 * Home's empty state (before any location is saved) — a genuinely
 * functional, rotatable/zoomable/clickable way to pick a location, not a
 * decoration. Mirrors e2e/location-map-explore.spec.ts's structure for the
 * equivalent "click an arbitrary point, reverse-geocode it, confirm, and
 * navigate" flow, and mocks BigDataCloud itself (rather than relying on
 * installApiMocks(), which aborts BigDataCloud unconditionally) since this
 * spec needs a real, deterministic reverse-geocode result for the picked
 * point while *also* needing Home's own silent auto-geolocate-on-empty-state
 * attempt to keep failing — otherwise it would race to auto-populate a
 * location and the empty state (and the globe) would never render.
 */

const PICK_LOCATION = {
  latitude: 15,
  longitude: 20,
  city: 'Testville',
  principalSubdivision: 'Test County',
  countryName: 'Testland',
  countryCode: 'TL',
}

// LocationGlobe starts at a fixed initial rotation of [-20, -15, 0] and,
// with prefers-reduced-motion set, never auto-rotates from there — so the
// geographic point sitting dead-center of the globe (where Playwright's
// default `.click()` lands) is always exactly [-rotation[0], -rotation[1]]
// = [20, 15] (longitude, latitude). This is the same id convention used by
// LocationMap's click-to-explore and Home's own geolocation flow.
const CENTER_LATITUDE = 15
const CENTER_LONGITUDE = 20
const EXPECTED_ID = `${CENTER_LATITUDE.toFixed(2)},${CENTER_LONGITUDE.toFixed(2)}`

async function installGlobeMocks(page: Page) {
  await page.route('https://api.bigdatacloud.net/data/reverse-geocode-client**', (route) => {
    const url = new URL(route.request().url())
    if (!url.searchParams.has('latitude')) {
      // Home's own silent auto-locate-on-empty-state attempt (the IP
      // fallback, called with no coordinates) — not under test here. Fail
      // it fast so the empty state (and the globe) stays put instead of
      // racing to auto-populate a location from it.
      return route.abort('failed')
    }
    return route.fulfill({ json: PICK_LOCATION })
  })
}

test.describe('location globe', () => {
  test.beforeEach(async ({ page }) => {
    if (!REAL_API) await installApiMocks(page)
    await installGlobeMocks(page)
    // The globe's own idle auto-rotation is explicitly skipped under
    // prefers-reduced-motion (same convention as LocationMap) — set before
    // navigating so the globe's initial rotation stays put, which is what
    // makes clicking its exact center land on a known, fixed coordinate.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('./')
  })

  test('renders on the empty state, alongside a working CitySearch', async ({ page }) => {
    // role="application" is set directly on the globe's own <svg> element
    // (see LocationGlobe.tsx), so this locator resolves to the svg itself.
    const globe = page.getByRole('application', { name: /Interactive globe/ })
    await expect(globe).toBeVisible({ timeout: 10_000 })
    expect(await globe.evaluate((el) => el.tagName)).toBe('svg')

    // The globe is supplementary, never a replacement — the existing,
    // fully accessible text search must still be present and functional.
    await expect(page.getByRole('combobox', { name: 'Search for a city...' })).toBeVisible()
  })

  test('a drag gesture rotates the globe (changes the rendered path data)', async ({ page }) => {
    const globe = page.getByRole('application', { name: /Interactive globe/ })
    await expect(globe).toBeVisible({ timeout: 10_000 })

    // Land is the second <path> (index 1): the graticule is the first.
    const landPath = globe.locator('path').nth(1)
    const before = await landPath.getAttribute('d')
    expect(before).toBeTruthy()

    const box = await globe.boundingBox()
    if (!box) throw new Error('globe has no bounding box')
    const centerX = box.x + box.width / 2
    const centerY = box.y + box.height / 2

    await page.mouse.move(centerX, centerY)
    await page.mouse.down()
    await page.mouse.move(centerX + 140, centerY + 20, { steps: 12 })
    await page.mouse.up()

    const after = await landPath.getAttribute('d')
    expect(after).not.toBe(before)
  })

  test('clicking the visible center of the globe opens the pick card, resolves, and navigates', async ({
    page,
  }) => {
    const globe = page.getByRole('application', { name: /Interactive globe/ })
    await expect(globe).toBeVisible({ timeout: 10_000 })

    // A plain click lands at the element's bounding-box center by default —
    // which is exactly the projection's own center pixel, i.e. the one
    // geographic point guaranteed visible regardless of current rotation.
    await globe.click()

    // Not asserting the intermediate "Looking up this location…" state here:
    // the mocked reverse-geocode response resolves essentially immediately,
    // so waiting on that text is inherently racy (same reason
    // location-map-explore.spec.ts doesn't assert it either) — the resolved
    // state below is the meaningful assertion.
    await expect(page.getByText('Testville, Testland')).toBeVisible()

    const addButton = page.getByRole('button', { name: 'View weather here' })
    await expect(addButton).toBeVisible()
    await addButton.click()

    await expect(page).toHaveURL(new RegExp(`/location/${EXPECTED_ID.replace(/\./g, '\\.')}$`))
    await expect(page.getByText('Testville, Testland').first()).toBeVisible()
  })
})
