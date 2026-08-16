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
}

export default nextConfig
