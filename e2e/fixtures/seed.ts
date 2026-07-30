import type { Page } from '@playwright/test'
import type { FixtureCity } from './mock-api'

/** Matches zustand's `persist` middleware on-disk format exactly
 * (`{ state, version }`, version defaulting to 0) — see
 * node_modules/zustand/middleware.js. */
function persisted<T>(state: T): string {
  return JSON.stringify({ state, version: 0 })
}

async function seedLocalStorage(page: Page, key: string, value: string) {
  await page.addInitScript(([k, v]) => window.localStorage.setItem(k, v), [key, value] as [
    string,
    string,
  ])
}

/**
 * Seeds the persisted location store *before* the app boots (must be called
 * before page.goto). Home.tsx auto-triggers browser/IP geolocation whenever
 * there are zero saved locations, which would otherwise race every other
 * interaction in a test; seeding at least one location upfront sidesteps
 * that entirely and lets each spec start from a known, stable state.
 */
export async function seedLocations(page: Page, cities: FixtureCity[], active?: FixtureCity) {
  const locations = cities.map((city) => ({
    id: String(city.id),
    name: city.name,
    country: city.country,
    admin1: city.admin1,
    latitude: city.latitude,
    longitude: city.longitude,
  }))
  const activeLocationId = String((active ?? cities[0])?.id ?? '')

  await seedLocalStorage(page, 'horizon:locations', persisted({ locations, activeLocationId }))
}

export async function seedTimezoneSelections(
  page: Page,
  selections: { id: string; label: string; timezone: string }[],
) {
  await seedLocalStorage(page, 'horizon:timezone-selections', persisted({ selections }))
}

export async function seedSettings(page: Page, settings: Record<string, unknown>) {
  await seedLocalStorage(page, 'horizon:settings', persisted(settings))
}
