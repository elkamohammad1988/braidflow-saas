-- Security hardening (audit 2026-06-15).

-- 1) availability_overrides leaked every braider's private time-off notes to
--    anonymous users via `using (true)` (the table has a free-text `note`
--    column). The booking page now reads override *windows* server-side with the
--    service role and never selects `note`, so the public read is unnecessary —
--    restrict it to the owner.
drop policy if exists "availability_overrides: public read" on availability_overrides;
create policy "availability_overrides: owner read"
  on availability_overrides for select
  using (braider_id = auth.uid());

-- 2) A review could be re-pointed to another braider/booking after the fact: the
--    UPDATE policy had no WITH CHECK and `authenticated` held a blanket column
--    UPDATE grant. Lock edits to the owner and to the two genuinely-mutable
--    columns, so braider_id / booking_id / client_id can never be reassigned
--    (closes the review-fraud vector). Mirrors the profiles fix in 0007.
drop policy if exists reviews_client_update on reviews;
create policy reviews_client_update on reviews
  for update
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

revoke update on reviews from authenticated;
grant update (rating, body) on reviews to authenticated;
