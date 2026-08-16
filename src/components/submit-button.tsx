'use client'

import { useFormStatus } from 'react-dom'

/**
 * Submit button for server-action forms. While the action runs it disables
 * itself and shows `pendingLabel`, so pressing it always visibly does
 * something — the row of a ledger is never updated silently.
 */
export function SubmitButton({
  children,
  variant = 'ghost',
  pendingLabel = 'procesando…',
}: {
  children: React.ReactNode
  variant?: 'ghost' | 'primary'
  pendingLabel?: string
}) {
  const { pending } = useFormStatus()

  const variantClass =
    variant === 'primary'
      ? 'border-text font-semibold text-text hover:bg-text hover:text-panel'
      : 'border-line text-muted hover:border-text hover:text-text'

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`cursor-pointer border px-3 py-1 text-[12px] transition disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-text ${variantClass}`}
    >
      {pending ? <span className="italic">{pendingLabel}</span> : children}
    </button>
  )
}
