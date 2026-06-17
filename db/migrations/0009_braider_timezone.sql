-- Braider timezone.
--
-- A braider's weekly availability is stored as wall-clock minutes-of-day
-- (availability_rules.start_minute / end_minute) with NO zone. Slot generation
-- ran in the SERVER's local zone (UTC on Vercel) and every appointment time was
-- rendered in each viewer's BROWSER zone — so a braider who set "9am–5pm" had
-- their slots computed as 09:00–17:00 UTC and shown to a New York client as
-- 04:00–12:00. This column stores the braider's IANA timezone (e.g.
-- 'America/New_York') so availability is interpreted, and appointment times are
-- displayed, in the braider's actual local time regardless of who is looking.
--
-- Default keeps existing rows valid; braiders set their real zone in Settings.
alter table braiders
  add column if not exists timezone text not null default 'America/New_York';
