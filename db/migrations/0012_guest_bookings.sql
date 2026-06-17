-- Guest booking (no account required to book + pay a deposit).
--
-- Forcing signup before the deposit screen is the single biggest drop-off in the
-- funnel. A guest now books with just name + email (+ optional phone); access to
-- the booking afterward (pay / confirmation / reschedule / cancel) is granted by
-- an unguessable capability token carried in the URL (`?t=`), never by the
-- booking id alone. Authenticated clients are unchanged: client_id is set, the
-- token is null, and RLS keeps working as before.

alter table bookings
  -- A guest booking has no profile row to point at.
  alter column client_id drop not null;

alter table bookings
  add column if not exists guest_name text,
  add column if not exists guest_email text,
  add column if not exists guest_phone text,
  -- High-entropy bearer token (32 random bytes, base64url) minted at creation for
  -- guest bookings. It — not the booking UUID, which leaks into logs/referrers —
  -- is the capability that authorizes managing the booking. Cleared if the
  -- booking is ever claimed by a real account.
  add column if not exists guest_token text;

-- Every booking must be reachable by exactly one of the two access paths:
--   - an account (client_id), or
--   - a guest with both an email to notify and a token to authorize.
-- This guarantees a guest booking can never be created unreachable.
alter table bookings
  add constraint booking_has_owner
  check (
    client_id is not null
    or (guest_email is not null and guest_token is not null)
  );

-- One booking per token; also the lookup key for token validation.
create unique index if not exists bookings_guest_token_key
  on bookings (guest_token)
  where guest_token is not null;

-- Supports a future "claim my guest bookings on signup" flow (match by email).
create index if not exists bookings_guest_email_idx
  on bookings (lower(guest_email))
  where guest_email is not null;
