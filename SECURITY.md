# Security

Acuse is a server you run, and it holds a copy of every webhook that passes
through it. That is the whole point, and it is also the whole risk: this
document says exactly what it stores, what it deliberately refuses to store,
what it sends out, and which parts are less hardened than the rest.

## Reporting a vulnerability

Open an issue at https://github.com/malenitaa/acuse/issues. There is no private
disclosure channel and no hosted service to compromise: every instance belongs
to whoever runs it.

## What it touches

| Where | Access | Written by |
| ----- | ------ | ---------- |
| Postgres, table `endpoints` | read/write | Acuse, when you create or pause an integration |
| Postgres, table `events` | read/write | Acuse, on every webhook received |
| Postgres, table `attempts` | read/write | Acuse, once per delivery attempt |
| The database volume (`acuse-data` under Docker) | read/write | Postgres itself |
| Environment variables | read | you |
| stdout / stderr | write | Acuse, one line per worker pass with work in it |

That is the complete list, and it is verifiable rather than promised: the
application code contains no filesystem writes at all. The only file it ever
opens is `db/schema.sql`, read once by `npm run db:reset`. Everything Acuse
knows lives in those three tables, so backing them up backs up the product, and
dropping the database drops everything.

## What it stores from an incoming webhook

Three things, and no more:

- **The body**, verbatim, as JSON. If it is not valid JSON it is still kept,
  as `{"_raw": "...", "_parseError": true}`, truncated at 10,000 characters.
  Bodies above 1 MB are refused with `413` before anything is stored.
- **Eight headers, chosen by name**: `content-type`, `user-agent`,
  `x-forwarded-for`, `idempotency-key`, `x-request-id`, `x-shopify-topic`,
  `x-github-event`, `stripe-signature`.
- **The source IP**, taken from the first entry of `x-forwarded-for`.

The header list is an allowlist, not a denylist, and that is the interesting
part: **`authorization` and `cookie` are not on it, so a sender's credentials
never reach the database**, not even by accident, not even if the sender puts
them on every request. Acuse could store every header it receives. It stores
eight, by name.

From the destination's side, each attempt keeps the status code, the duration,
the error if any, and the **first 2,000 characters** of the response body. If
your destination echoes secrets back in its response body, that prefix is what
ends up in the attempt log.

Payloads are stored as they arrived, in plain text. If the webhooks flowing
through your instance carry personal data, the encryption-at-rest story is your
database's and your disk's, not Acuse's.

## What it never does

- **No telemetry, no phone-home, no update check.** The application makes
  exactly two kinds of outbound request, both of which you configured: `POST`
  to an integration's destination URL, and `POST` to `ALERT_WEBHOOK_URL` when
  an event exhausts its retries. There are two `fetch` calls in the entire
  source tree and those are they.
- **No third-party assets at runtime.** No CDN, no web fonts, no analytics
  script, no error reporter. The stylesheet's only import is Tailwind, compiled
  at build time.
- **No accounts.** There is no user table, no email address, no password
  storage. `CONSOLE_PASSWORD` is compared against an environment variable and
  never written anywhere.
- **No deletes.** Retention archives; it never removes a row. That is a
  reliability decision, but it has a security consequence worth stating out
  loud: **an event you received is kept until you delete it yourself**, in SQL.

One caveat, stated because it would otherwise be a lie by omission: Next.js
itself collects anonymous build-time telemetry. The Docker image and the CI
workflow set `NEXT_TELEMETRY_DISABLED=1`, so neither the published image nor
the build pipeline sends it. If you build outside Docker and want it off there
too, run `npx next telemetry disable`.

## Outbound delivery, and its limits

Every destination URL is validated **at the moment of use**, not only when it
is created, because "the value came out of our own database" is exactly how
server-side request forgery happens. Only `http:` and `https:` are ever
allowed. With `BLOCK_PRIVATE_DESTINATIONS=1`, loopback, private, link-local and
IPv6 unique-local hosts are refused as well.

That flag is **off by default on purpose**: delivering to an internal service
is a legitimate, common use of a self-hosted gateway. Turn it on whenever
someone other than you can create integrations on the instance.

Two honest limits of that guard:

- It inspects the **hostname as written**, not the address it resolves to. A
  public name that resolves to `127.0.0.1` passes even with the flag on.
- Redirects are followed by the HTTP client, and the guard does not re-run on
  the redirect target. A destination that answers `302` to an internal address
  is a way around it.

Both are acceptable in the single-tenant model Acuse is built for, where the
operator configures their own destinations and can only aim at themselves.
Neither is acceptable if you ever let strangers add integrations, and neither
is fixed today.

## Signatures and secrets

Deliveries are signed following the [Standard
Webhooks](https://www.standardwebhooks.com) spec: HMAC-SHA256 over
`id.timestamp.body`, sent as `webhook-signature: v1,<base64>` beside
`webhook-id` and `webhook-timestamp`. The timestamp is inside the signed
string, so a replayed request outside the tolerance window (5 minutes in the
bundled verifier) fails verification.

- Signing secrets are `whsec_` plus 24 bytes from `crypto.randomBytes`,
  generated server-side. They are stored in the database unencrypted, because
  signing requires them back in plain form.
- Signature comparison uses `timingSafeEqual`, and so does the `CRON_SECRET`
  check. The console password is compared with a hand-written constant-time
  loop, because the runtime the console lock runs in has no `timingSafeEqual`.

**The ingest URL is a credential.** Its key is 20 characters drawn from a
34-symbol alphabet by `crypto.randomBytes`, roughly 100 bits, so it will not be
guessed. But anyone holding that URL can inject events into your pipeline, and
Acuse deliberately does not verify the *sender's* signature: it accepts what
arrives and signs the delivery with its own key. Treat an ingest URL the way
you would treat any webhook URL you paste into a third-party dashboard, and use
the console's Copy button rather than pasting it into chat.

## Untrusted input

Webhook bodies are hostile input by definition: they arrive from outside and
end up in a database and on a screen.

**Into the database.** Every value that came from outside travels as a
parameter (`$1`, `$2`, …), never inside the SQL string. Two places would let a
future editor break that quietly, and both are worth knowing about before you
touch them:

- `src/lib/delivery.ts` interpolates one value into SQL: `LEASE_TIMEOUT`, a
  module constant holding the string `2 minutes`. It is the only interpolated
  value in any query in the repository. If that lease is ever made
  configurable, it has to become a parameter on the way.
- `src/lib/stats.ts` builds `where` clauses by joining strings. The **fragments**
  are fixed literals and the **values** are always pushed onto the parameter
  array, including the `?status=` and endpoint id that arrive from the URL. The
  day someone concatenates a value instead of pushing it, that builder becomes
  an injection point, and it will look exactly like the code around it.

**Onto the screen.** Payloads, response bodies, error strings, integration
names and destination URLs are all rendered as React text nodes, which escape
by construction. There is no `dangerouslySetInnerHTML`, no `innerHTML`, no
`eval` and no `new Function` anywhere in the source. Destination URLs are shown
as text and never as links, so there is no `href` for a `javascript:` payload
to land in.

**The one inline script.** `src/app/layout.tsx` runs a small script before
first paint so the saved theme does not flash. It is a constant string with
nothing interpolated into it, it reads `localStorage` and two query parameters,
and it compares each of them against a fixed list of allowed values
(`instrumento`, `plano`, `libro`, `light`, `dark`) before touching the DOM.
Interpolating anything into that template literal would turn it into an
injection point.

**No Content-Security-Policy.** That inline script is why: a real CSP needs a
nonce plumbed through every render, and it has not been built yet. The
baseline headers that are shipped are `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` and
a `Permissions-Policy` that turns off camera, microphone and geolocation.

## Locking down an exposed instance

Out of the box, the console is open. Set `CONSOLE_PASSWORD` and it requires
HTTP Basic Auth with any username. Verified behavior:

| Request | Result |
| ------- | ------ |
| Console page, no credentials | `401` with a `WWW-Authenticate` challenge |
| Console page, wrong password | `401` |
| Console page, right password, any username | passes through |
| `CONSOLE_PASSWORD` unset | console open to anyone who can reach it |

The lock covers every console page and the actions behind them (process the
queue, replay, pause, create, archive). Three paths stay outside it by design,
and each one deserves a decision from you:

- **`/api/i/<key>`, the ingest endpoint.** Public by necessity: it is where
  webhooks arrive. Protected only by the unguessable key, and rate limited.
  A future editor should know that the exclusion is by prefix: **anything added
  under `/api/i/` is public**, not just the ingest route.
- **`/api/cron`.** Guarded by `CRON_SECRET` when that variable is set, and
  **open when it is not**, which is the case in the shipped `docker-compose.yml`
  because the embedded worker does the ticking there. The worst an anonymous
  caller achieves is making deliveries that were going to happen happen sooner.
  Set the variable anyway if the instance is reachable from the internet.
- **`/api/demo-sink`.** The fake destination the quickstart delivers to, so a
  first-time user can watch a rescue without wiring up a real service. It ships
  enabled in production, it is not rate limited, and `?mode=slow` deliberately
  holds a request open for 15 seconds. It only ever answers, never fetches, so
  it cannot be turned into a proxy, but on an internet-facing instance it is
  the cheapest thing to keep a connection busy. Block `/api/demo-sink` at your
  reverse proxy once you no longer need the tour.

The ingest rate limit is 600 requests per minute per ingest key (change it with
`INGEST_MAX_PER_MINUTE`), answered with `429` and `Retry-After: 60`. It is a
fixed window held in memory, which means it is honestly a courtesy limit and
not a shield: it resets when the process restarts, it is not shared between
replicas, and above 10,000 tracked keys the whole table is cleared at once, so
a flood of unknown keys resets legitimate senders' counters as a side effect.
Real abuse protection belongs in front of the app.

And the obvious one: put HTTPS in front of anything you expose. Acuse speaks
plain HTTP and expects a reverse proxy to terminate TLS.

## What is less tested

- **The Vercel path.** The self-hosted Docker path is the one that gets used.
  On serverless the embedded worker is off (processes do not survive between
  requests), platform cron drives the queue instead, and the in-memory rate
  limiter degrades to per-instance counters, which is close to no limit at all.
- **The test suite is 40 unit tests over the pure logic**: backoff bounds and
  schedule, signing and verification (tampered bodies, swapped ids, wrong
  secrets, replays in both directions, malformed input), the destination guard,
  the rate limiter and English/Spanish parity. There are **no end-to-end tests**
  against a live Postgres, so the SQL that claims events, writes attempts and
  archives rows is covered by review and by running it, not by CI. CI runs
  typecheck, tests and a production build on every push.
- **Concurrency.** Double delivery is prevented by `for update skip locked`
  plus a two-minute lease. That is the right primitive and it is used correctly,
  but it has been exercised by hand and by the traffic simulator, not by a
  chaos test.

## Dependencies

Five runtime dependencies: `next`, `react`, `react-dom`, `pg` and
`server-only`. No UI library, no ORM, no HTTP client, no logging framework, no
job queue. `npm audit --omit=dev` reports zero vulnerabilities as of the last
commit touching this file.
