-- Reviews — clients rate a completed booking. One review per booking.
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id) on delete cascade,
  braider_id uuid not null references braiders(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now()
);

create index if not exists reviews_braider_created_idx
  on reviews (braider_id, created_at desc);

alter table reviews enable row level security;

-- Anyone can read reviews (public proof on braider pages).
drop policy if exists reviews_public_read on reviews;
create policy reviews_public_read on reviews
  for select using (true);

-- A client can insert a review only for THEIR completed booking, exactly once.
drop policy if exists reviews_client_insert on reviews;
create policy reviews_client_insert on reviews
  for insert with check (
    client_id = auth.uid()
    and exists (
      select 1 from bookings b
      where b.id = booking_id
        and b.client_id = auth.uid()
        and b.status = 'completed'
    )
  );

-- A client can edit / delete their own review.
drop policy if exists reviews_client_update on reviews;
create policy reviews_client_update on reviews
  for update using (client_id = auth.uid());

drop policy if exists reviews_client_delete on reviews;
create policy reviews_client_delete on reviews
  for delete using (client_id = auth.uid());
