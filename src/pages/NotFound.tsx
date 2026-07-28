import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { CloudOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <Helmet>
        <title>
          {t('notFound.title')} — {t('app.name')}
        </title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <CloudOff aria-hidden="true" className="text-muted-foreground size-12" />
      <h1 className="font-display text-2xl font-semibold">{t('notFound.title')}</h1>
      <p className="text-muted-foreground">{t('notFound.body')}</p>
      <Button asChild>
        <Link to="/">{t('notFound.backHome')}</Link>
      </Button>
    </div>
  )
}
