import {
  useSettingsStore,
  type ThemeMode,
  type TemperatureUnit,
  type TimeFormat,
  type WindUnit,
} from '@/store/settingsStore'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

function SettingRow({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-medium">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {children}
    </section>
  )
}

export default function Settings() {
  const settings = useSettingsStore()

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Settings</h1>

      <div className="mt-8 flex flex-col gap-6">
        <SettingRow title="Theme" description="Light, dark, or match your system.">
          <ToggleGroup
            type="single"
            variant="outline"
            value={settings.theme}
            onValueChange={(value) => value && settings.setTheme(value as ThemeMode)}
            aria-label="Theme"
          >
            <ToggleGroupItem value="auto">System</ToggleGroupItem>
            <ToggleGroupItem value="light">Light</ToggleGroupItem>
            <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
          </ToggleGroup>
        </SettingRow>

        <SettingRow title="Temperature" description="Celsius or Fahrenheit.">
          <ToggleGroup
            type="single"
            variant="outline"
            value={settings.temperatureUnit}
            onValueChange={(value) =>
              value && settings.setTemperatureUnit(value as TemperatureUnit)
            }
            aria-label="Temperature unit"
          >
            <ToggleGroupItem value="celsius">°C</ToggleGroupItem>
            <ToggleGroupItem value="fahrenheit">°F</ToggleGroupItem>
          </ToggleGroup>
        </SettingRow>

        <SettingRow title="Clock format" description="24-hour or 12-hour time.">
          <ToggleGroup
            type="single"
            variant="outline"
            value={settings.timeFormat}
            onValueChange={(value) => value && settings.setTimeFormat(value as TimeFormat)}
            aria-label="Clock format"
          >
            <ToggleGroupItem value="24h">24h</ToggleGroupItem>
            <ToggleGroupItem value="12h">12h</ToggleGroupItem>
          </ToggleGroup>
        </SettingRow>

        <SettingRow title="Wind speed" description="Unit used for wind readings.">
          <ToggleGroup
            type="single"
            variant="outline"
            value={settings.windUnit}
            onValueChange={(value) => value && settings.setWindUnit(value as WindUnit)}
            aria-label="Wind speed unit"
          >
            <ToggleGroupItem value="kmh">km/h</ToggleGroupItem>
            <ToggleGroupItem value="mph">mph</ToggleGroupItem>
            <ToggleGroupItem value="kn">kn</ToggleGroupItem>
          </ToggleGroup>
        </SettingRow>
      </div>
    </div>
  )
}
