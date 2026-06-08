-- Demo seed data for BraidFlow.
--
-- HOW TO USE:
-- 1. Sign up through the app at /signup as a *braider* using these credentials:
--      email:    demo-braider@braidflow.app
--      password: any password you'll remember
--      name:     Amara Okafor
-- 2. Sign up another account as a *client*:
--      email:    demo-client@braidflow.app
--      password: any password
--      name:     Naomi Carter
-- 3. Run this file in Supabase SQL Editor (or psql with service role).
-- 4. Visit /braiders/amaras-studio to see a fully-populated public profile.
--
-- This script is idempotent — safe to re-run.

do $$
declare
  v_braider_id uuid;
  v_client_id uuid;
  v_service_box_medium uuid;
begin
  select id into v_braider_id from auth.users where email = 'demo-braider@braidflow.app';
  select id into v_client_id  from auth.users where email = 'demo-client@braidflow.app';

  if v_braider_id is null then
    raise exception 'Sign up demo-braider@braidflow.app as a braider first (see seed.sql header).';
  end if;

  -- Make sure the profile is flagged as braider (in case it signed up as client).
  update profiles set role = 'braider' where id = v_braider_id;

  -- Braider profile.
  insert into braiders (id, slug, business_name, bio, city, hero_image_url, instagram_handle, accepting_bookings)
  values (
    v_braider_id,
    'amaras-studio',
    'Amara''s Studio',
    'Knotless box braids, micros, and protective styles. Booking 2–3 weeks out. Hair included on every service.',
    'Brooklyn, NY',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
    'amaras.studio',
    true
  )
  on conflict (id) do update set
    slug = excluded.slug,
    business_name = excluded.business_name,
    bio = excluded.bio,
    city = excluded.city,
    hero_image_url = excluded.hero_image_url,
    instagram_handle = excluded.instagram_handle,
    accepting_bookings = excluded.accepting_bookings;

  -- Services (named uniquely per braider so we can find them again on re-run).
  delete from services where braider_id = v_braider_id;

  insert into services (braider_id, name, description, duration_minutes, price_cents, deposit_cents)
  values
    (v_braider_id, 'Knotless box braids — medium', 'Mid-back length, hair included.', 360, 28000, 5000),
    (v_braider_id, 'Knotless box braids — small',  'Mid-back length, hair included.', 480, 34000, 5000),
    (v_braider_id, 'Micro braids',                  'Shoulder length, hair included.',  600, 42000, 7500),
    (v_braider_id, 'Goddess locs — short',          'Shoulder length, hair included.',  300, 26000, 4500);

  -- Weekly availability: Tue–Fri 9–18, Sat 10–17.
  delete from availability_rules where braider_id = v_braider_id;
  insert into availability_rules (braider_id, day_of_week, start_minute, end_minute) values
    (v_braider_id, 2, 540, 1080),
    (v_braider_id, 3, 540, 1080),
    (v_braider_id, 4, 540, 1080),
    (v_braider_id, 5, 540, 1080),
    (v_braider_id, 6, 600, 1020);

  -- Block off Christmas Day next time it comes around (demo override).
  delete from availability_overrides where braider_id = v_braider_id;
  insert into availability_overrides (braider_id, starts_at, ends_at, kind, note)
  values (
    v_braider_id,
    date_trunc('day', (current_date + interval '14 days'))::timestamptz,
    date_trunc('day', (current_date + interval '15 days'))::timestamptz,
    'block',
    'Personal day'
  );

  raise notice 'Seeded braider profile, 4 services, weekly hours, and 1 day block.';

  -- Optional: seed a sample completed booking + review if the demo client also exists.
  if v_client_id is not null then
    update profiles set role = 'client' where id = v_client_id;

    select id into v_service_box_medium from services
      where braider_id = v_braider_id and name = 'Knotless box braids — medium';

    -- A completed booking from 30 days ago, so a review can attach to it.
    delete from bookings where braider_id = v_braider_id and client_id = v_client_id;
    delete from reviews  where braider_id = v_braider_id and client_id = v_client_id;

    insert into bookings (client_id, braider_id, service_id, scheduled_at, duration_minutes, status, price_cents, deposit_cents)
    values (
      v_client_id, v_braider_id, v_service_box_medium,
      (current_date - interval '30 days' + time '11:00')::timestamptz,
      360, 'completed', 28000, 5000
    );

    insert into reviews (booking_id, braider_id, client_id, rating, body)
    select id, v_braider_id, v_client_id, 5,
      'Best braids I''ve had in years. Amara is meticulous, and the deposit flow meant no awkward "are we still on?" texts. Already rebooking.'
    from bookings
    where braider_id = v_braider_id and client_id = v_client_id
    limit 1;

    raise notice 'Seeded 1 completed booking and 1 5-star review from demo client.';
  end if;
end $$;
