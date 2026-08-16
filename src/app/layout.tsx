import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { LangToggle } from '@/components/lang-toggle'
import { SchemeToggle } from '@/components/scheme-toggle'
import { ShellNav } from '@/components/shell-nav'
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
// Theme comes from storage; the light/dark scheme falls back to the system
// preference on first visit. URL params (?theme=libro&scheme=dark) override
// both — handy for screenshots, demos and support links.
const themeInit = `try{var d=document.documentElement,q=new URLSearchParams(location.search),t=q.get('theme')||localStorage.getItem('acuse-theme');if(t==='libro'||t==='instrumento'){d.dataset.theme=t}var s=q.get('scheme')||localStorage.getItem('acuse-scheme');if(s!=='light'&&s!=='dark'){s=window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.dataset.scheme=s}catch(e){}`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang()
  const t = dict[lang]
  // Per-client branding for the one-instance-per-client model:
  // INSTANCE_NAME="Empresa X" renders as «Acuse · Empresa X».
  const instanceName = process.env.INSTANCE_NAME

  return (
    <html lang={lang} data-theme="instrumento" data-scheme="dark" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInit}
        </Script>
        {/* Viewing preferences live on the "desk", outside whichever skeleton
            the theme draws — same screen corner in both themes. */}
        <div className="app-controls">
          <ThemeToggle labels={t.shell.themeNames} />
          <SchemeToggle />
          <LangToggle current={lang} />
        </div>
        <div className="app-frame">
          <header className="app-header">
            <Link href="/" className="app-brand">
              Acuse
              {instanceName ? <span className="text-muted"> · {instanceName}</span> : null}
            </Link>
            <p className="app-tagline">{t.shell.tagline}</p>
          </header>
          <ShellNav
            items={[
              { href: '/', label: t.shell.navDashboard },
              { href: '/events', label: t.shell.navEvents },
              { href: '/endpoints/new', label: t.shell.navNew },
            ]}
          />
          <main className="app-main">{children}</main>
          <footer className="app-footer">
            {t.shell.demoNote} <code className="font-mono text-muted">npm run simulate</code>
          </footer>
        </div>
      </body>
    </html>
  )
}
