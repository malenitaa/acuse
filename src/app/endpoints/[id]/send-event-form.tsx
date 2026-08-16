'use client'

import { useActionState } from 'react'
import { sendEventAction } from '@/app/actions'
import { SubmitButton } from '@/components/submit-button'
import type { Lang } from '@/lib/i18n'
import { dict } from '@/lib/i18n'

/**
 * Compose-an-event form: test an integration now, or schedule a delivery for
 * later. On success the page refreshes and the queued event appears in the
 * list below, wearing its «queued» stamp until the worker picks it up.
 */
export function SendEventForm({ endpointId, lang }: { endpointId: string; lang: Lang }) {
  const t = dict[lang].sendEvent
  const [state, formAction] = useActionState(sendEventAction, {})

  return (
    <form action={formAction} className="mt-4 max-w-xl space-y-4">
      <input type="hidden" name="endpointId" value={endpointId} />

      <div>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.08em] text-faint">
            {t.payloadLabel}
          </span>
          <textarea
            name="payload"
            rows={4}
            defaultValue={'{\n  "test": true\n}'}
            className="mt-1 w-full border border-line bg-panel px-3 py-2 font-mono text-[12px]"
          />
        </label>
        {state.error === 'json' ? (
          <p className="mt-1 text-[12px] text-bad">{t.errorJson}</p>
        ) : (
          <p className="mt-1 text-[11px] italic text-faint">{t.payloadHelp}</p>
        )}
      </div>

      <div>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.08em] text-faint">{t.whenLabel}</span>
          <input
            name="scheduledAt"
            type="datetime-local"
            className="mt-1 block border border-line bg-panel px-3 py-2 text-[13px]"
          />
        </label>
        {state.error === 'date' ? (
          <p className="mt-1 text-[12px] text-bad">{t.errorDate}</p>
        ) : (
          <p className="mt-1 text-[11px] italic text-faint">{t.whenHelp}</p>
        )}
      </div>

      <SubmitButton pendingLabel={dict[lang].actions.processing} doneLabel={t.queued}>
        {t.submit}
      </SubmitButton>
    </form>
  )
}
