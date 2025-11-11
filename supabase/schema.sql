create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  author text not null,
  message text not null,
  image_url text not null
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  author text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.entries enable row level security;
alter table public.comments enable row level security;

create policy "Entries are readable by everyone"
  on public.entries for select
  to public using (true);

create policy "Comments are readable by everyone"
  on public.comments for select
  to public using (true);

create policy "Anyone can insert entries"
  on public.entries for insert
  to public with check (true);

create policy "Anyone can insert comments"
  on public.comments for insert
  to public with check (true);
