'use client'

import { useEffect, useState } from 'react'

const SECTION_KEYS = ['number', 'totals', 'integrations', 'latest'] as const

type SectionKey = (typeof SECTION_KEYS)[number]

const STORAGE_KEY = 'acuse-panel-hidden'

/**
 * The operator decides what their dashboard shows. Sections arrive fully
 * rendered from the server; this component only decides which ones appear,
 * and remembers the choice locally — it's a viewing preference, like the
 * theme, not data.
 */
export function PanelSections({
  customizeLabel,
  labels,
  sections,
}: {
  customizeLabel: string
  labels: Record<SectionKey, string>
  sections: Record<SectionKey, React.ReactNode>
}) {
  const [hidden, setHidden] = useState<Set<SectionKey>>(new Set())

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      if (Array.isArray(stored)) {
        setHidden(new Set(stored.filter((k): k is SectionKey => SECTION_KEYS.includes(k))))
      }
    } catch {
      // Unreadable prefs: show everything, which is always a safe default.
    }
  }, [])

  function toggle(key: SectionKey) {
    setHidden((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      } catch {
        // Private mode: the preference just won't survive a reload.
      }
      return next
    })
  }

  return (
    <div className="divide-y divide-line">
      <div className="flex justify-end px-6 py-2">
        <details className="panel-config">
          <summary>{customizeLabel}</summary>
          <div className="panel-config-menu">
            {SECTION_KEYS.map((key) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={!hidden.has(key)}
                  onChange={() => toggle(key)}
                />
                {labels[key]}
              </label>
            ))}
          </div>
        </details>
      </div>
      {SECTION_KEYS.map((key) =>
        hidden.has(key) ? null : <div key={key}>{sections[key]}</div>,
      )}
    </div>
  )
}
