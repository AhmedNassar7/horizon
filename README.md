<div align="center">

# Horizon

**Weather and time, everywhere.**

A fast, installable, client-only weather + world-time PWA — no backend, no accounts.

[![Deploy](https://github.com/AhmedNassar7/horizon/actions/workflows/deploy.yml/badge.svg)](https://github.com/AhmedNassar7/horizon/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

**[Live demo →](https://ahmednassar7.github.io/horizon/)**

</div>

---

## Screenshots

| Desktop                                                                                                                                                                   | Mobile                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| ![Horizon dashboard on desktop, light theme, showing current conditions, hourly and 7-day forecast, and air quality for London](./docs/screenshots/dashboard-desktop.png) | ![Horizon dashboard on mobile, light theme, same data in a single-column responsive layout](./docs/screenshots/dashboard-mobile.png) |
| ![Global Earthquakes page on desktop: a world map of recent events color-coded by magnitude, filters, and safety guidance](./docs/screenshots/earthquakes-desktop.png)    | ![Earthquakes page on mobile, same map and filters in a single column](./docs/screenshots/earthquakes-mobile.png)                    |

<img src="./docs/screenshots/earthquakes-card.png" alt="Nearby earthquakes card on a location dashboard, showing magnitude, distance, and time since each event" width="360" />

_Live USGS data, not a mock._

## What it is

Horizon is a portfolio project built to look and behave like a production weather product (think MSN Weather / Google Weather), while staying 100% client-side — every request goes straight from the browser to a free, keyless public API, and every preference lives in `localStorage`. It bundles two things that are usually separate apps — a weather dashboard and a world-time toolkit — because they share the same core problem: _what is it like, right now, somewhere else._

## Architecture & data flow

Everything runs in the browser — there is no application server. UI components read/write two independent client-side stores: TanStack Query's cache for anything from an external API, and Zustand (persisted to `localStorage`) for user-owned state like saved locations and preferences.

```mermaid
flowchart LR
    User(("User"))

    subgraph Browser["Browser (client-only)"]
        UI["UI components\n(pages, weather/time widgets)"]
        Query["TanStack Query hooks\nuseWeather / useCitySearch / useGeolocation / useEarthquakes"]
        Zustand["Zustand stores\nlocationStore · settingsStore · timezoneStore"]
        i18nLib["i18next\n(language + RTL)"]
        Theme["Theme engine\n(light / dark / system)"]
        LS[("localStorage\nhorizon:locations\nhorizon:settings\nhorizon:timezone-selections")]
        SW["Service worker\n(Workbox, offline cache)"]
    end

    OpenMeteo["Open-Meteo\nforecast + air quality API"]
    Geocoding["Open-Meteo Geocoding\ncity search"]
    BigDataCloud["BigDataCloud\nreverse geocoding"]
    USGS["USGS\nearthquake reports"]

    User --> UI
    UI --> Query
    UI --> Zustand
    UI --> i18nLib
    UI --> Theme
    Query -- "fetch + Zod-validate" --> OpenMeteo
    Query -- "fetch + Zod-validate" --> Geocoding
    Query -- "fetch + Zod-validate" --> BigDataCloud
    Query -- "fetch + Zod-validate" --> USGS
    SW -. "NetworkFirst cache" .-> OpenMeteo
    SW -. "NetworkFirst cache" .-> BigDataCloud
    Zustand <--> LS
    Query -.->|"cached responses\n(in memory)"| UI
```

**Worth calling out:** `weatherProvider` is an adapter interface (`src/api/weatherProvider.ts`), not a direct call to Open-Meteo, so swapping the data source later wouldn't touch component code. Every fetch response is validated with Zod at the network boundary (`src/api/httpClient.ts`) — an unexpected API shape fails loudly instead of silently corrupting UI state. User data lives only in `localStorage` under `horizon:*` keys and is never sent anywhere. Separately, the site does use Google Analytics for anonymous traffic insights (`src/lib/analytics.ts`, opt-out by simply not configuring `VITE_GA_MEASUREMENT_ID`) — it has no access to `localStorage` and never sees saved locations or preferences.

## Highlights

- **Weather** — current conditions, hourly + 7-day forecast, air quality, sunrise/sunset & moon phase, severity-coded advisories, multi-location compare
- **Earthquakes** — global map + list of recent events from **USGS**, magnitude/time filters, a "near you" card per saved location, and a safety checklist — reporting only, never a prediction or early-warning claim
- **Time** — live world clocks, meeting planner (business-hour overlap across cities), time-difference calculator, timers & stopwatch
- **Platform** — installable offline-capable PWA, 5 languages including Arabic (RTL), light/dark/system theme, metric/imperial units

Full walkthrough → [User Guide](./docs/USER_GUIDE.md)

## Quick start

```bash
npm install
npm run dev
```

Full setup, testing, linting, and deploy details → [Developer Guide](./docs/DEVELOPER_GUIDE.md)

## Learn more

- 📖 [User Guide](./docs/USER_GUIDE.md) — how to use every feature
- 🛠️ [Developer Guide](./docs/DEVELOPER_GUIDE.md) — local setup, testing, build & deployment, project structure

## License

[MIT](./LICENSE) © 2026 Ahmed Nassar
