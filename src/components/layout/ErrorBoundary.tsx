import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Horizon crashed:', error, info.componentStack)
  }

  private reset = () => this.setState({ error: null })

  override render() {
    if (!this.state.error) return this.props.children

    return (
      <div
        role="alert"
        className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center"
      >
        <p className="font-display text-2xl">Something went wrong</p>
        <p className="text-muted-foreground text-sm">
          {this.state.error.message || 'An unexpected error occurred.'}
        </p>
        <Button onClick={this.reset}>Try again</Button>
      </div>
    )
  }
}
