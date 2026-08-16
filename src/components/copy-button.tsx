'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Copy-to-clipboard for the values people hand around: the ingest URL and the
 * signing secret. Same receipt protocol as SubmitButton: the label flips to
 * «✓ copied» for a beat, because a copy that happens silently cannot be told
 * apart from one that did not happen.
 */
export function CopyButton({
  text,
  label,
  doneLabel,
}: {
  text: string
  label: string
  doneLabel: string
}) {
  const [copied, setCopied] = useState(false)
  // False until the first click, so the resting label does not fade in on load.
  const [cycled, setCycled] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard access needs a secure context (https or localhost). When it
      // is not there, selecting the value by hand still works; stay quiet.
      return
    }
    setCycled(true)
    setCopied(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`cursor-pointer border px-2 py-0.5 text-[11px] transition active:scale-[0.98] ${
        copied
          ? 'border-good/70 text-good'
          : 'border-line text-muted hover:border-text hover:text-text'
      }`}
    >
      {copied ? (
        <span key="done" className="label-swap">
          ✓ {doneLabel}
        </span>
      ) : (
        <span key="rest" className={cycled ? 'label-swap' : undefined}>
          {label}
        </span>
      )}
    </button>
  )
}
