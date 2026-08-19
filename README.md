<div align="center">

# Acuse

**When an integration breaks, the webhooks it missed are not gone. They arrive when it comes back.**

[![CI](https://github.com/malenitaa/acuse/actions/workflows/ci.yml/badge.svg)](https://github.com/malenitaa/acuse/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Runs on your own server](https://img.shields.io/badge/runs%20on-your%20own%20server-2b6cb0.svg)](#run-it)
[![Telemetry: none](https://img.shields.io/badge/telemetry-none-brightgreen.svg)](SECURITY.md)

![The Acuse console: events rescued, integration health, and the full delivery record](docs/img/console-instrument-dark.png)

</div>

## The problem

Companies wire their online store to an ERP, web forms to a CRM, billing to
accounting. Each connection is a URL receiving webhooks. When a destination is
down for two minutes (a restart, a deploy, a provider hiccup) those webhooks do
not come back: the sender retries a few times, gives up, and discards them.

The failure is silent. The sale never gets invoiced, the lead never reaches the
CRM, and nobody notices until a customer complains days later.

Acuse sits in the middle. It writes every event down before answering the
sender, keeps retrying until the destination answers, and shows you the number
that matters: **how many deliveries it rescued** that would otherwise have been
lost without a trace.

*Acuse* is short for *acuse de recibo*, Spanish for acknowledgment of receipt.

> **Run it in one command:** `docker compose up -d`, and the console is at
> `http://localhost:3000`. Full walkthrough in the
> [five-minute quickstart](docs/QUICKSTART.md).

## What you get

- **Nothing is lost after it arrives.** Events are written down before the
  sender is answered. From that moment they can only be delivered or parked,
  never dropped, even if the destination stays down for a day.
- **Retries that are patient and polite.** Growing waits between attempts
  (5s, 15s, 45s, 2m 15s, 6m 45s, 20m 15s, 1h), each nudged a little at random
  so a destination that just came back is not knocked down again by everything
  arriving at once.
- **You find out before it costs you.** An integration that stopped answering
  is flagged while its events are still being retried, before anything is lost.
- **A button that actually works.** Anything that ran out of attempts can be
  redelivered with one click, because the original was kept. After an outage,
  one button redelivers everything at once.
- **The full record.** Every attempt, with its timestamp, its response and how
  long it took. This is what makes the numbers on the dashboard believable.
- **Send and schedule by hand.** Test an integration from the console, or queue
  an event for later ("this has to go out at 2 am, and I want to sleep").
- **Nothing is ever deleted.** Old delivered events can be archived out of the
  way, and archived means browsable and restorable, forever. Your disk is the
  only limit.
- **Signed deliveries.** Every request Acuse sends is signed, so your
  destination can verify it really came from you and refuse anything replayed.
  Any [Standard Webhooks](https://www.standardwebhooks.com) library verifies it,
  and each integration's secret is on its page in the console.
- **Alerts wherever you already look.** Point Acuse at a chat webhook or an
  automation platform and a failed delivery becomes one more event your tools
  can route.
- **Three looks, two schemes, two languages.** A dark ops console, a
  drafting-table blueprint, or a paper ledger, in light and dark, in English or
  Spanish. It remembers what you chose.

<details>
<summary><strong>The same console wearing the other two faces</strong></summary>

![The Acuse console, blueprint theme: deep blue drafting table with cyan ink and monospace labels](docs/img/console-plano-dark.png)

![The Acuse console, ledger theme: a sheet of paper on a desk, with serif type and rubber-stamp statuses](docs/img/console-ledger-light.png)

</details>

## Things that look like bugs and are not

Worth reading before opening an issue. All of these are on purpose.

- **A delivery can take up to 30 seconds to be attempted.** The worker wakes up
  every 30 seconds. Acuse answers the sender instantly, but the first delivery
  attempt waits for the next tick, or for the **Process queue now** button.
- **The retry times never match the schedule exactly.** Every wait is nudged by
  up to 15% at random. That is what stops fifty queued events from hitting a
  recovering destination in the same instant.
- **An integration stays "down" after it recovered.** Health is read from the
  queue, so anything still sitting undelivered keeps the integration marked
  down. It is not stale: those events are still owed to somebody. Redeliver
  them or archive them and the status clears.
- **An integration with no traffic shows "no traffic", not "healthy".** Acuse
  will not certify something it has never seen work.
- **Pausing rejects nothing.** Events keep arriving and keep being stored while
  an integration is paused; only delivery stops. When you resume, everything
  goes out in order.
- **Sending the same event twice can give you back the first one.** If your
  sender includes an `idempotency-key` or an `x-request-id`, a repeat is
  recognised as the same event: Acuse returns the original id and does not
  deliver it twice. That is deduplication, not a lost event.
- **Malformed JSON is accepted, not rejected.** A body Acuse cannot parse is
  still stored, wrapped and marked as unparseable. Rejecting it would mean the
  sender drops it and nobody ever sees it again.
- **The totals are bigger than the lists.** The counters at the top are
  lifetime, archived events included; the lists below show the most recent ones
  and say so at the bottom ("showing the last 40 of 52").
- **A manual redelivery gets extra rope.** Redelivering an exhausted event does
  not spend its last attempt and bury it again: it is given room to retry, and
  the attempt is recorded as manual.

## Using it

1. **Create an integration** (**+ new integration**): a name, and the URL where
   events have to be delivered.
2. **Paste the ingest URL** Acuse gives you into whatever emits the webhooks
   (your online store, your CRM, your automation platform, a form backend), in
   place of the direct destination.
3. **Read the dashboard**: health per integration, every event with its full
   attempt trail, and one-click redelivery for anything that gave up.

Two patterns worth knowing:

- **Instrument both edges of a workflow.** Acuse cannot see inside a workflow
  engine, but it can watch its edges: one integration for the trigger going
  *in*, and, as the workflow's last step, a call to a second integration
  marking it *done*. If "in" says 40 and "done" says 37, three runs died
  inside, and you know which ones.
- **Route failures to your tools.** With an alert URL configured, an event that
  exhausts its retries posts a JSON alert wherever you point it: a chat
  webhook, an error workflow, or even another Acuse.

## Run it

You need [Docker](https://www.docker.com/products/docker-desktop/) and nothing
else. One command brings up the app, its database and the retry worker:

```bash
git clone https://github.com/malenitaa/acuse.git
cd acuse
docker compose up -d
```

The console is at `http://localhost:3000`, or at your server's address. Data
survives restarts; `docker compose down` stops everything. The first boot builds
the image and takes a few minutes, after that it starts in seconds.

**→ Five-minute guided tour, with a rescue you can watch happen:
[docs/QUICKSTART.md](docs/QUICKSTART.md)**

Before exposing it beyond your own network, two things matter: set a console
password, and put HTTPS in front of it (Caddy, nginx, whatever you already
use). Both are covered in the quickstart and in [SECURITY.md](SECURITY.md).

<details>
<summary><strong>Prefer not to run a server? Deploy it to Vercel</strong></summary>

Fork this repo, create a Postgres database ([Neon](https://neon.tech)'s free
tier is enough), run [`db/schema.sql`](db/schema.sql) in its SQL editor, then
import the fork in Vercel with two environment variables: `DATABASE_URL` (the
connection string) and `CRON_SECRET` (a long random string that protects the
retry worker). The retry schedule ships in [`vercel.json`](vercel.json).

This path gets less use than the self-hosted one; see
[SECURITY.md](SECURITY.md#what-is-less-tested).

</details>

## Questions people ask first

**What does it cost to run?** Your own hardware, or a free tier if you take the
Vercel route. There is no paid version, no seat count and no event quota.

**Does it work with my systems?** Anything that sends webhooks can point at
Acuse, and anything that accepts an HTTP call can be a destination. It does not
need to know what either side is.

**What if a destination is down for a whole day?** Retries keep going with
growing waits. When they run out, the event is parked as undelivered, kept
forever, and redelivered the moment you press the button.

**How is this different from Svix or Hookdeck?** Those are excellent commercial
products for this category at scale, and if you need scale you should look at
them. Acuse is the small, self-hosted, one-container take: no account, no
quota, no data leaving your network, and few enough moving parts that you can
read all of it in an afternoon.

## Privacy

- **Your events stay on your server.** Acuse makes exactly two kinds of
  outbound request, both of which you configured: the delivery to your
  destination, and the alert to your own alert URL.
- **No telemetry, no accounts, no phone-home.** No analytics, no update check,
  no third-party scripts or fonts. There is no hosted service, nothing to sign
  up for and nothing to opt out of.
- **Credentials are never stored.** Of the headers a webhook arrives with,
  Acuse keeps eight, chosen by name. `Authorization` and `Cookie` are not among
  them, so a sender's credentials never reach the database.
- **Nothing is deleted, including by us.** The data is in your Postgres, and
  only you can remove it.

The long version, including what is deliberately not hardened, is in
[SECURITY.md](SECURITY.md).

## Development

Node 20+ and Postgres.

```bash
createdb acuse
cp .env.example .env.local
npm install
npm run db:reset
npm run seed
npm run dev
```

```bash
npm run simulate -- --events=70 --seconds=140
npm test
```

## Enjoyed it?

If Acuse saved you an afternoon and you feel like saying thanks:

- [Cafecito](https://cafecito.app/rezamalena)
- [Ko-fi](https://ko-fi.com/malenitaa)

## License

MIT. See [LICENSE](LICENSE). Built by [malenitaa](https://github.com/malenitaa).
