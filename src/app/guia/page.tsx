import type { Metadata } from 'next'
import Link from 'next/link'
import { CopyButton } from '@/components/copy-button'
import { LangToggle } from '@/components/lang-toggle'
import { SchemeToggle } from '@/components/scheme-toggle'
import { ThemeToggle } from '@/components/theme-toggle'
import { dict } from '@/lib/i18n'
import { getLang } from '@/lib/lang'

const GITHUB = 'https://github.com/malenitaa/acuse'

// Language-agnostic commands, kept out of i18n so there is one copy to trust.
const INSTALL = `git clone https://github.com/malenitaa/acuse.git
cd acuse
docker compose up -d`
const DEST_OK = 'http://localhost:3000/api/demo-sink?mode=ok'
const CURL = `curl -X POST http://localhost:3000/api/i/<tu-clave> \\
  -H 'content-type: application/json' \\
  -d '{"order": 42, "total": "19.99"}'`
const DEST_RECOVER = 'http://localhost:3000/api/demo-sink?mode=recover&after=3'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const g = dict[lang].guide
  return { title: `${g.title} · Acuse`, description: g.intro }
}

/**
 * The «/guia» page: the quickstart as a designed, linkable page, for people
 * who want to read it through rather than be walked around the console. It is
 * the static counterpart to the in-console tour, and shares the landing's
 * tokens and chrome. Public, like the landing — the console lock never
 * reaches it (see proxy.ts).
 */
export default async function GuidePage() {
  const lang = await getLang()
  const t = dict[lang]
  const g = t.guide
  const copy = { label: t.actions.copy, done: t.actions.copied }

  return (
    <div className="lp">
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-brand">
            <img src="/mark.png" alt="" width={26} height={26} className="lp-brand-mark" />
            Acuse
          </Link>
          <nav className="lp-nav-links" aria-label={g.tocTitle}>
            <Link href="/">{lang === 'es' ? 'Inicio' : 'Home'}</Link>
            <a href={GITHUB} target="_blank" rel="noreferrer">
              {t.landing.nav.github}
            </a>
          </nav>
          <div className="lp-nav-right">
            <div className="lp-toggles">
              <ThemeToggle labels={t.shell.themeNames} />
              <SchemeToggle />
              <LangToggle current={lang} />
            </div>
            <Link href="/app" className="lp-cta">
              {t.landing.nav.console}
            </Link>
          </div>
        </div>
      </header>

      <main className="gd">
        <div className="gd-head">
          <p className="lp-eyebrow">{g.eyebrow}</p>
          <h1 className="gd-title">{g.title}</h1>
          <p className="gd-intro">{g.intro}</p>
        </div>

        <nav className="gd-toc" aria-label={g.tocTitle}>
          <p className="gd-toc-title">{g.tocTitle}</p>
          <ol className="gd-toc-list">
            <li>
              <a href="#req">{g.toc.req}</a>
            </li>
            <li>
              <a href="#install">{g.toc.install}</a>
            </li>
            <li>
              <a href="#create">{g.toc.create}</a>
            </li>
            <li>
              <a href="#send">{g.toc.send}</a>
            </li>
            <li>
              <a href="#rescue">{g.toc.rescue}</a>
            </li>
            <li>
              <a href="#verify">{g.toc.verify}</a>
            </li>
          </ol>
        </nav>

        <article className="gd-body">
          {/* Before you start */}
          <section id="req" className="gd-step">
            <h2 className="gd-h2">{g.req.title}</h2>
            <p className="gd-p">{g.req.body}</p>
            <p className="gd-callout">{g.req.safety}</p>
          </section>

          {/* Install */}
          <section id="install" className="gd-step">
            <h2 className="gd-h2">
              <span className="gd-num">1</span>
              {g.install.title}
            </h2>
            <p className="gd-p">{g.install.body}</p>
            <CodeBlock code={INSTALL} lang="bash" copy={copy} />
            <p className="gd-note">{g.install.after}</p>
          </section>

          {/* Create */}
          <section id="create" className="gd-step">
            <h2 className="gd-h2">
              <span className="gd-num">2</span>
              {g.create.title}
            </h2>
            <p className="gd-p">{g.create.body}</p>
            <CodeBlock code={DEST_OK} lang="url" copy={copy} />
            <p className="gd-note">{g.create.after}</p>
          </section>

          {/* Send */}
          <section id="send" className="gd-step">
            <h2 className="gd-h2">
              <span className="gd-num">3</span>
              {g.send.title}
            </h2>
            <p className="gd-p">{g.send.body}</p>
            <CodeBlock code={CURL} lang="bash" copy={copy} />
            <p className="gd-note">{g.send.alt}</p>
          </section>

          {/* Rescue */}
          <section id="rescue" className="gd-step">
            <h2 className="gd-h2">
              <span className="gd-num">4</span>
              {g.rescue.title}
            </h2>
            <p className="gd-p">{g.rescue.body}</p>
            <CodeBlock code={DEST_RECOVER} lang="url" copy={copy} />
            <p className="gd-note">{g.rescue.after}</p>
            <div className="gd-shot">
              <img
                src="/console-instrument-dark.png"
                alt={t.landing.showcase.caption}
                width={2400}
                height={1500}
              />
            </div>
          </section>

          {/* Verify */}
          <section id="verify" className="gd-step">
            <h2 className="gd-h2">
              <span className="gd-num">5</span>
              {g.verify.title}
            </h2>
            <p className="gd-p">{g.verify.body}</p>
          </section>

          {/* Themes */}
          <section className="gd-step">
            <h2 className="gd-h2">{g.themes.title}</h2>
            <p className="gd-p">{g.themes.body}</p>
          </section>

          {/* CTA */}
          <section className="gd-cta">
            <h2 className="lp-h2">{g.cta.title}</h2>
            <p className="gd-p">{g.cta.body}</p>
            <div className="gd-cta-actions">
              <Link href="/app?tour=1" className="lp-cta lp-cta-lg">
                {g.cta.tour} <span aria-hidden="true">◎</span>
              </Link>
              <Link href="/app" className="lp-ghost lp-ghost-lg">
                {g.cta.console}
              </Link>
            </div>
          </section>
        </article>
      </main>

      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div>
            <Link href="/" className="lp-brand">
              <img src="/mark.png" alt="" width={22} height={22} className="lp-brand-mark" />
              Acuse
            </Link>
            <p className="lp-footer-tag">{t.landing.footer.tagline}</p>
          </div>
          <div className="lp-footer-links">
            <Link href="/app">{t.landing.footer.console}</Link>
            <a href={GITHUB} target="_blank" rel="noreferrer">
              {t.landing.footer.github}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

/** A copyable code block. The button is a client island; the rest is static. */
function CodeBlock({
  code,
  lang,
  copy,
}: {
  code: string
  lang: string
  copy: { label: string; done: string }
}) {
  return (
    <div className="gd-code">
      <div className="gd-code-bar">
        <span className="gd-code-lang">{lang}</span>
        <CopyButton text={code} label={copy.label} doneLabel={copy.done} />
      </div>
      <pre className="gd-code-pre">
        <code>{code}</code>
      </pre>
    </div>
  )
}
