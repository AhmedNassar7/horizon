import { test, expect } from '@playwright/test'
import { NEW_YORK, REAL_API, installApiMocks } from './fixtures/mock-api'
import { seedLocations, seedSettings } from './fixtures/seed'

/**
 * Verifies theme switching has a real, visible effect (a `dark` class on
 * <html> that actually changes computed styles) rather than just checking
 * that a button was clicked. The header cycles auto -> light -> dark -> auto
 * (see src/components/layout/Header.tsx THEME_CYCLE).
 */
test.describe('theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await seedLocations(page, [NEW_YORK])
    // Seed an explicit 'light' starting theme so the test doesn't depend on
    // the host's prefers-color-scheme for its *starting* state.
    await seedSettings(page, {
      theme: 'light',
      temperatureUnit: 'celsius',
      windUnit: 'kmh',
      timeFormat: '24h',
      language: 'en',
    })
    if (!REAL_API) await installApiMocks(page)
    // Pin the OS-level color scheme so the 'auto' mode (which reads
    // prefers-color-scheme) resolves deterministically later in the test.
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('./')
  })

  test('cycling the theme toggle applies the dark class and changes rendered colors', async ({
    page,
  }) => {
    const html = page.locator('html')
    await expect(html).not.toHaveClass(/dark/)
    const lightBackground = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    )

    // light -> dark
    await page.getByRole('button', { name: 'Theme: Light. Activate to change.' }).click()
    await expect(html).toHaveClass(/dark/)
    const darkBackground = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    )
    expect(darkBackground).not.toBe(lightBackground)

    // dark -> auto, which (with prefers-color-scheme pinned to light above)
    // resolves back to light — proving the toggle is bidirectional and
    // 'auto' genuinely follows system preference, not a stuck flag.
    await page.getByRole('button', { name: 'Theme: Dark. Activate to change.' }).click()
    await expect(html).not.toHaveClass(/dark/)
    const autoBackground = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    )
    expect(autoBackground).toBe(lightBackground)

    // auto -> light
    await page.getByRole('button', { name: 'Theme: System. Activate to change.' }).click()
    await expect(html).not.toHaveClass(/dark/)
  })

  test('auto theme mode follows the OS dark-mode preference', async ({ page }) => {
    // Switch OS preference to dark *before* setting the app to 'auto', then
    // confirm the app actually reacts to prefers-color-scheme rather than
    // only reading it once at load.
    await page.getByRole('button', { name: 'Theme: Light. Activate to change.' }).click()
    await page.getByRole('button', { name: 'Theme: Dark. Activate to change.' }).click()
    await expect(
      page.getByRole('button', { name: 'Theme: System. Activate to change.' }),
    ).toBeVisible()

    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.emulateMedia({ colorScheme: 'light' })
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })
})
