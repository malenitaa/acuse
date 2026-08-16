'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * The navigation strip under the header. It earned its place once the app
 * grew past one page: navigation you can see is what separates a product
 * from a rendered dashboard.
 */
export function ShellNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname()

  return (
    <nav className="app-nav" aria-label="Main">
      {items.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined}>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
