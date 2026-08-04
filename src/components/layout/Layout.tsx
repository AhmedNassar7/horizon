import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useLanguage } from '@/hooks/useLanguage'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Header } from './Header'
import { Footer } from './Footer'
import { RouteLoading } from './RouteLoading'
import { ErrorBoundary } from './ErrorBoundary'

export function Layout() {
  useLanguage()
  useAnalytics()
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex flex-1 flex-col">
        <ErrorBoundary>
          <Suspense fallback={<RouteLoading />}>
            {/* Keyed on pathname (not the full location object, so query-string-only
                changes don't retrigger it) so React remounts this wrapper — and
                therefore replays the CSS enter animation — on every route change.
                CSS-only (tw-animate-css), no framer-motion: Layout is eagerly
                bundled, so a JS animation library here would land in the main
                chunk. prefers-reduced-motion is handled for free by the global
                animation-duration override in index.css. */}
            <div key={pathname} className="animate-in fade-in ease-expo-out duration-200">
              <Outlet />
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
