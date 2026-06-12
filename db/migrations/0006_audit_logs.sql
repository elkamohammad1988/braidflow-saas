-- Audit log — an append-only trail of state-changing actions across the app
-- (booking lifecycle, refunds, settings). Written exclusively by server actions
-- and cron jobs via the service role.
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  -- The acting user, or null for system actions (e.g. the expiry cron).
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_entity_idx
  on audit_logs (entity_type, entity_id, created_at desc);
create index if not exists audit_logs_actor_idx
  on audit_logs (actor_id, created_at desc);
create index if not exists audit_logs_action_idx
  on audit_logs (action, created_at desc);

-- RLS on with NO policies: the table is invisible to the anon/authenticated
-- roles. The service role bypasses RLS, so server-side writes still work while
-- clients can neither read nor tamper with the trail.
alter table audit_logs enable row level security;
