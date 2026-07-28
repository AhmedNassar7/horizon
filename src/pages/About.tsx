import { useTranslation } from 'react-i18next'

const DATA_SOURCE_KEYS = ['openMeteo', 'openMeteoGeocoding', 'bigDataCloud'] as const

export default function About() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <title>{`${t('about.title')} — ${t('app.name')}`}</title>

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
