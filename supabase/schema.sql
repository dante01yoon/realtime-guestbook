-- Profiles table holds public metadata for each authenticated user
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id uuid unique references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Backfill/align columns when table already existed
alter table public.profiles
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
update public.profiles set user_id = coalesce(user_id, id) where user_id is null;
alter table public.profiles
  add column if not exists display_name text;
alter table public.profiles
  add column if not exists nickname text;
update public.profiles
set nickname = left(coalesce(nullif(nickname, ''), display_name, '방명록 사용자'), 20)
where nickname is null or nickname = '';
alter table public.profiles
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

-- display_name should not block inserts; keep optional and sync with nickname when missing
alter table public.profiles alter column display_name drop not null;
alter table public.profiles alter column display_name set default null;
update public.profiles
set display_name = coalesce(nullif(display_name, ''), nickname, '방명록 사용자')
where display_name is null or display_name = '';

-- Constraints for nickname uniqueness and length/charset (basic)
alter table public.profiles drop constraint if exists profiles_nickname_unique;
alter table public.profiles add constraint profiles_nickname_unique unique (nickname);
alter table public.profiles drop constraint if exists profiles_nickname_length;
alter table public.profiles add constraint profiles_nickname_length check (char_length(nickname) between 2 and 20);

-- Ensure entries/comments contain a user_id column even if tables already existed
alter table public.entries
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.entries
  add column if not exists author text;
alter table public.entries alter column author drop not null;
alter table public.entries alter column author set default null;

alter table public.comments
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Author profile linkage
alter table public.entries
  add column if not exists author_profile_id uuid references public.profiles(id) on delete cascade;
alter table public.comments
  add column if not exists author_profile_id uuid references public.profiles(id) on delete cascade;
alter table public.comments
  add column if not exists author text;
alter table public.comments alter column author drop not null;
alter table public.comments alter column author set default null;

-- Backfill author_profile_id where possible
update public.entries set author_profile_id = user_id where author_profile_id is null;
update public.comments set author_profile_id = user_id where author_profile_id is null;

-- Table defaults (only applied when table was missing before)
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  message text not null,
  image_url text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_profile_id uuid references public.profiles(id) on delete cascade
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_profile_id uuid references public.profiles(id) on delete cascade
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
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Anyone can read entries"
  on public.entries
  for select
  using (true);

create policy "Authenticated users insert entries"
  on public.entries
  for insert
  to authenticated
  with check (auth.uid() = user_id and (author_profile_id is null or author_profile_id = auth.uid()));

create policy "Owners update entries"
  on public.entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and (author_profile_id is null or author_profile_id = auth.uid()));

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
  with check (auth.uid() = user_id and (author_profile_id is null or author_profile_id = auth.uid()));

create policy "Owners update comments"
  on public.comments
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and (author_profile_id is null or author_profile_id = auth.uid()));

create policy "Owners delete comments"
  on public.comments
  for delete
  using (auth.uid() = user_id);

-- Storage bucket for avatars
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do update set public = true;

-- Ensure storage policies for avatars bucket
drop policy if exists "Avatar images are publicly readable" on storage.objects;
create policy "Avatar images are publicly readable"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatars" on storage.objects;
create policy "Users can upload their own avatars"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update their own avatars" on storage.objects;
create policy "Users can update their own avatars"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete their own avatars" on storage.objects;
create policy "Users can delete their own avatars"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
