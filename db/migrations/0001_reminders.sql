alter table bookings
  add column if not exists reminder_sent_at timestamptz;

create index if not exists bookings_reminder_lookup_idx
  on bookings (scheduled_at)
  where status = 'confirmed' and reminder_sent_at is null;
