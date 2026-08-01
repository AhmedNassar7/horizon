import { defineConfig, devices } from '@playwright/test'

/**
 * Horizon is a client-side-only static app (GitHub Pages deploy target), so
 * e2e runs against a real production build served by `vite preview` rather
 * than the dev server. This matters for two reasons:
 *  - `vite-plugin-pwa` only emits/registers the service worker in a
 *    production build, and the PWA spec needs that to be real.
 *  - React's StrictMode double-invokes effects in dev but not in a prod
 *    build, which would otherwise double every geolocation/search/weather
 *    fetch our route mocks need to count or match deterministically.
 *
 * The app is served under the `/horizon/` base path (see vite.config.ts),
 * matching how it's actually hosted on GitHub Pages.
 */
const PORT = 4173
const BASE_URL = `http://localhost:${PORT}/horizon/`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30_000,

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Blocked by default: vite.config.ts registers a NetworkFirst service
    // worker for the Open-Meteo API routes in production builds (which is
    // what this suite runs against, see above). Once that worker activates
    // mid-test, it starts handling those fetches itself — from inside the
    // worker's own execution context, invisible to page.route() — so our
    // API mocks silently stop applying and requests fall through to the
    // real network. In an environment with real outbound internet (e.g.
    // GitHub Actions, unlike this sandbox) that doesn't error, it just
    // returns real, non-deterministic data, producing exactly the kind of
    // CI-only flake this comment is warning you about. e2e/pwa.spec.ts
    // opts back in with `test.use({ serviceWorkers: 'allow' })` since it's
    // the one spec that actually needs a real service worker registered.
    serviceWorkers: 'block',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
  },
})
