import { test, expect } from '@playwright/test'
import { LONDON, NEW_YORK, REAL_API, installApiMocks } from './fixtures/mock-api'
import { seedLocations } from './fixtures/seed'

/**
 * Exercises the core "add a place" interaction that almost every other page
 * in the app builds on: type into the city combobox, see live autocomplete
 * results, pick one, and watch it become the active location with real
 * weather rendered for it.
 */
test.describe('city search', () => {
  test.beforeEach(async ({ page }) => {
    // Seed a starting location so the page loads straight into the
    // dashboard instead of racing Home's own auto-geolocate-when-empty
    // behavior (see e2e/fixtures/seed.ts for why).
    await seedLocations(page, [NEW_YORK])
    if (!REAL_API) await installApiMocks(page)
  })

  test('searching and selecting a city makes it the active location with weather data', async ({
    page,
  }) => {
    await page.goto('./')

    // Starts on the seeded location.
    await expect(page.getByRole('region', { name: 'New York, United States' })).toBeVisible()

    const searchBox = page.getByRole('combobox', { name: 'Search for a city...' })
    await searchBox.fill('Lon')

    // Live autocomplete results appear.
    const option = page.getByRole('option', { name: /London/ })
    await expect(option).toBeVisible()
    await expect(option).toContainText('England, United Kingdom')

    await option.click()

    // The search input clears and the new city becomes the active,
    // rendered location — with its own real weather data, not the
    // previous city's.
    await expect(searchBox).toHaveValue('')
    const londonSection = page.getByRole('region', { name: 'London, United Kingdom' })
    await expect(londonSection).toBeVisible()
    await expect(londonSection.locator('[aria-live="polite"]')).toHaveText(
      `${LONDON.temperatureC}°`,
    )
    await expect(page.getByText('Overcast')).toBeVisible()

    // The previous location's dashboard is gone, not just covered up.
    await expect(page.getByRole('region', { name: 'New York, United States' })).toHaveCount(0)
  })

  test('typing fewer than two characters shows no results', async ({ page }) => {
    await page.goto('./')
    const searchBox = page.getByRole('combobox', { name: 'Search for a city...' })
    await searchBox.fill('L')
    await expect(page.getByRole('option')).toHaveCount(0)
  })
})
