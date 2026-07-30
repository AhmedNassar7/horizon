import { test, expect } from '@playwright/test'
import { LONDON, REAL_API, installApiMocks } from './fixtures/mock-api'
import { seedLocations } from './fixtures/seed'

/**
 * Verifies the full weather dashboard actually renders real data end to
 * end — current conditions, hourly forecast, and daily forecast — for a
 * saved location, not just that the sections exist while empty/loading.
 */
test.describe('weather data display', () => {
  test.beforeEach(async ({ page }) => {
    await seedLocations(page, [LONDON])
    if (!REAL_API) await installApiMocks(page)
    await page.goto('./')
  })

  test('current conditions render real temperature and condition data', async ({ page }) => {
    const current = page.getByRole('region', { name: 'London, United Kingdom' })
    await expect(current).toBeVisible()
    await expect(current.getByRole('heading', { name: 'London, United Kingdom' })).toBeVisible()
    await expect(current.locator('[aria-live="polite"]')).toHaveText(`${LONDON.temperatureC}°`)
    await expect(current.getByText('Overcast')).toBeVisible()
    await expect(current.getByText(`Feels like ${LONDON.temperatureC - 1}°`)).toBeVisible()

    // The metric pills (humidity/wind/pressure/cloud cover) render actual
    // values from the mocked response, not placeholders.
    await expect(current.getByText('58%')).toBeVisible() // humidity
    await expect(current.getByText('1015 hPa')).toBeVisible() // pressure
    await expect(current.getByText('20%')).toBeVisible() // cloud cover
  })

  test('hourly forecast renders a real 24-hour data series', async ({ page }) => {
    const hourly = page.getByRole('region', { name: 'Next 24 hours' })
    await expect(hourly).toBeVisible()

    // The scrollable hour-by-hour list is populated (not empty/skeleton).
    const hourItems = hourly.getByRole('list').getByRole('listitem')
    await expect(hourItems.first()).toBeVisible()
    const count = await hourItems.count()
    expect(count).toBeGreaterThanOrEqual(20)
  })

  test('daily forecast renders a real multi-day data series', async ({ page }) => {
    const daily = page.getByRole('region', { name: '7-day forecast' })
    await expect(daily).toBeVisible()
    await expect(daily.getByText('Today')).toBeVisible()

    const dayItems = daily.getByRole('list').getByRole('listitem')
    await expect(dayItems.first()).toBeVisible()
    const count = await dayItems.count()
    expect(count).toBeGreaterThanOrEqual(7)

    // Today's high/low reflect the mocked forecast, not placeholder dashes.
    await expect(daily.getByText(`${LONDON.temperatureC + 3}°`).first()).toBeVisible()
    await expect(daily.getByText(`${LONDON.temperatureC - 4}°`).first()).toBeVisible()
  })

  test('air quality section renders real pollutant data', async ({ page }) => {
    const airQuality = page.getByRole('region', { name: 'Air quality' })
    await expect(airQuality).toBeVisible()
    await expect(airQuality.getByText('32', { exact: true })).toBeVisible() // US AQI
    await expect(airQuality.getByText(/8\.4\s*µg\/m³/)).toBeVisible() // PM2.5
  })
})
