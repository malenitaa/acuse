'use client'

import { useEffect, useState } from 'react'

const THEMES = [
  { id: 'instrumento', label: 'instrumento' },
  { id: 'libro', label: 'libro' },
] as const

type ThemeId = (typeof THEMES)[number]['id']

/**
 * Switches between the two personalities of the console. The choice lives in
 * localStorage and is re-applied before paint by the inline script in the
 * root layout, so there is no flash of the wrong theme on load.
 */
export function ThemeToggle() {
  // null until mounted: the server cannot know the visitor's stored choice.
  const [theme, setTheme] = useState<ThemeId | null>(null)

  useEffect(() => {
    const current = document.documentElement.dataset.theme
    setTheme(current === 'libro' ? 'libro' : 'instrumento')
  }, [])

  function apply(next: ThemeId) {
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('acuse-theme', next)
    } catch {
      // Private mode without storage: the choice just won't survive a reload.
    }
    setTheme(next)
  }

  return (
    <div role="group" aria-label="Tema" className="flex items-center gap-2 text-[12px]">
      {THEMES.map((t, i) => (
        <span key={t.id} className="flex items-center gap-2">
          {i > 0 && (
            <span aria-hidden className="text-faint">
              ·
            </span>
          )}
          <button
            onClick={() => apply(t.id)}
            aria-pressed={theme === t.id}
            className={`cursor-pointer transition-colors ${
              theme === t.id
                ? 'text-text underline underline-offset-4'
                : 'text-faint hover:text-muted'
            }`}
          >
            {t.label}
          </button>
        </span>
      ))}
    </div>
  )
}
