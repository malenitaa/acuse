'use client'

import { useEffect, useState } from 'react'

const SCHEMES = ['light', 'dark'] as const

type Scheme = (typeof SCHEMES)[number]

// U+FE0E forces the text (monochrome) glyph — without it the sun renders as
// a full-color emoji next to the plain-text moon.
const GLYPHS: Record<Scheme, string> = { light: '☀︎', dark: '☾' }

/**
 * Light/dark switch, orthogonal to the theme: any personality can be viewed
 * by day or by night. First visit follows the system preference (seeded by
 * the inline script in the root layout); a click makes the choice explicit.
 */
export function SchemeToggle() {
  const [scheme, setScheme] = useState<Scheme | null>(null)

  useEffect(() => {
    const current = document.documentElement.dataset.scheme
    setScheme(current === 'light' ? 'light' : 'dark')
  }, [])

  function apply(next: Scheme) {
    document.documentElement.dataset.scheme = next
    try {
      localStorage.setItem('acuse-scheme', next)
    } catch {
      // Private mode without storage: the choice just won't survive a reload.
    }
    setScheme(next)
  }

  return (
    <div role="group" aria-label="Color scheme" className="seg">
      {SCHEMES.map((id) => (
        <button
          key={id}
          onClick={() => apply(id)}
          aria-pressed={scheme === id}
          aria-label={id}
          title={id}
        >
          {GLYPHS[id]}
        </button>
      ))}
    </div>
  )
}
