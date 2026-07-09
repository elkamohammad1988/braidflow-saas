-- BraidFlow — Row Level Security
-- =============================================================================
-- Defense in depth for the production backend: even if an application-level
-- ownership check is ever missed, the database refuses cross-tenant reads/writes.
-- This is the real security boundary the demo's db()/dbAdmin() split only stands
-- in for. `db()` maps to the RLS-enforced anon/authenticated client; `dbAdmin()`
-- maps to the service-role client, which bypasses RLS for trusted server work
-- (webhooks, cron, and guest-capability-token paths validated in application code).

-- --- profiles ----------------------------------------------------------------
alter table profiles enable row level security;

create policy profiles_self_read on profiles
  for select using (auth.uid() = id);
-- A braider's profile is public so their name shows on the directory/profile.
create policy profiles_public_braider_read on profiles
  for select using (exists (select 1 from braiders b where b.id = profiles.id));
create policy profiles_self_update on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- --- braiders (public directory) ---------------------------------------------
alter table braiders enable row level security;

create policy braiders_public_read on braiders
  for select using (true);
create policy braiders_owner_write on braiders
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- --- services ----------------------------------------------------------------
alter table services enable row level security;

create policy services_public_read on services
  for select using (is_active or braider_id = auth.uid());
create policy services_owner_write on services
  for all using (braider_id = auth.uid()) with check (braider_id = auth.uid());

-- --- availability ------------------------------------------------------------
alter table availability_rules enable row level security;
create policy availability_rules_public_read on availability_rules
  for select using (true);
create policy availability_rules_owner_write on availability_rules
  for all using (braider_id = auth.uid()) with check (braider_id = auth.uid());

alter table availability_overrides enable row level security;
create policy availability_overrides_public_read on availability_overrides
  for select using (true);
create policy availability_overrides_owner_write on availability_overrides
  for all using (braider_id = auth.uid()) with check (braider_id = auth.uid());

-- --- bookings ----------------------------------------------------------------
-- Authenticated parties see/act on their own bookings only. Guest bookings (no
-- auth.uid) are created, read and mutated by the server via the service role
-- AFTER validating the booking's capability token — so RLS here governs the
-- signed-in surface, and the token is the guest surface's equivalent check.
alter table bookings enable row level security;

create policy bookings_client_read on bookings
  for select using (client_id = auth.uid());
create policy bookings_braider_read on bookings
  for select using (braider_id = auth.uid());
create policy bookings_client_insert on bookings
  for insert with check (client_id = auth.uid());
create policy bookings_party_update on bookings
  for update using (client_id = auth.uid() or braider_id = auth.uid())
  with check (client_id = auth.uid() or braider_id = auth.uid());

-- --- payments ----------------------------------------------------------------
-- Read-only to the booking's parties; all writes are server-side (service role)
-- from the Stripe webhook and the booking/refund actions.
alter table payments enable row level security;

create policy payments_party_read on payments
  for select using (
    exists (
      select 1 from bookings bk
      where bk.id = payments.booking_id
        and (bk.client_id = auth.uid() or bk.braider_id = auth.uid())
    )
  );

-- --- reviews -----------------------------------------------------------------
alter table reviews enable row level security;

create policy reviews_public_read on reviews
  for select using (true);
-- A client may review only their OWN completed booking (server also enforces this).
create policy reviews_client_insert on reviews
  for insert with check (
    client_id = auth.uid()
    and exists (
      select 1 from bookings bk
      where bk.id = reviews.booking_id
        and bk.client_id = auth.uid()
        and bk.status = 'completed'
    )
  );

-- --- audit_logs & webhook ledger --------------------------------------------
-- RLS on with NO policies → default-deny for anon/authenticated; only the
-- service role (server) can read or write. These never touch the client.
alter table audit_logs enable row level security;
alter table stripe_webhook_events enable row level security;
