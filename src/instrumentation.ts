/**
 * Next.js instrumentation hook: runs once when the server process starts.
 * With EMBEDDED_WORKER=1 (the Docker/self-hosted mode) it starts the retry
 * worker inside this same process, so the product is a single container with
 * no external scheduler to configure.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.EMBEDDED_WORKER === '1') {
    const { startEmbeddedWorker } = await import('./lib/worker')
    startEmbeddedWorker()
  }
}
