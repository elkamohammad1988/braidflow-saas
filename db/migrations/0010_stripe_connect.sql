-- Stripe Connect (Express). Braiders receive client deposits directly into their
-- own connected account via destination charges; the platform takes no fee in
-- beta. A braider cannot accept bookings until Stripe enables charges. These
-- flags are kept in sync by the `account.updated` webhook and the onboarding
-- return route — never trusted from the client.
alter table braiders
  add column if not exists stripe_account_id text,
  -- Stripe account.charges_enabled — the booking gate. Deposits can only be
  -- created once this is true.
  add column if not exists charges_enabled boolean not null default false,
  -- Stripe account.payouts_enabled — the braider can receive payouts.
  add column if not exists payouts_enabled boolean not null default false,
  -- Stripe account.details_submitted — the braider finished the onboarding form
  -- (may still be under review before charges flip on).
  add column if not exists stripe_onboarding_complete boolean not null default false,
  -- Stamped once, the first time charges_enabled becomes true.
  add column if not exists onboarding_completed_at timestamptz;

-- One Stripe account per braider; also the lookup key the account.updated webhook
-- uses to map an event back to a braider row. Partial so existing rows with a
-- null account don't collide.
create unique index if not exists braiders_stripe_account_id_key
  on braiders (stripe_account_id)
  where stripe_account_id is not null;
