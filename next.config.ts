import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Self-contained build for the Docker image: .next/standalone carries its
  // own node_modules subset and runs with plain `node server.js`.
  output: 'standalone',
  // Hide the floating Next.js dev-tools button ("N") in development; it reads
  // as part of the product to anyone watching a demo.
  devIndicators: false,
  // `pg` opens raw TCP sockets, so it must stay outside the bundler.
  serverExternalPackages: ['pg'],
  turbopack: {
    // Pin the project root. Otherwise Turbopack walks up looking for a lockfile
    // and lands in the home directory, because the repo lives under iCloud.
    root: dirname(fileURLToPath(import.meta.url)),
  },
  // Baseline security headers (OWASP A05). CSP is deliberately absent for
  // now: the theme-init inline script would need a nonce pipeline; noted in
  // the private README as follow-up work.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
