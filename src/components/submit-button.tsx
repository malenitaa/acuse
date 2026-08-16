'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'

/**
 * Submit button for server-action forms. It walks the ledger's own protocol:
 * rest → «procesando…» while the action runs → «✓ done» for a beat, stamped
 * in ledger green — the row is never updated silently, and the receipt is
 * acknowledged (this is a product called "acuse", after all).
 */
export function SubmitButton({
  children,
  variant = 'ghost',
  pendingLabel = 'procesando…',
  doneLabel = 'hecho',
}: {
  children: React.ReactNode
  variant?: 'ghost' | 'primary'
  pendingLabel?: string
  doneLabel?: string
}) {
  const { pending } = useFormStatus()
  const [justDone, setJustDone] = useState(false)
  // False until the first submit: the resting label must NOT fade in on page
  // load, only when it comes back after a «procesando…» → «✓» cycle.
  const [cycled, setCycled] = useState(false)
  const wasPending = useRef(false)

  useEffect(() => {
    if (pending) setCycled(true)
    if (wasPending.current && !pending) {
      setJustDone(true)
      const timer = setTimeout(() => setJustDone(false), 1400)
      wasPending.current = pending
      return () => clearTimeout(timer)
    }
    wasPending.current = pending
  }, [pending])

  const variantClass =
    variant === 'primary'
      ? 'border-text font-semibold text-text hover:bg-text hover:text-panel'
      : 'border-line text-muted hover:border-text hover:text-text'

  const doneClass = justDone ? 'border-good/70 text-good hover:bg-transparent hover:text-good' : ''

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`cursor-pointer border px-3 py-1 text-[12px] transition active:scale-[0.98] disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-text ${variantClass} ${doneClass}`}
    >
      {pending ? (
        <span key="pending" className="label-swap italic">
          {pendingLabel}
        </span>
      ) : justDone ? (
        <span key="done" className="label-swap">
          ✓ {doneLabel}
        </span>
      ) : (
        <span key="rest" className={cycled ? 'label-swap' : undefined}>
          {children}
        </span>
      )}
    </button>
  )
}
