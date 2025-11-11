create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  author text not null,
  message text not null,
  image_url text not null
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  author text not null,
  body text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.entries enable row level security;
alter table public.comments enable row level security;

create policy "Allow anonymous insert entries"
  on public.entries
  for insert
  to anon
  with check (true);

create policy "Allow anonymous select entries"
  on public.entries
  for select
  to anon
  using (true);

create policy "Allow anonymous insert comments"
  on public.comments
  for insert
  to anon
  with check (true);

create policy "Allow anonymous select comments"
  on public.comments
  for select
  to anon
  using (true);
