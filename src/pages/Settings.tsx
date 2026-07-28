import { useTranslation } from 'react-i18next'
import {
  useSettingsStore,
  type ThemeMode,
  type TemperatureUnit,
  type TimeFormat,
  type WindUnit,
} from '@/store/settingsStore'
import { useLanguage } from '@/hooks/useLanguage'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  const { t } = useTranslation()
  const settings = useSettingsStore()
  const { language, setLanguage, languages } = useLanguage()

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <title>{`${t('settings.title')} — ${t('app.name')}`}</title>

      <h1 className="font-display text-3xl font-semibold">{t('settings.title')}</h1>

      <div className="mt-8 flex flex-col gap-6">
        <SettingRow title={t('settings.theme')} description={t('settings.themeBody')}>
          <ToggleGroup
            type="single"
            variant="outline"
            value={settings.theme}
            onValueChange={(value) => value && settings.setTheme(value as ThemeMode)}
            aria-label={t('settings.theme')}
          >
            <ToggleGroupItem value="auto">{t('theme.auto')}</ToggleGroupItem>
            <ToggleGroupItem value="light">{t('theme.light')}</ToggleGroupItem>
            <ToggleGroupItem value="dark">{t('theme.dark')}</ToggleGroupItem>
          </ToggleGroup>
        </SettingRow>

        <SettingRow title={t('settings.language')} description={t('settings.languageBody')}>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger aria-label={t('settings.language')} className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow title={t('settings.temperature')} description={t('settings.temperatureBody')}>
          <ToggleGroup
            type="single"
            variant="outline"
            value={settings.temperatureUnit}
            onValueChange={(value) =>
              value && settings.setTemperatureUnit(value as TemperatureUnit)
            }
            aria-label={t('settings.temperature')}
          >
            <ToggleGroupItem value="celsius">°C</ToggleGroupItem>
            <ToggleGroupItem value="fahrenheit">°F</ToggleGroupItem>
          </ToggleGroup>
        </SettingRow>

        <SettingRow title={t('settings.clockFormat')} description={t('settings.clockFormatBody')}>
          <ToggleGroup
            type="single"
            variant="outline"
            value={settings.timeFormat}
            onValueChange={(value) => value && settings.setTimeFormat(value as TimeFormat)}
            aria-label={t('settings.clockFormat')}
          >
            <ToggleGroupItem value="24h">24h</ToggleGroupItem>
            <ToggleGroupItem value="12h">12h</ToggleGroupItem>
          </ToggleGroup>
        </SettingRow>

        <SettingRow title={t('settings.windSpeed')} description={t('settings.windSpeedBody')}>
          <ToggleGroup
            type="single"
            variant="outline"
            value={settings.windUnit}
            onValueChange={(value) => value && settings.setWindUnit(value as WindUnit)}
            aria-label={t('settings.windSpeed')}
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
