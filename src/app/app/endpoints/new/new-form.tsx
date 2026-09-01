'use client'

import { useActionState } from 'react'
import { createEndpointAction } from '@/app/actions'
import { SubmitButton } from '@/components/submit-button'
import type { Lang } from '@/lib/i18n'
import { dict } from '@/lib/i18n'

/**
 * The create-integration form. Validation errors come back from the server
 * action; on success the action redirects to the endpoint page, which shows
 * the ingest URL to paste into the emitting system.
 */
export function NewEndpointForm({ lang }: { lang: Lang }) {
  const t = dict[lang].newEndpoint
  const [state, formAction] = useActionState(createEndpointAction, {})

  return (
    <form action={formAction} className="mt-6 max-w-xl space-y-5">
      <Field label={t.nameLabel} help={t.nameHelp} error={state.error === 'name' ? t.errorName : null}>
        <input
          name="name"
          type="text"
          required
          maxLength={120}
          placeholder={t.namePlaceholder}
          className="w-full border border-line bg-panel px-3 py-2 text-[13px] placeholder:text-faint"
        />
      </Field>

      <Field
        label={t.destinationLabel}
        help={t.destinationHelp}
        error={state.error === 'destination' ? t.errorDestination : null}
      >
        <input
          name="destination"
          type="url"
          required
          placeholder={t.destinationPlaceholder}
          className="w-full border border-line bg-panel px-3 py-2 font-mono text-[12px] placeholder:text-faint"
        />
      </Field>

      <Field label={t.attemptsLabel} help={t.attemptsHelp} error={null}>
        <input
          name="maxAttempts"
          type="number"
          min={1}
          max={12}
          defaultValue={8}
          className="w-24 border border-line bg-panel px-3 py-2 text-[13px]"
        />
      </Field>

      <SubmitButton variant="primary" pendingLabel={dict[lang].actions.processing}>
        {t.submit}
      </SubmitButton>
    </form>
  )
}

function Field({
  label,
  help,
  error,
  children,
}: {
  label: string
  help: string
  error: string | null
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.08em] text-faint">{label}</span>
        <div className="mt-1">{children}</div>
      </label>
      {error ? (
        <p className="mt-1 text-[12px] text-bad">{error}</p>
      ) : (
        <p className="mt-1 text-[11px] italic text-faint">{help}</p>
      )}
    </div>
  )
}
