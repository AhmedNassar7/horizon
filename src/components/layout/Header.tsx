import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Compass, Sun, Moon, MonitorCog } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ThemeMode } from '@/store/settingsStore'

const THEME_CYCLE: ThemeMode[] = ['auto', 'light', 'dark']
const THEME_ICON = { auto: MonitorCog, light: Sun, dark: Moon } as const

const NAV_ITEMS = [
  { to: '/', key: 'home' as const },
  { to: '/clocks', key: 'clocks' as const },
  { to: '/planner', key: 'planner' as const },
  { to: '/timers', key: 'timers' as const },
]

export function Header() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const ThemeIcon = THEME_ICON[theme]

  const cycleTheme = () => {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length]
    setTheme(next ?? 'auto')
  }

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <a
        href="#main-content"
        className="focus:bg-background focus:text-foreground sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:shadow-lg"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <NavLink to="/" className="font-display flex items-center gap-2 text-lg font-semibold">
          <Compass className="text-primary size-5" aria-hidden="true" />
          {t('app.name')}
        </NavLink>

        <nav aria-label="Primary" className="ml-2 hidden gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {t(`nav.${item.key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Theme: ${t(`theme.${theme}`)}. Activate to change.`}
            onClick={cycleTheme}
          >
            <ThemeIcon aria-hidden="true" className="size-4" />
          </Button>
          <NavLink to="/settings" className="text-muted-foreground hover:text-foreground">
            {({ isActive }) => (
              <Button variant={isActive ? 'secondary' : 'ghost'} size="sm">
                {t('nav.settings')}
              </Button>
            )}
          </NavLink>
        </div>
      </div>

      <nav
        aria-label="Primary mobile"
        className="border-border/60 flex gap-1 overflow-x-auto border-t px-4 py-2 md:hidden"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap',
                isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground',
              )
            }
          >
            {t(`nav.${item.key}`)}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
