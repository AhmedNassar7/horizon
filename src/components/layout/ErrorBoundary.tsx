import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

// Matches the error Vite/browsers throw when a lazy route's chunk no longer
// exists at its old hashed URL — the standard symptom of a tab left open
// across a redeploy, since every build gives changed files new content
// hashes. Re-rendering with the same stale import() can never fix this;
// only a fresh index.html (via reload) picks up the current chunk map.
const CHUNK_LOAD_ERROR_PATTERN =
  /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed/i
const RELOAD_FLAG_KEY = 'horizon:chunk-reload-attempted'

function isChunkLoadError(error: Error): boolean {
  return CHUNK_LOAD_ERROR_PATTERN.test(error.message)
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidMount() {
    // A successful mount means this page load is healthy — clear any flag
    // from a previous reload attempt so a *future* stale-chunk incident
    // (e.g. after the next deploy) still gets its one automatic retry.
    sessionStorage.removeItem(RELOAD_FLAG_KEY)
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Horizon crashed:', error, info.componentStack)

    if (isChunkLoadError(error) && !sessionStorage.getItem(RELOAD_FLAG_KEY)) {
      sessionStorage.setItem(RELOAD_FLAG_KEY, '1')
      window.location.reload()
    }
  }

  private reset = () => this.setState({ error: null })

  override render() {
    const { error } = this.state
    if (!error) return this.props.children

    // Briefly visible while the automatic reload above takes effect — a
    // dedicated message here beats flashing the raw technical error text.
    if (isChunkLoadError(error) && sessionStorage.getItem(RELOAD_FLAG_KEY)) {
      return (
        <output className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="font-display text-2xl">Updating Horizon…</p>
          <p className="text-muted-foreground text-sm">A new version is available.</p>
        </output>
      )
    }

    return (
      <div
        role="alert"
        className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center"
      >
        <p className="font-display text-2xl">Something went wrong</p>
        <p className="text-muted-foreground text-sm">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <Button onClick={this.reset}>Try again</Button>
      </div>
    )
  }
}
