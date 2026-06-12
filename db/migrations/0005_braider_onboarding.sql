-- Braider onboarding fix.
--
-- Before this migration, handle_new_user() only created a `profiles` row. A
-- braider-role signup therefore had NO `braiders` record, which made the
-- settings UPDATE match zero rows (silent success) and left the braider with no
-- public slug / booking page. This migration:
--   1. Adds helper functions to slugify a name and pick a unique braider slug.
--   2. Rewrites handle_new_user() to also create a braiders row for braiders.
--   3. Backfills braiders rows for any existing braider profiles missing one.

-- Normalise arbitrary text into a URL-safe slug fragment.
create or replace function public.slugify(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from
    regexp_replace(
      regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g'),
      '-+', '-', 'g'
    )
  );
$$;

-- Return a braider slug that is guaranteed unique, deriving it from `base` and
-- appending an incrementing suffix on collision. Falls back to 'braider' when
-- the base slugifies to an empty string.
create or replace function public.unique_braider_slug(base text)
returns text
language plpgsql
as $$
declare
  root text := nullif(public.slugify(base), '');
  candidate text;
  suffix int := 1;
begin
  if root is null then
    root := 'braider';
  end if;
  candidate := root;
  while exists (select 1 from public.braiders where slug = candidate) loop
    suffix := suffix + 1;
    candidate := root || '-' || suffix;
  end loop;
  return candidate;
end;
$$;

-- Create profile + role on signup, and a braiders row when the role is braider.
-- business_name defaults to the person's name; the braider edits it (and the
-- rest of their public page) from Settings afterwards.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role := coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'client');
  v_name text := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1));
begin
  insert into public.profiles (id, role, full_name, phone)
  values (new.id, v_role, v_name, new.raw_user_meta_data ->> 'phone');

  if v_role = 'braider' then
    insert into public.braiders (id, slug, business_name)
    values (new.id, public.unique_braider_slug(v_name), v_name)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

-- Backfill: every existing braider profile without a braiders row gets one.
-- Looped (rather than a single INSERT...SELECT) so unique_braider_slug() sees
-- each freshly-inserted sibling and never hands out a duplicate slug.
do $$
declare
  r record;
begin
  for r in
    select p.id, p.full_name
    from public.profiles p
    where p.role = 'braider'
      and not exists (select 1 from public.braiders b where b.id = p.id)
  loop
    insert into public.braiders (id, slug, business_name)
    values (r.id, public.unique_braider_slug(r.full_name), r.full_name)
    on conflict (id) do nothing;
  end loop;
end $$;
