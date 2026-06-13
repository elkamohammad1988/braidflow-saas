-- Privilege-escalation fix.
--
-- The "profiles: self update" policy had a USING clause but no WITH CHECK and no
-- column restriction, so an authenticated user could UPDATE their own
-- profiles.role to 'braider' straight through PostgREST with the anon key and
-- self-promote into the braider dashboard. Lock it down two ways:
--
--   1. Column grants: end users may only update the harmless profile fields.
--      `role` (and id / created_at) can now only be set by the security-definer
--      signup trigger (handle_new_user) or the service role, both of which
--      bypass these grants.
--   2. WITH CHECK on the policy pins the row identity on update.
--
-- The settings server action only writes full_name + phone via the
-- authenticated client, so it is unaffected.

revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

drop policy if exists "profiles: self update" on public.profiles;
create policy "profiles: self update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
