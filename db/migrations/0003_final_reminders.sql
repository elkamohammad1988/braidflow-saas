alter table bookings
  add column if not exists final_reminder_sent_at timestamptz;

create index if not exists bookings_final_reminder_lookup_idx
  on bookings (scheduled_at)
  where status = 'confirmed' and final_reminder_sent_at is null;
