import { useTranslation } from 'react-i18next'
import { SITE_URL, OG_IMAGE_URL } from '@/lib/seo'

const DATA_SOURCE_KEYS = ['openMeteo', 'openMeteoGeocoding', 'bigDataCloud', 'usgs'] as const

export default function About() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <title>{`${t('about.title')} — ${t('app.name')}`}</title>
      <meta name="description" content={t('about.intro')} />
      <meta property="og:title" content={`${t('about.title')} — ${t('app.name')}`} />
      <meta property="og:description" content={t('about.intro')} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${SITE_URL}/about`} />
      <meta property="og:image" content={OG_IMAGE_URL} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${t('about.title')} — ${t('app.name')}`} />
      <meta name="twitter:description" content={t('about.intro')} />
      <meta name="twitter:image" content={OG_IMAGE_URL} />

      <h1 className="font-display text-3xl font-semibold">{t('about.title')}</h1>
      <p className="text-muted-foreground mt-3">{t('about.intro')}</p>

      <h2 className="font-display mt-8 text-xl font-semibold">{t('about.dataSources')}</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {DATA_SOURCE_KEYS.map((key) => (
          <li key={key} className="glass-card p-4">
            <p className="font-medium">{t(`about.sources.${key}.name`)}</p>
            <p className="text-muted-foreground text-sm">{t(`about.sources.${key}.use`)}</p>
          </li>
        ))}
      </ul>

      <h2 className="font-display mt-8 text-xl font-semibold">{t('about.privacy')}</h2>
      <p className="text-muted-foreground mt-3">{t('about.privacyBody')}</p>
    </div>
  )
}
