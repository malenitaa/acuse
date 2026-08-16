import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { ThemeToggle } from '@/components/theme-toggle'
import './globals.css'

export const metadata: Metadata = {
  title: 'Acuse — ningún evento se pierde',
  description:
    'Recibe los webhooks de tus integraciones, reintenta los que fallan y te muestra cuántos rescató.',
}

/**
 * One skeleton, two skins (see globals.css): «instrumento» renders it as a
 * full-width console, «libro» as a sheet of paper on a desk. The inline
 * script re-applies the visitor's stored choice before anything paints.
 */
// Runs once from the raw HTML, before paint and before hydration. React warns
// in dev that it will never re-execute this on client renders — that is the
// point: it must run exactly once, first. (Same pattern as next-themes.)
const themeInit = `try{var t=localStorage.getItem('acuse-theme');if(t==='libro'||t==='instrumento'){document.documentElement.dataset.theme=t}}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="instrumento" suppressHydrationWarning>
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
              <p className="app-tagline">registro de entregas — ningún evento se pierde</p>
              <ThemeToggle />
            </div>
          </header>
          <main className="app-main">{children}</main>
          <footer className="app-footer">
            Instancia de demostración · el tráfico lo genera{' '}
            <code className="font-mono text-muted">npm run simulate</code>
          </footer>
        </div>
      </body>
    </html>
  )
}
