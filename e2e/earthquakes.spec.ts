import { test, expect } from '@playwright/test'
import { LONDON, NEAR_LONDON_EARTHQUAKE, REAL_API, installApiMocks } from './fixtures/mock-api'
import { seedLocations } from './fixtures/seed'

/** Local re-implementation of the app's haversine formula (see
 * src/lib/geo.ts), used only to compute the *expected* distance for the
 * fixture coordinates below — not a test of the math itself (that's
 * covered by src/lib/geo.test.ts), just a way to assert the dashboard card
 * renders the right number without hardcoding a value that would silently
 * go stale if a fixture coordinate ever changed. */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

test.describe('earthquakes (global page)', () => {
  test.beforeEach(async ({ page }) => {
    await seedLocations(page, [LONDON])
    if (!REAL_API) await installApiMocks(page)
    await page.goto('earthquakes')
    await expect(page.getByRole('heading', { name: 'Earthquakes', level: 1 })).toBeVisible()
  })

  test('renders the fetched earthquake list and plots a map marker per result', async ({
    page,
  }) => {
    await expect(page.getByText('128km SSE of Tokyo, Japan')).toBeVisible()
    await expect(page.getByText('Kent, England')).toBeVisible()
    await expect(page.getByText('64km W of Ridgecrest, CA')).toBeVisible()

    // Leaflet is a genuinely heavy lazy chunk — see location-map.spec.ts for
    // the same generous timeout rationale.
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 })
    // Each earthquake renders as its own circle marker (an SVG path in
    // Leaflet's default renderer) — three fixtures in, three markers out.
    await expect(page.locator('path.leaflet-interactive')).toHaveCount(3)
  })

  test('changing the magnitude and time-window filters changes the request sent to USGS', async ({
    page,
  }) => {
    const [magnitudeRequest] = await Promise.all([
      page.waitForRequest(
        (req) =>
          req.url().includes('earthquake.usgs.gov') && req.url().includes('minmagnitude=2.5'),
      ),
      page.getByRole('radio', { name: '2.5+' }).click(),
    ])
    expect(magnitudeRequest.url()).toContain('minmagnitude=2.5')

    const [windowRequest] = await Promise.all([
      page.waitForRequest(
        (req) =>
          req.url().includes('earthquake.usgs.gov') && req.url().includes('minmagnitude=2.5'),
      ),
      page.getByRole('radio', { name: '30d' }).click(),
    ])
    // A 30-day window pushes `starttime` roughly a month back — sanity
    // check it actually moved, rather than pinning an exact ISO string
    // against the live clock.
    const requestedStart = new Date(new URL(windowRequest.url()).searchParams.get('starttime')!)
    const daysAgo = (Date.now() - requestedStart.getTime()) / (24 * 60 * 60 * 1000)
    expect(daysAgo).toBeGreaterThan(25)
    expect(daysAgo).toBeLessThan(31)
  })

  test('shows the USGS attribution line and the safety information section', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: 'Earthquake data: U.S. Geological Survey (USGS)' }),
    ).toHaveAttribute('href', 'https://earthquake.usgs.gov/')

    const safety = page.locator('#safety')
    await expect(safety.getByRole('heading', { name: 'Earthquake safety' })).toBeVisible()
    await expect(safety.getByText(/Drop where you are/)).toBeVisible()
    // Framed explicitly as general safety guidance, never as prediction or
    // early-warning capability.
    await expect(safety.getByText(/not a prediction or early-warning system/)).toBeVisible()
  })
})

test.describe('nearby earthquakes card', () => {
  test.beforeEach(async ({ page }) => {
    await seedLocations(page, [LONDON])
    if (!REAL_API) await installApiMocks(page)
    await page.goto('./')
  })

  test('renders the mocked nearby quake with correct magnitude, distance, and time-ago, linking to USGS', async ({
    page,
  }) => {
    const nearby = page.getByRole('region', { name: 'Nearby earthquakes' })
    await expect(nearby).toBeVisible()

    // Magnitude badge, formatted to one decimal place.
    await expect(nearby.getByText(NEAR_LONDON_EARTHQUAKE.magnitude.toFixed(1))).toBeVisible()

    const expectedKm = Math.round(
      haversineKm(
        LONDON.latitude,
        LONDON.longitude,
        NEAR_LONDON_EARTHQUAKE.latitude,
        NEAR_LONDON_EARTHQUAKE.longitude,
      ),
    )
    await expect(nearby.getByText(new RegExp(`${expectedKm} km`))).toBeVisible()

    // ageMs is 3 hours in the fixture — plain "3 hours ago", not one of
    // RelativeTimeFormat's special-cased day words.
    await expect(nearby.getByText('3 hours ago')).toBeVisible()

    const link = nearby.getByRole('link', { name: NEAR_LONDON_EARTHQUAKE.place })
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute(
      'href',
      `https://earthquake.usgs.gov/earthquakes/eventpage/${NEAR_LONDON_EARTHQUAKE.id}`,
    )
  })
})
