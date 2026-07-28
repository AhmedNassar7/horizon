import { Sun, Moon, X } from 'lucide-react'
import { formatUtcOffset, getDayOffset, getLocalHour, resolveTimezone } from '@/lib/timezone'
import { Button } from '@/components/ui/button'
import { Clock } from '@/components/time/Clock'
import type { SavedLocation } from '@/store/locationStore'

function dayOffsetLabel(offset: number): string | null {
  if (offset === 0) return null
  if (offset === 1) return 'Tomorrow'
  if (offset === -1) return 'Yesterday'
  return offset > 0 ? `+${offset}d` : `${offset}d`
}

export function WorldClockCard({
  location,
  now,
  onRemove,
}: {
  location: SavedLocation
  now: Date
  onRemove: () => void
}) {
  const timezone = resolveTimezone(location.latitude, location.longitude)
  const localHour = getLocalHour(now, timezone)
  const isDay = localHour >= 6 && localHour < 18
  const dayLabel = dayOffsetLabel(getDayOffset(timezone, now))

  return (
    <div className="glass-card relative flex flex-col gap-2 p-5">
      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute top-2 right-2"
        onClick={onRemove}
        aria-label={`Remove ${location.name} from world clocks`}
      >
        <X aria-hidden="true" className="size-4" />
      </Button>

      <div className="flex items-center gap-2">
        {isDay ? (
          <Sun aria-hidden="true" className="size-4 text-amber-500" />
        ) : (
          <Moon aria-hidden="true" className="text-ocean-400 size-4" />
        )}
        <p className="font-medium">{location.name}</p>
      </div>
      <p className="text-muted-foreground text-xs">
        {[location.admin1, location.country].filter(Boolean).join(', ')}
      </p>

      <Clock timezone={timezone} />

      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <span className="bg-muted rounded px-1.5 py-0.5 font-medium">
          {formatUtcOffset(timezone, now)}
        </span>
        {dayLabel && <span className="bg-muted rounded px-1.5 py-0.5 font-medium">{dayLabel}</span>}
      </div>
    </div>
  )
}
