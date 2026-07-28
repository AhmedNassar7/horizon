import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { useLanguage } from '@/hooks/useLanguage'
import { Header } from './Header'
import { Footer } from './Footer'
import { RouteLoading } from './RouteLoading'
import { ErrorBoundary } from './ErrorBoundary'

export function Layout() {
  useLanguage()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex flex-1 flex-col">
        <ErrorBoundary>
          <Suspense fallback={<RouteLoading />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
