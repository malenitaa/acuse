import 'server-only'
import { cookies } from 'next/headers'
import type { Lang } from './i18n'

export const LANG_COOKIE = 'acuse-lang'

/**
 * The visitor's language, read per-request so the server renders the right
 * strings on first paint. English is the default — the product introduces
 * itself to the world in English and switches to castellano on request.
 */
export async function getLang(): Promise<Lang> {
  const stored = (await cookies()).get(LANG_COOKIE)?.value
  return stored === 'es' ? 'es' : 'en'
}
