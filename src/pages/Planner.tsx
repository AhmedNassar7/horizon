import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocationStore } from '@/store/locationStore'
import { useSettingsStore } from '@/store/settingsStore'
import { buildViewerDayTimeline, isBusinessHour } from '@/lib/meetingPlanner'
import { getLocalHour, resolveTimezone } from '@/lib/timezone'
import { cn } from '@/lib/utils'
import { SITE_URL, OG_IMAGE_URL } from '@/lib/seo'

export default function Planner() {
  const { t, i18n } = useTranslation()
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

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <title>{`${t('planner.title')} — ${t('app.name')}`}</title>
      <meta name="description" content={`${t('planner.title')} — ${t('app.tagline')}`} />
      <meta property="og:title" content={`${t('planner.title')} — ${t('app.name')}`} />
      <meta property="og:description" content={`${t('planner.title')} — ${t('app.tagline')}`} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${SITE_URL}/planner`} />
      <meta property="og:image" content={OG_IMAGE_URL} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${t('planner.title')} — ${t('app.name')}`} />
      <meta name="twitter:description" content={`${t('planner.title')} — ${t('app.tagline')}`} />
      <meta name="twitter:image" content={OG_IMAGE_URL} />

      {locations.length < 2 ? (
        <div className="mx-auto w-full max-w-2xl py-8 text-center">
          <p className="font-medium">{t('planner.needTwo')}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            <Link to="/clocks" className="text-primary underline underline-offset-2">
              {t('planner.saveLocations')}
            </Link>{' '}
            {t('planner.needTwoBody')}
          </p>
        </div>
      ) : (
        <>
          <h1 className="font-display text-2xl font-semibold">{t('planner.title')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('planner.subtitle')}</p>

          {/* A <section> with an accessible name has an implicit "region" role, and
              tabIndex here follows the WAI-ARIA APG "scrollable region" pattern so
              keyboard users can actually scroll this table horizontally. */}
          <section
            className="mt-6 overflow-x-auto"
            tabIndex={0} // oxlint-disable-line no-noninteractive-tabindex
            aria-label={t('planner.title')}
          >
            <table className="border-separate border-spacing-1 text-sm">
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 px-2 text-left font-medium">
                    {t('planner.location')}
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
                      {new Intl.DateTimeFormat(i18n.language, { hour: 'numeric', hour12 }).format(
                        instant,
                      )}
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
                            ? 'bg-success-surface text-success-text'
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
          </section>
        </>
      )}
    </div>
  )
}
