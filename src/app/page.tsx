import Link from 'next/link'
import { LangToggle } from '@/components/lang-toggle'
import { SchemeToggle } from '@/components/scheme-toggle'
import { ThemeToggle } from '@/components/theme-toggle'
import { dict } from '@/lib/i18n'
import { getLang } from '@/lib/lang'

const GITHUB = 'https://github.com/malenitaa/acuse'

/**
 * The marketing landing, at «/». It shares the console's tokens and its
 * three-theme switch, so the page a visitor lands on already looks like the
 * product they are about to open. Every «open the console» path leads to
 * «/app»; the «learn» path leads to «/app?tour=1», which starts the guided
 * tour on arrival.
 */
export default async function LandingPage() {
  const lang = await getLang()
  const t = dict[lang].landing

  return (
    <div className="lp">
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-brand">
            <img src="/mark.png" alt="" width={26} height={26} className="lp-brand-mark" />
            Acuse
          </Link>
          <nav className="lp-nav-links" aria-label={lang === 'es' ? 'Secciones' : 'Sections'}>
            <a href="#how">{t.nav.how}</a>
            <a href="#features">{t.nav.features}</a>
            <a href="#run">{t.nav.run}</a>
            <Link href="/guia">{dict[lang].guide.link}</Link>
          </nav>
          <div className="lp-nav-right">
            <div className="lp-toggles">
              <ThemeToggle labels={dict[lang].shell.themeNames} />
              <SchemeToggle />
              <LangToggle current={lang} />
            </div>
            <a href={GITHUB} className="lp-ghost" target="_blank" rel="noreferrer">
              {t.nav.github}
            </a>
            <Link href="/app" className="lp-cta">
              {t.nav.console}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="lp-hero">
          <p className="lp-eyebrow">{t.hero.eyebrow}</p>
          <h1 className="lp-hero-title">{t.hero.title}</h1>
          <p className="lp-hero-sub">{t.hero.subtitle}</p>
          <div className="lp-hero-actions">
            <Link href="/app" className="lp-cta lp-cta-lg">
              {t.hero.ctaPrimary} <span aria-hidden="true">→</span>
            </Link>
            <a href={GITHUB} className="lp-ghost lp-ghost-lg" target="_blank" rel="noreferrer">
              {t.hero.ctaSecondary}
            </a>
          </div>
          <p className="lp-hero-note">{t.hero.note}</p>
          <ul className="lp-trust">
            {t.trust.map((item) => (
              <li key={item}>
                <span className="lp-check" aria-hidden="true">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Console screenshot */}
        <section className="lp-shot-wrap">
          <div className="lp-shot">
            <img
              src="/console-instrument-dark.png"
              alt={t.showcase.caption}
              width={2400}
              height={1500}
              className="lp-shot-img"
            />
          </div>
        </section>

        {/* Problem */}
        <section className="lp-band">
          <div className="lp-narrow">
            <p className="lp-eyebrow lp-eyebrow-bad">{t.problem.eyebrow}</p>
            <h2 className="lp-h2">{t.problem.title}</h2>
            <p className="lp-lead">{t.problem.body}</p>
            <p className="lp-lead">{t.problem.body2}</p>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="lp-section">
          <div className="lp-section-head">
            <p className="lp-eyebrow">{t.how.eyebrow}</p>
            <h2 className="lp-h2">{t.how.title}</h2>
          </div>
          <ol className="lp-steps">
            {t.how.steps.map((s, i) => (
              <li key={s.title} className="lp-step">
                <span className="lp-step-num">{i + 1}</span>
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="lp-step-body">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section id="features" className="lp-section">
          <div className="lp-section-head">
            <p className="lp-eyebrow">{t.features.eyebrow}</p>
            <h2 className="lp-h2">{t.features.title}</h2>
          </div>
          <div className="lp-grid">
            {t.features.items.map((f) => (
              <div key={f.title} className="lp-card">
                <h3 className="lp-card-title">{f.title}</h3>
                <p className="lp-card-body">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Showcase / themes */}
        <section className="lp-band">
          <div className="lp-showcase">
            <div className="lp-showcase-copy">
              <p className="lp-eyebrow">{t.showcase.eyebrow}</p>
              <h2 className="lp-h2">{t.showcase.title}</h2>
              <p className="lp-lead">{t.showcase.body}</p>
            </div>
            <div className="lp-showcase-shots">
              <img
                src="/console-plano-dark.png"
                alt=""
                width={1600}
                height={1000}
                className="lp-mini-shot"
              />
              <img
                src="/console-ledger-light.png"
                alt=""
                width={1600}
                height={1000}
                className="lp-mini-shot"
              />
            </div>
          </div>
        </section>

        {/* Learn / tour */}
        <section className="lp-section">
          <div className="lp-learn">
            <p className="lp-eyebrow">{t.learn.eyebrow}</p>
            <h2 className="lp-h2">{t.learn.title}</h2>
            <p className="lp-lead">{t.learn.body}</p>
            <div className="lp-hero-actions">
              <Link href="/app?tour=1" className="lp-cta lp-cta-lg">
                {t.learn.cta} <span aria-hidden="true">◎</span>
              </Link>
              <Link href="/guia" className="lp-ghost lp-ghost-lg">
                {t.learn.guideCta}
              </Link>
            </div>
            <p className="lp-learn-hint">{t.learn.hint}</p>
          </div>
        </section>

        {/* Run it */}
        <section id="run" className="lp-band">
          <div className="lp-run">
            <div className="lp-run-copy">
              <p className="lp-eyebrow">{t.run.eyebrow}</p>
              <h2 className="lp-h2">{t.run.title}</h2>
              <p className="lp-lead">{t.run.body}</p>
              <p className="lp-run-after">
                {t.run.after} <code>http://localhost:3000/app</code>
              </p>
            </div>
            <pre className="lp-code">
              <code>{t.run.command}</code>
            </pre>
          </div>
        </section>

        {/* FAQ */}
        <section className="lp-section">
          <div className="lp-section-head">
            <p className="lp-eyebrow">{t.faq.eyebrow}</p>
            <h2 className="lp-h2">{t.faq.title}</h2>
          </div>
          <div className="lp-faq">
            {t.faq.items.map((item) => (
              <div key={item.q} className="lp-faq-item">
                <h3 className="lp-faq-q">{item.q}</h3>
                <p className="lp-faq-a">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div>
            <Link href="/" className="lp-brand">
              <img src="/mark.png" alt="" width={22} height={22} className="lp-brand-mark" />
              Acuse
            </Link>
            <p className="lp-footer-tag">{t.footer.tagline}</p>
            <p className="lp-footer-meaning">{t.footer.meaning}</p>
          </div>
          <div className="lp-footer-links">
            <Link href="/app">{t.footer.console}</Link>
            <a href={GITHUB} target="_blank" rel="noreferrer">
              {t.footer.github}
            </a>
            <a href={`${GITHUB}/blob/main/LICENSE`} target="_blank" rel="noreferrer">
              MIT
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
