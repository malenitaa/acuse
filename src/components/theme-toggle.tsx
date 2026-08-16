'use client'

import { useEffect, useState } from 'react'

const THEME_IDS = ['instrumento', 'libro'] as const

type ThemeId = (typeof THEME_IDS)[number]

/**
 * Segmented control switching between the two personalities of the console.
 * The choice lives in localStorage and is re-applied before paint by the
 * inline script in the root layout, so there is no flash of the wrong theme
 * on load. Display labels arrive translated from the server.
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
    <div role="group" aria-label="Theme" className="seg">
      {THEME_IDS.map((id) => (
        <button key={id} onClick={() => apply(id)} aria-pressed={theme === id}>
          {labels[id]}
        </button>
      ))}
    </div>
  )
}
