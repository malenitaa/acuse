import type { Metadata } from 'next'
import Script from 'next/script'
import { dict } from '@/lib/i18n'
import { getLang } from '@/lib/lang'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  return dict[lang].meta
}

/**
 * The root layout is now only the document and the theming boot: the landing
 * («/») paints itself edge to edge, while the operator console («/app») wraps
 * its children in the sidebar shell from its own layout. Everything below
 * still shares one set of tokens and the same three-theme switch.
 */
// Runs once from the raw HTML, before paint and before hydration. React warns
// in dev that it will never re-execute this on client renders; that is the
// point: it must run exactly once, first. (Same pattern as next-themes.)
// Theme comes from storage; the light/dark scheme falls back to the system
// preference on first visit. URL params (?theme=libro&scheme=dark) override
// both, handy for screenshots, demos and support links.
const themeInit = `try{var d=document.documentElement,q=new URLSearchParams(location.search),t=q.get('theme')||localStorage.getItem('acuse-theme');if(t==='libro'||t==='instrumento'||t==='plano'){d.dataset.theme=t}var s=q.get('scheme')||localStorage.getItem('acuse-scheme');if(s!=='light'&&s!=='dark'){s=window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.dataset.scheme=s}catch(e){}`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang()

  return (
    <html lang={lang} data-theme="instrumento" data-scheme="dark" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInit}
        </Script>
        {children}
      </body>
    </html>
  )
}
