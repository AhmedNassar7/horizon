import { Sunrise, Sunset } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { formatTimeInZone } from '@/lib/timezone'
import { getMoonPhase } from '@/lib/moonPhase'
import type { DailyForecastPoint } from '@/schemas/weather'

export function SunAndMoon({ today, timezone }: { today: DailyForecastPoint; timezone: string }) {
  const timeFormat = useSettingsStore((s) => s.timeFormat)
  const hour12 = timeFormat === '12h'
  const moon = getMoonPhase(new Date())

  return (
    <section aria-label="Sun and moon" className="glass-card flex flex-wrap gap-6 p-6">
      <div className="flex items-center gap-3">
        <Sunrise aria-hidden="true" className="size-6 text-amber-500" />
        <div>
          <p className="text-muted-foreground text-xs">Sunrise</p>
          <p className="font-medium tabular-nums">
            {formatTimeInZone(new Date(today.sunrise), timezone, {
              hour: 'numeric',
              minute: '2-digit',
              hour12,
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Sunset aria-hidden="true" className="size-6 text-amber-600" />
        <div>
          <p className="text-muted-foreground text-xs">Sunset</p>
          <p className="font-medium tabular-nums">
            {formatTimeInZone(new Date(today.sunset), timezone, {
              hour: 'numeric',
              minute: '2-digit',
              hour12,
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="text-2xl leading-none">
          {moon.emoji}
        </span>
        <div>
          <p className="text-muted-foreground text-xs">Moon phase</p>
          <p className="font-medium">{moon.name}</p>
        </div>
      </div>
    </section>
  )
}
