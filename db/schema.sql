create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

create type user_role as enum ('client', 'braider');
create type booking_status as enum ('pending_payment', 'confirmed', 'completed', 'cancelled', 'no_show');
create type payment_kind as enum ('deposit', 'balance', 'refund');
create type payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null,
  full_name text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table braiders (
  id uuid primary key references profiles(id) on delete cascade,
  slug text unique not null,
  business_name text not null,
  bio text,
  city text,
  hero_image_url text,
  instagram_handle text,
  accepting_bookings boolean not null default true,
  -- IANA timezone (e.g. 'America/New_York'). Availability minutes-of-day are
  -- interpreted in this zone, and appointment times are rendered in it. See
  -- migration 0009.
  timezone text not null default 'America/New_York',
  -- Stripe Connect (Express). Deposits route to this connected account; a braider
  -- cannot accept bookings until charges are enabled. Flags are synced from the
  -- account.updated webhook and the onboarding return route. See migration 0010.
  stripe_account_id text,
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  stripe_onboarding_complete boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index on braiders (city) where accepting_bookings;
create unique index braiders_stripe_account_id_key
  on braiders (stripe_account_id)
  where stripe_account_id is not null;

create table services (
  id uuid primary key default gen_random_uuid(),
  braider_id uuid not null references braiders(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes int not null check (duration_minutes between 30 and 1440),
  price_cents int not null check (price_cents >= 0),
  deposit_cents int not null check (deposit_cents >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint deposit_not_above_price check (deposit_cents <= price_cents)
);

create index on services (braider_id) where is_active;

create table availability_rules (
  id uuid primary key default gen_random_uuid(),
  braider_id uuid not null references braiders(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_minute int not null check (start_minute between 0 and 1439),
  end_minute int not null check (end_minute between 1 and 1440),
  constraint rule_window_valid check (end_minute > start_minute)
);

create index on availability_rules (braider_id, day_of_week);

create table availability_overrides (
  id uuid primary key default gen_random_uuid(),
  braider_id uuid not null references braiders(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  kind text not null check (kind in ('block', 'open')),
  note text,
  constraint override_window_valid check (ends_at > starts_at)
);

create index on availability_overrides (braider_id, starts_at);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  -- Null for guest bookings (no account). Guests are identified by the guest_*
  -- columns below and authorize actions with guest_token. See migration 0012.
  client_id uuid references profiles(id) on delete restrict,
  braider_id uuid not null references braiders(id) on delete restrict,
  service_id uuid not null references services(id) on delete restrict,
  scheduled_at timestamptz not null,
  duration_minutes int not null check (duration_minutes > 0),
  status booking_status not null default 'pending_payment',
  price_cents int not null,
  deposit_cents int not null,
  client_notes text,
  -- Guest checkout: contact details collected at booking time instead of a
  -- profile, plus a capability token that authorizes managing the booking.
  guest_name text,
  guest_email text,
  guest_phone text,
  guest_token text,
  created_at timestamptz not null default now(),
  -- Every booking is reachable by an account OR a guest (email + token).
  constraint booking_has_owner check (
    client_id is not null
    or (guest_email is not null and guest_token is not null)
  ),
  -- Range column used to enforce no-overlap per braider via the gist exclusion
  -- below. This is a PLAIN column (not GENERATED): the expression
  -- `scheduled_at + interval` is only STABLE, not IMMUTABLE, and Postgres
  -- rejects non-immutable expressions in a generated column (error 42P17).
  -- It is kept in sync by the set_booking_time_range() trigger instead.
  time_range tstzrange,
  constraint no_overlap_per_braider
    exclude using gist (
      braider_id with =,
      time_range with &&
    ) where (status in ('pending_payment', 'confirmed'))
);

create index on bookings (client_id, scheduled_at desc);
create index on bookings (braider_id, scheduled_at);
create unique index bookings_guest_token_key
  on bookings (guest_token)
  where guest_token is not null;
create index bookings_guest_email_idx
  on bookings (lower(guest_email))
  where guest_email is not null;

-- Populate time_range from scheduled_at + duration. Runs BEFORE the row is
-- written so the gist exclusion constraint sees the computed range. This
-- replaces a GENERATED ALWAYS column (which Postgres won't allow here because
-- timestamptz + interval is not immutable). make_interval() is used so the
-- minutes value is passed as a real argument rather than built from text.
create or replace function set_booking_time_range()
returns trigger
language plpgsql
as $$
begin
  new.time_range := tstzrange(
    new.scheduled_at,
    new.scheduled_at + make_interval(mins => new.duration_minutes),
    '[)'
  );
  return new;
end;
$$;

create trigger bookings_set_time_range
  before insert or update of scheduled_at, duration_minutes on bookings
  for each row execute function set_booking_time_range();

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  kind payment_kind not null,
  amount_cents int not null,
  status payment_status not null default 'pending',
  stripe_payment_intent_id text unique,
  stripe_charge_id text,
  created_at timestamptz not null default now()
);

create index on payments (booking_id);

-- Create profile + role on signup. Role + name come from raw_user_meta_data.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'client'),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
