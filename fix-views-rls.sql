-- ============================================================
-- FIX: Property views increment
-- Run in Supabase → SQL Editor → New Query
-- ============================================================

-- The issue: RLS on properties table blocks UPDATE from anonymous/logged-in users.
-- We need to allow anyone to increment the views column only.

-- Step 1: Allow authenticated and anonymous users to update views column only
drop policy if exists "Anyone can increment views" on public.properties;
create policy "Anyone can increment views"
  on public.properties
  for update
  using (true)
  with check (true);

-- Step 2: The above is too broad. Use a security definer function instead (safer).
-- This is the recommended pattern for view counting.

drop policy if exists "Anyone can increment views" on public.properties;

-- Create a secure function that bypasses RLS
create or replace function public.increment_property_views(prop_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.properties
  set views = coalesce(views, 0) + 1
  where id = prop_id;
end;
$$;

-- Grant execute to all (including anon)
grant execute on function public.increment_property_views(bigint) to anon, authenticated;

-- ============================================================
-- Also fix the old increment_views function if it exists
-- ============================================================
create or replace function public.increment_views(prop_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.properties
  set views = coalesce(views, 0) + 1
  where id = prop_id;
end;
$$;

grant execute on function public.increment_views(bigint) to anon, authenticated;
