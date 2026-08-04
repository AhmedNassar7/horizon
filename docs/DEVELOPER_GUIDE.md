# Developer Guide

## Tech stack

Versions below are pulled from `package.json` — see it for the authoritative list.

| Layer                        | Choices                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Framework                    | React 19, React Router 7, Vite 8                                                                           |
| Language                     | TypeScript ~6                                                                                              |
| Styling / UI                 | Tailwind CSS 4, shadcn/ui (Radix primitives), `class-variance-authority`, `framer-motion`                  |
| State                        | Zustand 5 (with `persist` → `localStorage`)                                                                |
| Server-state / data fetching | TanStack Query 5                                                                                           |
| Validation                   | Zod 4 — every external API response is parsed at the boundary, never trusted as-typed                      |
| Charts                       | Recharts 3                                                                                                 |
| i18n                         | i18next / react-i18next, with `i18next-browser-languagedetector`                                           |
| PWA                          | `vite-plugin-pwa` (Workbox)                                                                                |
| Testing                      | Vitest + Testing Library (unit/component), Playwright + `@axe-core/playwright` (e2e + a11y), Lighthouse CI |
| Tooling                      | oxlint, Prettier, Husky + lint-staged                                                                      |

See the [Architecture & data flow section of the README](../README.md#architecture--data-flow) for how these pieces fit together.

## Project structure

```
src/
  api/            # fetch + Zod validation, provider adapters (Open-Meteo, geocoding, USGS earthquakes)
  components/     # layout, search, time, weather, and shadcn/ui primitives
  hooks/          # useWeather, useCitySearch, useGeolocation, useTheme, ...
  i18n/           # i18next setup + locales/{en,es,fr,ar,zh}.json
  lib/            # pure helpers: units, timezone, beaufort scale, moon phase, ...
  pages/          # one file per route, each owns its own <title>/meta tags
  schemas/        # Zod schemas for every external API response
  store/          # Zustand stores (locations, settings, timezone selections)
e2e/              # Playwright specs
```

## Local development

```bash
npm install
npm run dev          # start the Vite dev server
npm run build         # tsc -b && vite build (production build to dist/)
npm run preview       # serve the production build locally
```

## Testing

```bash
npm run test           # Vitest — unit + component tests
npm run test:watch     # Vitest in watch mode
npm run test:e2e       # Playwright — end-to-end suite (city search, weather display, earthquakes, time suite, theme toggle, PWA)
npm run test:e2e:ui    # Playwright with its UI runner
```

## Linting & formatting

```bash
npm run lint           # oxlint
npm run format         # prettier --write .
npm run format:check   # prettier --check .
npm run typecheck      # tsc -b --noEmit
```

Husky + lint-staged run oxlint and Prettier on staged files automatically on commit.

## Build & deployment

Horizon deploys to **GitHub Pages** from `.github/workflows/deploy.yml` on every push to `main`:

1. **`build`** — install, lint, typecheck, unit test, `vite build`, then upload the `dist/` folder as a Pages artifact.
2. **`e2e`** — runs the full Playwright suite against a real build; this gates the deploy.
3. **`lighthouse`** — runs `lhci autorun` against the built app; informational, does not block deploy.
4. **`deploy`** — runs only after `build` and `e2e` succeed, and publishes to GitHub Pages.

The app is served from a `/horizon/` base path (`vite.config.ts`), with a `404.html` → `index.html` redirect script (the standard `spa-github-pages` pattern) so deep links like `/horizon/clocks` survive a hard refresh under `BrowserRouter`.

Current Lighthouse CI numbers (informational job, not yet all green): **Accessibility 1.00**, **SEO 1.00**, **Best Practices 0.96**, **Performance ~0.74**. Performance is bundle-size driven (Recharts is the next lever if pursued further) and is tracked as follow-up work, not something rounded up here.

← [Back to README](../README.md) · [User Guide](./USER_GUIDE.md)
