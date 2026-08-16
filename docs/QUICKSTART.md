# Quickstart

From zero to a rescued webhook in five minutes. Everything happens on your machine; the
only requirement is [Docker](https://www.docker.com/products/docker-desktop/).

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

After creating it, the integration page shows your **ingest URL** — something like
`http://localhost:3000/api/i/ik_xxxxxxxx`. That's the URL you'd paste into whatever
emits your webhooks.

## 3. Send it a webhook

```bash
curl -X POST http://localhost:3000/api/i/<your-ingest-key> \
  -H 'content-type: application/json' \
  -d '{"order": 42, "total": "19.99"}'
```

You get `{"received": true, ...}` back instantly — the event is on disk before anyone
tries to deliver it. Within ~30 seconds the embedded worker delivers it; refresh the
dashboard and you'll see it **delivered**, with the full attempt recorded (status code,
duration, response).

You can also skip curl entirely: every integration page has a **Send an event** form —
including a date-time field to schedule a delivery for later.

## 4. Watch a rescue (the whole point)

Create a second integration with this destination:

```
http://localhost:3000/api/demo-sink?mode=recover&after=3
```

That demo receiver fails twice, then starts working — a destination having a bad
minute. Send it an event like in step 3 and watch the dashboard: the event fails, waits
(5s, then 15s, with jitter), retries… and lands. The big green number — **events
rescued** — goes up by one. Without Acuse in the middle, that webhook was gone.

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

The signing secret of each integration lives in the `endpoints` table
(`docker compose exec db psql -U acuse -c "select name, signing_secret from endpoints"`).

## Where to go next

- **Production notes** — set `CONSOLE_PASSWORD` (locks the console), and put a domain
  with HTTPS in front if you expose it beyond your network. See the
  [README](../README.md#security).
- **Failure alerts** — set `ALERT_WEBHOOK_URL` and exhausted events POST a JSON alert
  to your chat, your automation platform, or another Acuse.
- **Per-client branding** — set `INSTANCE_NAME: "Client X"` and the header reads
  «Acuse · Client X».
