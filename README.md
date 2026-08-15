# Acuse

Webhook delivery guardian: no event gets lost.

Acuse sits between the systems that send webhooks and the systems that must receive them.
Every event is persisted before the sender gets a response, failed deliveries are retried
automatically with exponential backoff, and a dashboard shows exactly how many deliveries
were rescued — and which ones need human attention.

## The problem

Companies wire Shopify to an ERP, web forms to a CRM, billing to accounting. Each connection
is a URL receiving webhooks. When a destination goes down for two minutes, those webhooks do
not come back: the sender retries a few times, gives up, and discards them. The failure is
silent — nobody notices until a customer complains days later.

## Features

- **Durable ingestion.** Events are written to Postgres before the sender is answered. From
  that point on they cannot be lost, even if the destination is down.
- **Automatic retries.** Exponential backoff with jitter: 5s, 15s, 45s, 2m, 7m, 20m, 1h.
- **Early failure detection.** An integration that stops responding is flagged while its
  events are still being retried, before anything is lost.
- **Manual replay.** Original payloads are kept, so any event — including exhausted ones —
  can be redelivered with one click.
- **Delivery audit trail.** Every attempt is recorded: timestamp, status code, response
  body, duration.
- **Signed deliveries.** Each outgoing request carries `t=…,v1=HMAC-SHA256(t.body)` so the
  destination can verify origin and reject replays.

## Architecture

```
   Shopify ─┐
 Web forms ─┼──▶  POST /api/i/<key>  ──▶  [ Postgres ]  ──▶  worker  ──▶  destination
   Billing ─┘        (202, fast)           events +          (cron)
                                           attempts
```

Design decisions worth reading in the code:

- Ingestion never delivers inline — one `INSERT`, then respond. Making the sender wait on a
  third party is how events get dropped.
- Workers claim events with `FOR UPDATE SKIP LOCKED`, so several can run in parallel without
  double-sending.
- The attempt record is written before the event outcome. If the process dies mid-delivery,
  the lease expires and the event is retried: a duplicate is recoverable, a silent loss is
  not.
- Retry jitter prevents a recovered destination from being knocked down again by a
  simultaneous burst of queued events.
- Endpoint health is derived from the queue rather than from heartbeats: a broken
  integration reveals itself because events pile up behind it.

## Getting started

Requires Node 20+ and Postgres.

```bash
createdb acuse
cp .env.example .env.local   # set DATABASE_URL
npm install
npm run db:reset             # create the schema
npm run seed                 # three sample integrations
npm run dev
```

To generate realistic traffic against the sample integrations:

```bash
npm run simulate -- --events=70 --seconds=140
```

The samples cover the three states that matter: one healthy destination, one that fails and
recovers (which produces the rescued count), and one that is down.

## Deployment

Runs on Vercel with any managed Postgres (Neon, Supabase, Vercel Postgres). The delivery
worker is an HTTP route, scheduled with Vercel Cron and protected by `CRON_SECRET`:

```json
{ "crons": [{ "path": "/api/cron", "schedule": "* * * * *" }] }
```

## Project status

Working v1, single-tenant, intended for self-hosted use:

- No accounts or login: anyone who can reach the console can operate it. Deploy it behind
  your own access control.
- Alerts are shown on the dashboard only; no email or Slack notifications yet.
- Retry timing is floor-limited by the cron cadence (one minute on Vercel).
- No retention policy: events are kept indefinitely.
- The interface is currently in Spanish.

For this problem at company scale, commercial products exist (Svix, Hookdeck). Acuse is a
small, self-hosted, readable take on the same category.

## Enjoyed it?

If this was useful and you'd like to support the project:

- [Cafecito](https://cafecito.app/rezamalena)
- [Ko-fi](https://ko-fi.com/malenitaa)

## License

MIT — see [LICENSE](LICENSE).
