'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Re-fetches the server-rendered page on an interval, so the ledger keeps
 * itself current while the simulator (or real traffic) is writing to it.
 * Refreshes even when the tab is hidden: a skipped tick saves one local
 * query but shows stale numbers the moment someone looks back.
 */
export function AutoRefresh({ intervalMs = 4000 }: { intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs)
    return () => clearInterval(id)
  }, [router, intervalMs])

  return null
}
