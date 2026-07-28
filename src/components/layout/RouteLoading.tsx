export function RouteLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>
      <div className="bg-muted h-40 animate-pulse rounded-[var(--radius-card)]" />
      <div className="bg-muted h-24 animate-pulse rounded-[var(--radius-card)]" />
      <div className="bg-muted h-24 animate-pulse rounded-[var(--radius-card)]" />
    </div>
  )
}
