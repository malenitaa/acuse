import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'Acuse — ningún evento se pierde',
  description:
    'Recibe los webhooks de tus integraciones, reintenta los que fallan y te muestra cuántos rescató.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <header className="border-b-3 border-double border-line">
          <div className="mx-auto flex max-w-6xl items-baseline gap-4 px-6 py-4">
            <Link href="/" className="font-serif text-xl font-semibold tracking-tight">
              Acuse
            </Link>
            <p className="hidden font-serif text-[14px] italic text-faint sm:block">
              registro de entregas — ningún evento se pierde
            </p>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl border-t border-line-soft px-6 pb-10 pt-4 text-[12px] text-faint">
          Instancia de demostración · el tráfico lo genera{' '}
          <code className="font-mono text-muted">npm run simulate</code>
        </footer>
      </body>
    </html>
  )
}
