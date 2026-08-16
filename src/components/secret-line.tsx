'use client'

import { useState } from 'react'
import { CopyButton } from './copy-button'

/**
 * The signing secret, masked by default the way password managers do it.
 * Copy works without revealing: most of the time the secret goes straight
 * into a clipboard and a config file, and never needs to be looked at.
 */
export function SecretLine({
  secret,
  labels,
}: {
  secret: string
  labels: { label: string; help: string; reveal: string; hide: string; copy: string; copied: string }
}) {
  const [revealed, setRevealed] = useState(false)
  // Secrets created before the Standard Webhooks change have no whsec_
  // prefix (and still verify, as raw utf8 keys); the mask stays honest by
  // only showing the prefix when the secret actually has it.
  const masked = (secret.startsWith('whsec_') ? 'whsec_' : '') + '•'.repeat(16)

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="text-[11px] uppercase tracking-[0.08em] text-faint">{labels.label}</div>
        <div className="flex items-baseline gap-2">
          <button
            type="button"
            onClick={() => setRevealed((current) => !current)}
            className="cursor-pointer border border-line px-2 py-0.5 text-[11px] text-muted transition hover:border-text hover:text-text active:scale-[0.98]"
          >
            {revealed ? labels.hide : labels.reveal}
          </button>
          <CopyButton text={secret} label={labels.copy} doneLabel={labels.copied} />
        </div>
      </div>
      <code className="mt-1 block overflow-x-auto border border-line-soft bg-panel-2 px-3 py-2 font-mono text-[12px] text-accent">
        {revealed ? secret : masked}
      </code>
      <p className="mt-1 text-[11px] leading-relaxed text-faint">{labels.help}</p>
    </div>
  )
}
