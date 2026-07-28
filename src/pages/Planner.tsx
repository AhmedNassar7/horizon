import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLocationStore } from '@/store/locationStore'
import { useSettingsStore } from '@/store/settingsStore'
import { buildViewerDayTimeline, isBusinessHour } from '@/lib/meetingPlanner'
import { getLocalHour, resolveTimezone } from '@/lib/timezone'
import { cn } from '@/lib/utils'

export default function Planner() {
  const locations = useLocationStore((s) => s.locations)
  const timeFormat = useSettingsStore((s) => s.timeFormat)
  const hour12 = timeFormat === '12h'

  const timeline = useMemo(() => buildViewerDayTimeline(), [])
  const nowHourIndex = new Date().getHours()

  const rows = useMemo(
    () =>
      locations.map((location) => {
        const timezone = resolveTimezone(location.latitude, location.longitude)
        return {
          location,
          timezone,
          hours: timeline.map((instant) => getLocalHour(instant, timezone)),
        }
      }),
    [locations, timeline],
  )

  const overlapColumns = timeline.map(
    (_, columnIndex) =>
      rows.length > 0 && rows.every((row) => isBusinessHour(row.hours[columnIndex] ?? -1)),
  )

  if (locations.length < 2) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
        <p className="font-medium">Add at least two locations to plan a meeting</p>
        <p className="text-muted-foreground mt-1 text-sm">
          <Link to="/clocks" className="text-primary underline underline-offset-2">
            Save some locations
          </Link>{' '}
          to see when everyone's awake and working.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl font-semibold">Meeting planner</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Each column is an hour of your day. Green means business hours (9am–5pm) at that location;
        the highlighted column is a good time for everyone.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 px-2 text-left font-medium">
                Location
              </th>
              {timeline.map((instant, index) => (
                <th
                  key={instant.toISOString()}
                  scope="col"
                  className={cn(
                    'text-muted-foreground min-w-9 px-1 py-1 text-center text-xs font-normal',
                    index === nowHourIndex && 'text-foreground font-semibold',
                  )}
                >
                  {new Intl.DateTimeFormat('en', { hour: 'numeric', hour12 }).format(instant)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ location, hours }) => (
              <tr key={location.id}>
                <th
                  scope="row"
                  className="sticky left-0 px-2 py-1 text-left font-medium whitespace-nowrap"
                >
                  {location.name}
                </th>
                {hours.map((hour, index) => (
                  <td
                    key={index}
                    className={cn(
                      'min-w-9 rounded px-1 py-1.5 text-center tabular-nums',
                      isBusinessHour(hour)
                        ? 'bg-success/25 text-success'
                        : 'bg-muted/50 text-muted-foreground',
                      overlapColumns[index] && 'ring-primary ring-2',
                      index === nowHourIndex &&
                        'outline-foreground/40 outline outline-offset-[-2px]',
                    )}
                  >
                    {hour}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
