-- ============================================================
-- PropVerify — Supabase Database Schema
-- Run this ENTIRE file in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  phone text,
  full_name text,
  role text default 'buyer' check (role in ('admin', 'agent', 'buyer')),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for all using (
  exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.role = 'admin')
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, phone, role)
  values (new.id, new.phone, 'buyer')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. PROPERTIES
create table if not exists public.properties (
  id bigint generated always as identity primary key,
  title text not null,
  type text not null default 'Apartment',
  status text not null default 'Ready to Move',
  city text not null,
  area text not null default '',
  location text not null,
  price bigint not null,
  price_per_sqft int default 0,
  bhk int default 2,
  sqft int default 1000,
  floor text default '',
  facing text default '',
  builder text default '',
  builder_trust numeric(3,1) default 0,
  legal_score numeric(3,1) default 0,
  sunlight_hrs numeric(3,1) default 0,
  rera_id text default '',
  possession text default '',
  amenities text[] default '{}',
  highlights text[] default '{}',
  description text default '',
  images text[] default '{}',
  tag text default '',
  tag_type text default 'blue',
  views int default 0,
  is_featured boolean default false,
  created_by uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.properties enable row level security;
drop policy if exists "Properties are publicly readable" on public.properties;
drop policy if exists "Admins can manage properties" on public.properties;
create policy "Properties are publicly readable" on public.properties for select using (true);
create policy "Admins can manage properties" on public.properties for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 3. INQUIRIES
create table if not exists public.inquiries (
  id bigint generated always as identity primary key,
  property_id bigint references public.properties on delete set null,
  property_title text,
  name text not null,
  phone text not null,
  message text default '',
  consent boolean default true,
  status text default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz default now()
);
alter table public.inquiries enable row level security;
drop policy if exists "Anyone can create inquiry" on public.inquiries;
drop policy if exists "Admins can read inquiries" on public.inquiries;
drop policy if exists "Admins can update inquiries" on public.inquiries;
create policy "Anyone can create inquiry" on public.inquiries for insert with check (true);
create policy "Admins can read inquiries" on public.inquiries for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update inquiries" on public.inquiries for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 4. Storage bucket for images
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;
drop policy if exists "Anyone can view images" on storage.objects;
drop policy if exists "Admins can upload images" on storage.objects;
drop policy if exists "Admins can delete images" on storage.objects;
create policy "Anyone can view images" on storage.objects for select using (bucket_id = 'property-images');
create policy "Admins can upload images" on storage.objects for insert with check (
  bucket_id = 'property-images' and
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can delete images" on storage.objects for delete using (
  bucket_id = 'property-images' and
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 5. Increment views function
create or replace function increment_views(prop_id bigint)
returns void as $$
begin
  update public.properties set views = views + 1 where id = prop_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- AFTER your first login via Phone OTP, run this to make
-- yourself admin (replace with your actual phone number):
-- UPDATE public.profiles SET role = 'admin' WHERE phone = '+91XXXXXXXXXX';
-- ============================================================

-- ============================================================
-- EMAIL AUTH FIX — Run this if using Email OTP instead of Phone
-- ============================================================

-- Update the trigger to handle email-based signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, phone, full_name, role)
  values (
    new.id,
    new.phone,
    new.raw_user_meta_data->>'full_name',
    'buyer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Allow profile insert from client (needed for email auth fallback)
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
