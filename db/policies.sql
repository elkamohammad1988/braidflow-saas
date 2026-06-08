alter table profiles enable row level security;
alter table braiders enable row level security;
alter table services enable row level security;
alter table availability_rules enable row level security;
alter table availability_overrides enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;

create policy "profiles: self read"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles: self update"
  on profiles for update
  using (auth.uid() = id);

create policy "braiders: public read"
  on braiders for select
  using (true);

create policy "braiders: self write"
  on braiders for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "services: public read active"
  on services for select
  using (is_active or braider_id = auth.uid());

create policy "services: owner write"
  on services for all
  using (braider_id = auth.uid())
  with check (braider_id = auth.uid());

create policy "availability_rules: public read"
  on availability_rules for select
  using (true);

create policy "availability_rules: owner write"
  on availability_rules for all
  using (braider_id = auth.uid())
  with check (braider_id = auth.uid());

create policy "availability_overrides: public read"
  on availability_overrides for select
  using (true);

create policy "availability_overrides: owner write"
  on availability_overrides for all
  using (braider_id = auth.uid())
  with check (braider_id = auth.uid());

create policy "bookings: client or braider read"
  on bookings for select
  using (client_id = auth.uid() or braider_id = auth.uid());

create policy "bookings: client insert"
  on bookings for insert
  with check (client_id = auth.uid());

-- Mutations after creation go through server actions using the service role,
-- so we don't need a client-side update policy here.

create policy "payments: parties read"
  on payments for select
  using (
    exists (
      select 1 from bookings b
      where b.id = payments.booking_id
        and (b.client_id = auth.uid() or b.braider_id = auth.uid())
    )
  );
