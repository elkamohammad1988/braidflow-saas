-- BraidFlow — production database schema (PostgreSQL / Supabase)
-- =============================================================================
-- This is the real backend the in-memory demo store (lib/db, types/db.ts)
-- emulates. Applying it and pointing db()/dbAdmin() at a Postgres client makes the
-- app production-backed with NO feature-code changes — every table, column, enum,
-- unique key and the booking overlap-exclusion constraint here match exactly what
-- the query builder and the server actions already expect (including the 23505 /
-- 23P01 error codes their retry & idempotency logic depends on).
--
-- Apply with the Supabase CLI:  supabase db push
-- (Authored to match types/db.ts; validate against a live database before use.)

create extension if not exists btree_gist;   -- overlap-exclusion on bookings
create extension if not exists pgcrypto;      -- gen_random_uuid()

-- --- Enums (mirror the string unions in types/db.ts) -------------------------
create type user_role       as enum ('braider', 'client');
create type booking_status  as enum ('pending_payment', 'confirmed', 'completed', 'cancelled', 'no_show');
create type payment_kind    as enum ('deposit', 'balance', 'refund');
create type payment_status  as enum ('pending', 'succeeded', 'failed', 'refunded');
create type override_kind   as enum ('block', 'open');

-- --- profiles (1:1 with auth.users) ------------------------------------------
create table profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       user_role   not null default 'client',
  full_name  text        not null,
  phone      text,
  email      text        not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- --- braiders ----------------------------------------------------------------
create table braiders (
  id                         uuid primary key references profiles (id) on delete cascade,
  slug                       text        not null unique,          -- 23505 → slug minting
  business_name              text        not null,
  bio                        text,
  city                       text,
  hero_image_url             text,
  instagram_handle           text,
  accepting_bookings         boolean     not null default false,
  timezone                   text        not null default 'America/New_York',
  stripe_account_id          text        unique,
  charges_enabled            boolean     not null default false,
  payouts_enabled            boolean     not null default false,
  stripe_onboarding_complete boolean     not null default false,
  onboarding_completed_at    timestamptz,
  created_at                 timestamptz not null default now()
);

-- --- services ----------------------------------------------------------------
create table services (
  id              uuid primary key default gen_random_uuid(),
  braider_id      uuid        not null references braiders (id) on delete cascade,
  name            text        not null,
  description     text,
  duration_minutes int        not null check (duration_minutes > 0),
  price_cents     int         not null check (price_cents >= 0),
  deposit_cents   int         not null check (deposit_cents >= 0 and deposit_cents <= price_cents),
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now()
);
create index services_braider_idx on services (braider_id);

-- --- availability_rules (weekly hours) ---------------------------------------
create table availability_rules (
  id           uuid primary key default gen_random_uuid(),
  braider_id   uuid not null references braiders (id) on delete cascade,
  day_of_week  int  not null check (day_of_week between 0 and 6),
  start_minute int  not null check (start_minute between 0 and 1440),
  end_minute   int  not null check (end_minute   between 0 and 1440),
  check (end_minute > start_minute)
);
create index availability_rules_braider_idx on availability_rules (braider_id);

-- --- availability_overrides (day blocks / extra openings) --------------------
create table availability_overrides (
  id         uuid primary key default gen_random_uuid(),
  braider_id uuid          not null references braiders (id) on delete cascade,
  starts_at  timestamptz   not null,
  ends_at    timestamptz   not null,
  kind       override_kind not null default 'block',
  note       text,
  check (ends_at > starts_at)
);
create index availability_overrides_braider_idx on availability_overrides (braider_id);

-- --- bookings ----------------------------------------------------------------
create table bookings (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid references profiles (id) on delete set null,
  braider_id     uuid           not null references braiders (id) on delete cascade,
  service_id     uuid           not null references services (id),
  scheduled_at   timestamptz    not null,
  duration_minutes int          not null check (duration_minutes > 0),
  price_cents    int            not null,
  deposit_cents  int            not null,
  status         booking_status not null default 'pending_payment',
  client_notes   text,
  guest_name     text,
  guest_email    text,
  guest_phone    text,
  guest_token    text,
  reminder_sent_at       timestamptz,
  final_reminder_sent_at timestamptz,
  created_at     timestamptz    not null default now(),
  -- Generated half-open range used by the exclusion constraint below.
  time_range     tstzrange generated always as (
    tstzrange(scheduled_at, scheduled_at + make_interval(mins => duration_minutes))
  ) stored,
  -- Every booking is either an account client or a guest with contact details.
  constraint booking_client_or_guest check (client_id is not null or guest_email is not null)
);

-- The overlap guard the money path relies on: two *active* bookings for the same
-- braider can never occupy overlapping time. A concurrent double-book raises
-- 23P01 (exclusion_violation) — exactly what lib/bookings/create.ts and
-- reschedule.ts already catch. Enforced by the database, so it holds under any
-- concurrency, unlike an application-level check.
alter table bookings
  add constraint bookings_no_overlap
  exclude using gist (braider_id with =, time_range with &&)
  where (status in ('pending_payment', 'confirmed'));

create index bookings_braider_time_idx on bookings (braider_id, scheduled_at);
create index bookings_client_idx        on bookings (client_id);
create index bookings_pending_idx       on bookings (scheduled_at) where status = 'pending_payment';
create index bookings_guest_token_idx   on bookings (guest_token) where guest_token is not null;

-- --- payments ----------------------------------------------------------------
create table payments (
  id                       uuid primary key default gen_random_uuid(),
  booking_id               uuid           not null references bookings (id) on delete cascade,
  kind                     payment_kind   not null,
  amount_cents             int            not null,
  status                   payment_status not null default 'pending',
  stripe_payment_intent_id text,
  stripe_charge_id         text,
  stripe_refund_id         text           unique,   -- 23505 → refund idempotency
  created_at               timestamptz    not null default now()
);
create index payments_booking_idx on payments (booking_id);

-- --- reviews (one per booking) -----------------------------------------------
create table reviews (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid        not null unique references bookings (id) on delete cascade,  -- 23505 → one review/booking
  braider_id uuid        not null references braiders (id) on delete cascade,
  client_id  uuid        references profiles (id) on delete set null,
  rating     int         not null check (rating between 1 and 5),
  body       text,
  created_at timestamptz not null default now()
);
create index reviews_braider_idx on reviews (braider_id);

-- --- audit_logs --------------------------------------------------------------
create table audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid,
  action      text        not null,
  entity_type text        not null,
  entity_id   uuid,
  metadata    jsonb       not null default '{}',
  created_at  timestamptz not null default now()
);
create index audit_logs_entity_idx on audit_logs (entity_type, entity_id);

-- --- stripe_webhook_events (idempotency ledger) ------------------------------
create table stripe_webhook_events (
  id         text primary key,        -- 23505 → webhook replay dedupe
  type       text        not null,
  created_at timestamptz not null default now()
);
