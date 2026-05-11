-- ============================================================
-- PropVerify — USER FEATURES SCHEMA UPDATE
-- Run this in Supabase → SQL Editor → New Query
-- Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT)
-- ============================================================

-- 1. Add email column to profiles
alter table public.profiles
  add column if not exists email text;

-- 2. Backfill email from auth.users for existing profiles
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- 3. Update trigger to save email on new signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, phone, full_name, role)
  values (
    new.id,
    new.email,
    new.phone,
    new.raw_user_meta_data->>'full_name',
    'buyer'
  )
  on conflict (id) do update set
    email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

-- 4. Add profile insert policy (needed for email auth)
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- 5. FAVORITES table
create table if not exists public.favorites (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users on delete cascade not null,
  property_id bigint references public.properties on delete cascade not null,
  created_at  timestamptz default now(),
  unique(user_id, property_id)
);
alter table public.favorites enable row level security;
drop policy if exists "Users manage own favorites" on public.favorites;
create policy "Users manage own favorites" on public.favorites
  for all using (auth.uid() = user_id);

-- 6. Add user_id to inquiries (link inquiry to logged-in user)
alter table public.inquiries
  add column if not exists user_id uuid references auth.users;

-- Allow users to read their own inquiries
drop policy if exists "Users can read own inquiries" on public.inquiries;
create policy "Users can read own inquiries" on public.inquiries
  for select using (auth.uid() = user_id);

-- ============================================================
-- After running, set yourself as admin:
-- UPDATE public.profiles SET role = 'admin'
-- WHERE email = 'your@email.com';
-- ============================================================
