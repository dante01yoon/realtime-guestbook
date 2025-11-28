# Quickstart: Profile Identity

1) Read `AGENTS.md` + `memory-bank` (architecture, implementation-plan) to align with Supabase setup.
2) Ensure env vars are set (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, service role for migrations if needed).
3) Apply DB changes: add `profiles` table (uuid pk, user_id unique fk to auth.users, nickname unique, avatar_url) and optional `author_profile_id` fks on entries/comments.
4) Configure storage bucket `avatars` (public read, owner write), 5 MB limit; allow JPEG/PNG/WebP.
5) Implement profile endpoints/hooks in `src/lib`/`src/hooks`; use shared UI components + Tailwind for forms/upload.
6) Run tests: `pnpm test` (unit + integration/contract for Supabase/auth/realtime paths); add coverage for nickname uniqueness and avatar upload validation.
7) Verify UX: set/edit/remove identity, ensure guestbook entries/comments render nickname + avatar (or placeholder) consistently after refresh.
