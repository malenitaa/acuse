'use client'

import { useEffect, useState } from 'react'

const THEME_IDS = ['instrumento', 'libro'] as const

type ThemeId = (typeof THEME_IDS)[number]

/**
 * Switches between the two personalities of the console. The choice lives in
 * localStorage and is re-applied before paint by the inline script in the
 * root layout, so there is no flash of the wrong theme on load. Display
 * labels arrive translated from the server (the ids are internal).
 */
export function ThemeToggle({ labels }: { labels: Record<ThemeId, string> }) {
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
    <div role="group" aria-label="Theme" className="flex items-center gap-2 text-[12px]">
      {THEME_IDS.map((id, i) => (
        <span key={id} className="flex items-center gap-2">
          {i > 0 && (
            <span aria-hidden className="text-faint">
              ·
            </span>
          )}
          <button
            onClick={() => apply(id)}
            aria-pressed={theme === id}
            className={`cursor-pointer transition-colors ${
              theme === id
                ? 'text-text underline underline-offset-4'
                : 'text-faint hover:text-muted'
            }`}
          >
            {labels[id]}
          </button>
        </span>
      ))}
    </div>
  )
}
