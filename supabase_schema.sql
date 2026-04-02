create extension if not exists pgcrypto;

create table if not exists public.settings (
  id int primary key,
  brand_name text not null,
  tagline text,
  phone text,
  whatsapp text,
  instagram text,
  facebook text,
  address text,
  map_query text,
  hero_title text,
  hero_subtitle text,
  updated_at timestamptz default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  type text not null,
  price text not null,
  duration text,
  meta text,
  image_url text not null,
  description text,
  featured boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.settings enable row level security;
alter table public.offers enable row level security;

create policy "Public can read settings" on public.settings for select using (true);
create policy "Public can read offers" on public.offers for select using (true);

create policy "Authenticated users can modify settings" on public.settings
for all to authenticated
using (true)
with check (true);

create policy "Authenticated users can modify offers" on public.offers
for all to authenticated
using (true)
with check (true);

alter publication supabase_realtime add table public.settings;
alter publication supabase_realtime add table public.offers;
