import Link from 'next/link'
import { ConsoleTour } from '@/components/console-tour'
import { LangToggle } from '@/components/lang-toggle'
import { SchemeToggle } from '@/components/scheme-toggle'
import { ShellNav } from '@/components/shell-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { dict } from '@/lib/i18n'
import { getLang } from '@/lib/lang'

/**
 * The operator console shell: one skeleton, three skins (see globals.css).
 * «instrumento» and «plano» render this aside as a left sidebar (nav on top,
 * preferences at the bottom); «libro» renders it as the book's title page.
 * Same order everywhere: brand, nav, prefs. Lives here (not in the root
 * layout) so the marketing landing at «/» stays free of the sidebar.
 */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang()
  const t = dict[lang]
  // Per-client branding for the one-instance-per-client model:
  // INSTANCE_NAME="Empresa X" renders as «Acuse · Empresa X».
  const instanceName = process.env.INSTANCE_NAME

  return (
    <div className="app-frame">
      <aside className="app-side">
        <div className="app-side-top">
          {/* With a client name, the client is the hero and Acuse signs
              small: this is their console, our tool. */}
          <Link href="/app" className="app-brand">
            {instanceName ? (
              <>
                {instanceName}
                <span className="text-faint"> · Acuse</span>
              </>
            ) : (
              'Acuse'
            )}
          </Link>
          <p className="app-tagline">{t.shell.tagline}</p>
        </div>
        <ShellNav
          items={[
            { href: '/app', label: t.shell.navDashboard },
            { href: '/app/events', label: t.shell.navEvents },
            { href: '/app/endpoints/new', label: t.shell.navNew },
          ]}
        />
        <div className="app-side-controls" data-tour="prefs">
          <ConsoleTour t={t.tour} />
          <ThemeToggle labels={t.shell.themeNames} />
          <SchemeToggle />
          <LangToggle current={lang} />
          <Link href="/guia" className="app-side-home">
            {t.guide.link}
          </Link>
          <Link href="/" className="app-side-home">
            {t.shell.backToSite}
          </Link>
        </div>
      </aside>
      <div className="app-body">
        <main className="app-main">{children}</main>
        <footer className="app-footer">
          {t.shell.demoNote} <code className="font-mono text-muted">npm run simulate</code>
        </footer>
      </div>
    </div>
  )
}
