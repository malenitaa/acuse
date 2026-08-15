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
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="inline-block size-2.5 rounded-full bg-good shadow-[0_0_12px_var(--color-good)]"
              />
              <span className="text-[15px] font-semibold tracking-tight">Acuse</span>
            </Link>
            <p className="hidden text-[13px] text-faint sm:block">
              Guardián de integraciones
            </p>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-6 pb-10 pt-4 text-[12px] text-faint">
          Instancia de demostración · el tráfico lo genera{' '}
          <code className="font-mono text-muted">npm run simulate</code>
        </footer>
      </body>
    </html>
  )
}
