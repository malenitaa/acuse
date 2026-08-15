-- Acuse schema.
--
-- Two rules shape everything here:
--   1. An event is written to disk before we answer the sender. We never lose one.
--   2. Every delivery attempt is kept, forever. The attempt log is the product;
--      without it an operator has no reason to believe the numbers on screen.

drop table if exists attempts cascade;
drop table if exists events cascade;
drop table if exists endpoints cascade;

-- One row per integration a customer wires up: "Shopify orders -> our ERP".
create table endpoints (
  id              text primary key,
  name            text not null,
  -- Public half of the ingest URL: POST /api/i/<ingest_key>
  ingest_key      text not null unique,
  destination_url text not null,
  -- Used to sign outgoing deliveries so the destination can verify us.
  signing_secret  text not null,
  max_attempts    int  not null default 8,
  paused          boolean not null default false,
  created_at      timestamptz not null default now()
);

-- One row per webhook received. Rows are never deleted, only re-driven.
create table events (
  id              text primary key,
  endpoint_id     text not null references endpoints(id) on delete cascade,
  -- Senders that retry on their own would otherwise create duplicates.
  dedupe_key      text,
  payload         jsonb not null,
  headers         jsonb not null default '{}'::jsonb,
  source_ip       text,
  -- pending: owed a delivery. delivered: 2xx received. dead: gave up, needs a human.
  status          text not null default 'pending'
                    check (status in ('pending', 'delivered', 'dead')),
  attempt_count   int  not null default 0,
  next_attempt_at timestamptz not null default now(),
  received_at     timestamptz not null default now(),
  delivered_at    timestamptz,
  last_error      text,
  -- Lease held by a worker mid-delivery, so two workers never double-send.
  locked_at       timestamptz
);

create unique index events_dedupe_idx
  on events (endpoint_id, dedupe_key) where dedupe_key is not null;
create index events_queue_idx on events (status, next_attempt_at);
create index events_recent_idx on events (endpoint_id, received_at desc);

-- The audit trail. One row per HTTP request we made to the destination.
create table attempts (
  id            bigserial primary key,
  event_id      text not null references events(id) on delete cascade,
  n             int  not null,
  started_at    timestamptz not null default now(),
  duration_ms   int,
  status_code   int,
  response_body text,
  error         text,
  outcome       text not null check (outcome in ('success', 'failure')),
  -- True when a human pressed "reenviar" instead of the scheduler picking it up.
  manual        boolean not null default false
);

create index attempts_event_idx on attempts (event_id, n);
create index attempts_recent_idx on attempts (started_at desc);
