'use client'

import { useRouter } from 'next/navigation'
import type { Lang } from '@/lib/i18n'
import { LANGS } from '@/lib/i18n'

/**
 * Segmented language switch. The choice lives in a cookie (not localStorage)
 * because the SERVER needs it: pages render fully translated on first paint,
 * so there is never a flash of the wrong language.
 */
export function LangToggle({ current }: { current: Lang }) {
  const router = useRouter()

  function apply(next: Lang) {
    document.cookie = `acuse-lang=${next};path=/;max-age=31536000;samesite=lax`
    router.refresh()
  }

  return (
    <div role="group" aria-label="Language" className="seg font-mono uppercase">
      {LANGS.map((lang) => (
        <button key={lang} onClick={() => apply(lang)} aria-pressed={current === lang}>
          {lang}
        </button>
      ))}
    </div>
  )
}
