import { NavLink } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { CodeXml } from 'lucide-react'

const REPO_URL = 'https://github.com/AhmedNassar7/horizon'
const AUTHOR_URL = 'https://github.com/AhmedNassar7'
const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-border/60 text-muted-foreground mt-auto border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p>{t('footer.dataSource')}</p>
          <div className="flex items-center gap-4">
            <NavLink to="/about" className="hover:text-foreground">
              {t('nav.about')}
            </NavLink>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground flex items-center gap-1"
            >
              <CodeXml aria-hidden="true" className="size-4" />
              {t('footer.sourceCode')}
            </a>
          </div>
        </div>

        <div className="border-border/40 flex flex-col items-center gap-1 border-t pt-4 text-xs sm:flex-row sm:justify-between">
          <p>
            © {year} {t('app.name')} —{' '}
            <Trans
              i18nKey="footer.builtBy"
              values={{ name: 'Ahmed Nassar' }}
              components={{
                author: (
                  <a
                    href={AUTHOR_URL}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Ahmed Nassar"
                    className="hover:text-foreground underline underline-offset-2"
                  />
                ),
              }}
            />
          </p>
          <a href={LICENSE_URL} target="_blank" rel="noreferrer" className="hover:text-foreground">
            {t('footer.license')}
          </a>
        </div>
      </div>
    </footer>
  )
}
