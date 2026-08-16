'use client'

import { useRouter } from 'next/navigation'
import type { Lang } from '@/lib/i18n'
import { LANGS } from '@/lib/i18n'

/**
 * Language switch. The choice lives in a cookie (not localStorage) because
 * the SERVER needs it: pages render fully translated on first paint, so
 * there is never a flash of the wrong language.
 */
export function LangToggle({ current }: { current: Lang }) {
  const router = useRouter()

  function apply(next: Lang) {
    document.cookie = `acuse-lang=${next};path=/;max-age=31536000;samesite=lax`
    router.refresh()
  }

  return (
    <div role="group" aria-label="Language" className="flex items-center gap-2 font-mono text-[11px] uppercase">
      {LANGS.map((lang, i) => (
        <span key={lang} className="flex items-center gap-2">
          {i > 0 && (
            <span aria-hidden className="text-faint">
              /
            </span>
          )}
          <button
            onClick={() => apply(lang)}
            aria-pressed={current === lang}
            className={`cursor-pointer transition-colors ${
              current === lang
                ? 'text-text underline underline-offset-4'
                : 'text-faint hover:text-muted'
            }`}
          >
            {lang}
          </button>
        </span>
      ))}
    </div>
  )
}
