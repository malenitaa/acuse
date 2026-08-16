import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { LangToggle } from '@/components/lang-toggle'
import { ThemeToggle } from '@/components/theme-toggle'
import { dict } from '@/lib/i18n'
import { getLang } from '@/lib/lang'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  return dict[lang].meta
}

/**
 * One skeleton, two skins (see globals.css): «instrumento» renders it as a
 * full-width console, «libro» as a sheet of paper on a desk. The inline
 * script re-applies the visitor's stored choice before anything paints.
 * Language comes from a cookie, so the server renders it translated.
 */
// Runs once from the raw HTML, before paint and before hydration. React warns
// in dev that it will never re-execute this on client renders — that is the
// point: it must run exactly once, first. (Same pattern as next-themes.)
const themeInit = `try{var t=localStorage.getItem('acuse-theme');if(t==='libro'||t==='instrumento'){document.documentElement.dataset.theme=t}}catch(e){}`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang()
  const t = dict[lang]

  return (
    <html lang={lang} data-theme="instrumento" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInit}
        </Script>
        <div className="app-frame">
          <header className="app-header">
            <Link href="/" className="app-brand">
              Acuse
            </Link>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <p className="app-tagline">{t.shell.tagline}</p>
              <ThemeToggle labels={t.shell.themeNames} />
              <LangToggle current={lang} />
            </div>
          </header>
          <main className="app-main">{children}</main>
          <footer className="app-footer">
            {t.shell.demoNote} <code className="font-mono text-muted">npm run simulate</code>
          </footer>
        </div>
      </body>
    </html>
  )
}
