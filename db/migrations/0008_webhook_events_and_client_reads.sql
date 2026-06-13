-- 1. Webhook idempotency.
-- Dedupe Stripe events by id so a duplicate/at-least-once delivery is processed
-- at most once (defense in depth on top of the guarded status transitions).
-- Written only by the webhook handler via the service role.
create table if not exists stripe_webhook_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

alter table stripe_webhook_events enable row level security;
-- No policies: service-role only, invisible to anon/authenticated.

-- 2. Let a braider read the profiles of clients who have booked with them.
-- The base "profiles: self read" policy only exposed the braider's own row, so
-- under RLS the dashboard (appointments / clients / calendar) rendered every
-- client name and phone as blank. This grant is scoped to actual bookings — it
-- is NOT a public read of the profiles table.
drop policy if exists "profiles: braider reads own clients" on public.profiles;
create policy "profiles: braider reads own clients"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.bookings b
      where b.client_id = profiles.id
        and b.braider_id = auth.uid()
    )
  );
