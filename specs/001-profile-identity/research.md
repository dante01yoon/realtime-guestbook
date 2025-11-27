# Research: Profile Identity

## Decisions
- Decision: Enforce global nickname uniqueness for authenticated users.
  - Rationale: Prevent impersonation/confusion in guestbook; keeps authorship clear.
  - Alternatives: Allow duplicates with disambiguators; soft-unique prompts.
- Decision: Store profile records in Supabase Postgres (`profiles` table) aligned with `auth.users`.
  - Rationale: Centralized identity for entries/comments and future features; consistent with memory-bank architecture.
  - Alternatives: Store nickname directly on entries/comments; less flexible for updates.
- Decision: Use Supabase Storage bucket for avatars (public-read; write limited to owner) with 5 MB cap and JPEG/PNG/WebP formats.
  - Rationale: Matches existing storage usage; predictable size/type constraints.
  - Alternatives: Inline data URLs or external CDNs.
- Decision: Render author identity for existing entries/comments by joining profile via user identifier (fallback to placeholder if missing).
  - Rationale: Avoid stale/mixed identities; keeps history readable without retro edits.
  - Alternatives: Snapshot nickname into entries/comments; risks divergence after profile edits.

## Open Items
- None; proceed to design.
