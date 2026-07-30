import { test, expect } from '@playwright/test'
import { LONDON, NEW_YORK, REAL_API, TOKYO, installApiMocks } from './fixtures/mock-api'
import { seedLocations } from './fixtures/seed'

/**
 * The time suite (world clocks, meeting planner, time-difference
 * calculator) is entirely client-side math — no weather API involved — so
 * these specs still install the same route mocks (only to keep the
 * shared CitySearch component's geocoding calls deterministic/offline),
 * but assert purely on timezone arithmetic and live-updating UI, which is
 * where the real risk of regression lives.
 */
test.describe('time suite', () => {
  test.beforeEach(async ({ page }) => {
    if (!REAL_API) await installApiMocks(page)
  })

  test('world clock cards show live-updating local time for saved locations', async ({ page }) => {
    await seedLocations(page, [LONDON, TOKYO])
    await page.goto('clocks')

    await expect(page.getByRole('heading', { name: 'World clocks' })).toBeVisible()

    const londonCard = page
      .getByRole('button', { name: 'Remove London from world clocks' })
      .locator('xpath=..')
    const tokyoCard = page
      .getByRole('button', { name: 'Remove Tokyo from world clocks' })
      .locator('xpath=..')

    await expect(londonCard).toContainText('England, United Kingdom')
    await expect(tokyoCard).toContainText('Tokyo, Japan')

    // UTC offset badges render in the expected shape.
    await expect(londonCard.getByText(/^UTC[+-]\d/)).toBeVisible()
    await expect(tokyoCard.getByText(/^UTC[+-]\d/)).toBeVisible()

    // The clock is genuinely live — its seconds advance over real time,
    // it isn't a static timestamp rendered once.
    const readingLocator = londonCard.getByText(/^Current time /)
    const firstReading = await readingLocator.textContent()
    await page.waitForTimeout(1_100)
    const secondReading = await readingLocator.textContent()
    expect(secondReading).not.toBe(firstReading)
  })

  test('meeting planner renders a correct hour-offset grid for two locations', async ({ page }) => {
    await seedLocations(page, [LONDON, TOKYO])
    await page.goto('planner')

    await expect(page.getByRole('heading', { name: 'Meeting planner' })).toBeVisible()

    const londonRow = page.getByRole('rowheader', { name: 'London' }).locator('xpath=..')
    const tokyoRow = page.getByRole('rowheader', { name: 'Tokyo' }).locator('xpath=..')

    const londonHours = (await londonRow.getByRole('cell').allTextContents()).map(Number)
    const tokyoHours = (await tokyoRow.getByRole('cell').allTextContents()).map(Number)

    expect(londonHours).toHaveLength(24)
    expect(tokyoHours).toHaveLength(24)
    for (const hour of [...londonHours, ...tokyoHours]) {
      expect(hour).toBeGreaterThanOrEqual(0)
      expect(hour).toBeLessThanOrEqual(23)
    }

    // Each row is a real advancing 24-hour clock: consecutive columns are
    // always exactly one hour apart (mod 24), not static/placeholder data.
    for (let i = 1; i < 24; i++) {
      expect((londonHours[i]! - londonHours[i - 1]! + 24) % 24).toBe(1)
      expect((tokyoHours[i]! - tokyoHours[i - 1]! + 24) % 24).toBe(1)
    }

    // Tokyo (UTC+9, no DST) is consistently 8 or 9 hours ahead of London
    // (UTC+0/+1 depending on British Summer Time) at every column — proves
    // the grid reflects real relative timezone offsets rather than two
    // independent/unsynced sequences.
    const offsets = new Set(londonHours.map((hour, i) => (tokyoHours[i]! - hour + 24) % 24))
    expect(offsets.size).toBe(1)
    expect([8, 9]).toContain([...offsets][0])
  })

  test('planner prompts for a second location when only one is saved', async ({ page }) => {
    await seedLocations(page, [LONDON])
    await page.goto('planner')
    await expect(page.getByText('Add at least two locations to plan a meeting')).toBeVisible()
  })

  test('time difference calculator adds a city and shows its relative offset', async ({ page }) => {
    await seedLocations(page, [NEW_YORK])
    await page.goto('clocks')

    // Two CitySearch instances exist on this page (world clocks, above,
    // and this section) — scope to the labelled "Time difference" region
    // to avoid an ambiguous match.
    const timeDifference = page.getByRole('region', { name: 'Time difference' })
    await timeDifference.getByRole('combobox', { name: 'Search for a city...' }).fill('Tok')
    await page.getByRole('option', { name: /Tokyo/ }).click()

    await expect(timeDifference.getByText('Tokyo, Japan')).toBeVisible()
    await expect(
      timeDifference.getByText(/hours? (ahead of you|behind you)|Same time as you/),
    ).toBeVisible()
  })
})
