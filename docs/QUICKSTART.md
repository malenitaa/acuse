# Quickstart

From zero to a rescued webhook in five minutes. Everything happens on your machine; the
only requirement is [Docker](https://www.docker.com/products/docker-desktop/).

## 0. Look at what you are about to run

You are about to run someone else's software on your machine, so here is the short
list of files that tell you what it does. All of them are readable without knowing
how to program, and they are the whole story:

- [`docker-compose.yml`](../docker-compose.yml): the two containers that start, the
  port they use and every setting you can turn on. Nothing else runs.
- [`Dockerfile`](../Dockerfile): how the app image is built, and the fact that it
  runs as an unprivileged user.
- [`db/schema.sql`](../db/schema.sql): the three tables, with a plain-English comment
  above each one saying what goes in it.
- [`SECURITY.md`](../SECURITY.md): what Acuse stores, what it refuses to store, and
  what it sends out.

Two things that should never happen, on this or on anything else: Acuse never asks
for your password, and it never asks you to turn off a protection your computer or
your browser puts up. If a copy of this asks you for either, something is wrong with
that copy. Do not turn the protection off.

## 1. Run it

```bash
git clone https://github.com/malenitaa/acuse.git
cd acuse
docker compose up -d
```

Open **http://localhost:3000**. You'll see the empty console with the three steps.

## 2. Create an integration

Click **+ new integration** and fill in:

- **Name**: `My first pipe`
- **Destination URL**: `http://localhost:3000/api/demo-sink?mode=ok`

That destination is a demo receiver Acuse ships with, so you don't need any other
service to try this. In real life you'd put your CRM, ERP or automation-platform endpoint here.

After creating it, the integration page shows your **ingest URL**, something like
`http://localhost:3000/api/i/ik_xxxxxxxx`. That's the URL you'd paste into whatever
emits your webhooks.

## 3. Send it a webhook

```bash
curl -X POST http://localhost:3000/api/i/<your-ingest-key> \
  -H 'content-type: application/json' \
  -d '{"order": 42, "total": "19.99"}'
```

You get `{"received": true, ...}` back instantly: the event is on disk before anyone
tries to deliver it. Within ~30 seconds the embedded worker delivers it; refresh the
dashboard and you'll see it **delivered**, with the full attempt recorded (status code,
duration, response).

You can also skip curl entirely: every integration page has a **Send an event** form,
including a date-time field to schedule a delivery for later.

## 4. Watch a rescue (the whole point)

Create a second integration with this destination:

```
http://localhost:3000/api/demo-sink?mode=recover&after=3
```

That demo receiver fails twice, then starts working: a destination having a bad
minute. Send it an event like in step 3 and watch the dashboard: the event fails, waits
(5s, then 15s, with jitter), retries… and lands. The big green number, **events
rescued**, goes up by one. Without Acuse in the middle, that webhook was gone.

## 5. Verify signatures at your destination (recommended)

Every delivery carries [Standard Webhooks](https://www.standardwebhooks.com) headers:

```
webhook-id:        evt_…
webhook-timestamp: 1674087231
webhook-signature: v1,K5oZ…=
```

Your destination can verify them with any Standard Webhooks library, or in Node with
no dependencies:

```js
const { createHmac, timingSafeEqual } = require('node:crypto')

function verify(secret, headers, rawBody, toleranceSeconds = 300) {
  const ts = Number(headers['webhook-timestamp'])
  if (!Number.isInteger(ts)) return false
  if (Math.abs(Date.now() / 1000 - ts) > toleranceSeconds) return false

  const key = secret.startsWith('whsec_')
    ? Buffer.from(secret.slice(6), 'base64')
    : Buffer.from(secret, 'utf8')
  const expected = `v1,${createHmac('sha256', key)
    .update(`${headers['webhook-id']}.${ts}.${rawBody}`)
    .digest('base64')}`

  return headers['webhook-signature'].split(' ').some((sig) => {
    const a = Buffer.from(sig.trim())
    const b = Buffer.from(expected)
    return a.length === b.length && timingSafeEqual(a, b)
  })
}
```

Each integration's signing secret is on its page in the console, under
**Signing secret**: masked by default, with **Reveal** and **Copy** buttons.

## Removing it, leaving nothing behind

Acuse installs nothing. It has no installer, no background agent, no login item, no
preferences file and no settings anywhere in your system. Everything it is lives in
two places: the folder you cloned, and Docker. Removing those two removes all of it.

**First, if you want to keep the events**, take them with you before deleting the
volume, because that step is permanent:

```bash
docker compose exec db pg_dump -U acuse acuse > acuse-backup.sql
```

**Then, from inside the folder you cloned:**

```bash
docker compose down -v --rmi local
```

That one command stops both containers and deletes them, deletes the database volume
with everything Acuse ever stored, deletes the private network it created, and
deletes the image that was built on your machine. Then delete the folder itself:

```bash
cd ..
rm -rf acuse
```

**Optional, and only if nothing else on your machine uses it**, the Postgres base
image that was downloaded:

```bash
docker image rm postgres:16-alpine
```

**Check for yourself that nothing survived.** These three commands should print
nothing at all:

```bash
docker ps -a --filter name=acuse
docker volume ls | grep acuse
docker image ls | grep acuse
```

If you ran it in development mode instead of Docker, there are two extra leftovers,
both inside the folder you are about to delete (`node_modules` and `.next`), plus the
database you created by hand, which you remove with `dropdb acuse`.

## Where to go next

- **Production notes**: set `CONSOLE_PASSWORD` (locks the console), and put a domain
  with HTTPS in front if you expose it beyond your network. What to lock down, and
  what stays open on purpose, is in [SECURITY.md](../SECURITY.md).
- **Failure alerts**: set `ALERT_WEBHOOK_URL` and exhausted events POST a JSON alert
  to your chat, your automation platform, or another Acuse.
- **Per-client branding**: set `INSTANCE_NAME: "Client X"` and the header reads
  «Acuse · Client X».
