import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CodeXml } from 'lucide-react'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-border/60 text-muted-foreground mt-auto border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-sm sm:flex-row sm:justify-between">
        <p>{t('footer.dataSource')}</p>
        <div className="flex items-center gap-4">
          <NavLink to="/about" className="hover:text-foreground">
            {t('nav.about')}
          </NavLink>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground flex items-center gap-1"
          >
            <CodeXml aria-hidden="true" className="size-4" />
            {t('footer.sourceCode')}
          </a>
        </div>
      </div>
    </footer>
  )
}
