-- Profiles table holds public metadata for each authenticated user
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now())
);

-- Ensure entries/comments contain a user_id column even if tables already existed
alter table public.entries
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.comments
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Table defaults (only applied when table was missing before)
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  message text not null,
  image_url text not null,
  user_id uuid not null references auth.users(id) on delete cascade
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  user_id uuid not null references auth.users(id) on delete cascade
);

alter table public.profiles enable row level security;
alter table public.entries enable row level security;
alter table public.comments enable row level security;

-- cleanup existing policies before recreating (safe when rerun)
drop policy if exists "Anyone can read profiles" on public.profiles;
drop policy if exists "Users manage their profile" on public.profiles;
drop policy if exists "Anyone can read entries" on public.entries;
drop policy if exists "Authenticated users insert entries" on public.entries;
drop policy if exists "Owners update entries" on public.entries;
drop policy if exists "Owners delete entries" on public.entries;
drop policy if exists "Anyone can read comments" on public.comments;
drop policy if exists "Authenticated users insert comments" on public.comments;
drop policy if exists "Owners update comments" on public.comments;
drop policy if exists "Owners delete comments" on public.comments;

create policy "Anyone can read profiles"
  on public.profiles
  for select
  using (true);

create policy "Users manage their profile"
  on public.profiles
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Anyone can read entries"
  on public.entries
  for select
  using (true);

create policy "Authenticated users insert entries"
  on public.entries
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Owners update entries"
  on public.entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owners delete entries"
  on public.entries
  for delete
  using (auth.uid() = user_id);

create policy "Anyone can read comments"
  on public.comments
  for select
  using (true);

create policy "Authenticated users insert comments"
  on public.comments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Owners update comments"
  on public.comments
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owners delete comments"
  on public.comments
  for delete
  using (auth.uid() = user_id);
