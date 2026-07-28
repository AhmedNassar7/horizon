const DATA_SOURCES = [
  {
    name: 'Open-Meteo',
    use: 'Current conditions, hourly/daily forecast, air quality, weather alerts',
    url: 'https://open-meteo.com',
  },
  {
    name: 'Open-Meteo Geocoding',
    use: 'City search and coordinates',
    url: 'https://open-meteo.com/en/docs/geocoding-api',
  },
  {
    name: 'BigDataCloud',
    use: 'Reverse geocoding and IP-based location fallback',
    url: 'https://www.bigdatacloud.com/',
  },
]

export default function About() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">About Horizon</h1>
      <p className="text-muted-foreground mt-3">
        Horizon is a free, client-only weather and world-time app. Everything runs in your browser —
        there is no backend, no account, and nothing is tracked.
      </p>

      <h2 className="font-display mt-8 text-xl font-semibold">Data sources</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {DATA_SOURCES.map((source) => (
          <li key={source.name} className="glass-card p-4">
            <p className="font-medium">{source.name}</p>
            <p className="text-muted-foreground text-sm">{source.use}</p>
          </li>
        ))}
      </ul>

      <h2 className="font-display mt-8 text-xl font-semibold">Privacy</h2>
      <p className="text-muted-foreground mt-3">
        No accounts, no cookies, no analytics trackers. Your saved locations and preferences are
        stored only in your browser's local storage.
      </p>
    </div>
  )
}
