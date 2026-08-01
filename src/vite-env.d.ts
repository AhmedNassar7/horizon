/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * GA4 Measurement ID (format `G-XXXXXXXXXX`). Optional — see
   * src/lib/analytics.ts and .env.example. Leaving it unset disables
   * analytics entirely.
   */
  readonly VITE_GA_MEASUREMENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
