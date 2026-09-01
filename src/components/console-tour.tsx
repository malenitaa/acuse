'use client'

import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

type TourText = {
  button: string
  next: string
  back: string
  done: string
  skip: string
  stepOf: (i: number, n: number) => string
  steps: { title: string; body: string }[]
}

/**
 * A guided tour of the console: a dimmed backdrop with a lit «hole» over one
 * element at a time, and a card explaining it. This is the «learn to use it»
 * path the landing points at — it runs inside the real console, on the real
 * numbers, instead of a separate manual that drifts out of date.
 *
 * The text lives in i18n (both languages); the anchors live here as
 * data-tour selectors, matched to the steps by position. Anything missing
 * from the DOM (a hidden panel, an empty dashboard) is skipped, never fatal.
 */
const ANCHORS = [
  '[data-tour="rescued"]',
  '[data-tour="totals"]',
  '[data-tour="new"]',
  '[data-tour="process"]',
  '[data-tour="prefs"]',
]

const SEEN_KEY = 'acuse-tour-seen'
const PAD = 8

type Rect = { top: number; left: number; width: number; height: number }

export function ConsoleTour({ t }: { t: TourText }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)

  const total = t.steps.length

  // Find the next anchor present in the DOM, starting at `from` and moving in
  // `dir`. Returns its index, or -1 if the tour has run off either end.
  const findPresent = useCallback((from: number, dir: 1 | -1) => {
    // Called during render (isFirst/isLast), so it must be safe on the server,
    // where there is no document. Returns -1 there; the overlay never renders
    // during SSR anyway, since `open` starts false.
    if (typeof document === 'undefined') return -1
    for (let i = from; i >= 0 && i < ANCHORS.length; i += dir) {
      if (document.querySelector(ANCHORS[i])) return i
    }
    return -1
  }, [])

  const measure = useCallback((index: number) => {
    const el = document.querySelector(ANCHORS[index])
    if (!el) return
    const r = el.getBoundingClientRect()
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
  }, [])

  const goTo = useCallback(
    (index: number) => {
      const el = document.querySelector(ANCHORS[index])
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setStep(index)
      // Let the smooth scroll settle before locking the spotlight onto it.
      window.setTimeout(() => measure(index), 260)
    },
    [measure],
  )

  const start = useCallback(() => {
    const first = findPresent(0, 1)
    if (first === -1) return
    setOpen(true)
    goTo(first)
  }, [findPresent, goTo])

  const close = useCallback(() => {
    setOpen(false)
    setRect(null)
    try {
      localStorage.setItem(SEEN_KEY, '1')
    } catch {
      // Private mode: the tour will simply offer itself again next time.
    }
  }, [])

  const next = useCallback(() => {
    const n = findPresent(step + 1, 1)
    if (n === -1) {
      close()
      return
    }
    goTo(n)
  }, [step, findPresent, goTo, close])

  const back = useCallback(() => {
    const p = findPresent(step - 1, -1)
    if (p !== -1) goTo(p)
  }, [step, findPresent, goTo])

  // First-visit autostart, plus an explicit ?tour=1 entry point (the landing's
  // «learn» button links here). Runs once, after paint.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const asked = params.get('tour') === '1'
    let seen = false
    try {
      seen = localStorage.getItem(SEEN_KEY) === '1'
    } catch {
      // ignore
    }
    if (asked) {
      // Clean the URL so a refresh doesn't relaunch the tour.
      params.delete('tour')
      const qs = params.toString()
      window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''))
    }
    if (asked || !seen) {
      const id = window.setTimeout(start, asked ? 150 : 700)
      return () => window.clearTimeout(id)
    }
  }, [start])

  // Keep the spotlight glued to its element as the page scrolls or resizes.
  useLayoutEffect(() => {
    if (!open) return
    const onMove = () => measure(step)
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    return () => {
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [open, step, measure])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close, next, back])

  const current = t.steps[step]
  const isLast = findPresent(step + 1, 1) === -1
  const isFirst = findPresent(step - 1, -1) === -1

  // Card placement: below the target when there is room underneath, otherwise
  // above it. Horizontally anchored to the target's left, clamped on screen.
  const card = rect
    ? (() => {
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
        const vh = typeof window !== 'undefined' ? window.innerHeight : 768
        const width = Math.min(340, vw - 24)
        const below = rect.top + rect.height + 12
        const placeBelow = below + 160 < vh
        const top = placeBelow ? below : Math.max(12, rect.top - 12)
        const left = Math.max(12, Math.min(rect.left, vw - width - 12))
        return { width, top, left, translateY: placeBelow ? '0' : '-100%' }
      })()
    : null

  return (
    <>
      <button type="button" className="tour-open" onClick={start}>
        <span aria-hidden="true">◎</span> {t.button}
      </button>

      {open ? (
        <div className="tour-root" role="dialog" aria-modal="true" aria-label={t.button}>
          {/* Transparent click-blocker so the page underneath stays still. */}
          <div className="tour-block" onClick={close} />

          {rect ? (
            <div
              className="tour-hole"
              style={{
                top: rect.top - PAD,
                left: rect.left - PAD,
                width: rect.width + PAD * 2,
                height: rect.height + PAD * 2,
              }}
            />
          ) : null}

          {card && current ? (
            <div
              className="tour-card"
              style={{
                top: card.top,
                left: card.left,
                width: card.width,
                transform: `translateY(${card.translateY})`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="tour-step">{t.stepOf(step + 1, total)}</div>
              <h3 className="tour-title">{current.title}</h3>
              <p className="tour-body">{current.body}</p>
              <div className="tour-actions">
                <button type="button" className="tour-skip" onClick={close}>
                  {t.skip}
                </button>
                <div className="tour-nav">
                  {!isFirst ? (
                    <button type="button" className="tour-btn" onClick={back}>
                      {t.back}
                    </button>
                  ) : null}
                  <button type="button" className="tour-btn tour-btn-primary" onClick={next}>
                    {isLast ? t.done : t.next}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  )
}
