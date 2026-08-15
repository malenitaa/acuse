import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'Acuse — ningún evento se pierde',
  description:
    'Recibe los webhooks de tus integraciones, reintenta los que fallan y te muestra cuántos rescató.',
}

/**
 * The whole app renders as one continuous sheet of paper on a desk — a
 * letterhead, ruled sections, a colophon. No floating cards: a record book
 * is a single document, and the layout should read like one.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen px-3 py-5 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-4xl border border-line bg-panel shadow-[0_1px_2px_rgba(32,27,18,0.18)]">
          <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-3 border-double border-line px-6 py-5">
            <Link href="/" className="font-serif text-2xl font-semibold tracking-tight">
              Acuse
            </Link>
            <p className="font-serif text-[14px] italic text-faint">
              registro de entregas — ningún evento se pierde
            </p>
          </header>
          <main>{children}</main>
          <footer className="border-t border-line-soft px-6 py-4 text-[12px] text-faint">
            Instancia de demostración · el tráfico lo genera{' '}
            <code className="font-mono text-muted">npm run simulate</code>
          </footer>
        </div>
      </body>
    </html>
  )
}
