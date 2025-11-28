# Data Model: Profile Identity

## Entities

### Profile
- `id`: uuid, pk
- `user_id`: uuid, unique, fk -> auth.users.id
- `nickname`: text, unique, 2-20 chars, trimmed; characters allowed: letters, numbers, space, period, underscore, hyphen
- `avatar_url`: text, nullable, points to storage object path
- `updated_at`: timestamptz, default now()
- Constraints:
  - unique(`nickname`)
  - check length/charset on `nickname`
  - RLS: owner-only read/write (user_id = auth.uid())

### Guestbook Entry (existing)
- References `author_profile_id` (fk -> profiles.id) for render, while preserving existing entry data.
- On render, join profile; fallback to placeholder if profile missing.

### Comment (existing)
- References `author_profile_id` (fk -> profiles.id) for render.
- On render, join profile; fallback to placeholder if profile missing.

## Relationships
- `profiles.user_id` 1:1 with auth.users
- `entries.author_profile_id` many:1 profiles
- `comments.author_profile_id` many:1 profiles

## Validation Rules
- Nickname: 2-20 chars, allowed charset above, globally unique.
- Avatar: JPEG/PNG/WebP only, max 5 MB.

## State / Lifecycle
- Create profile when user first sets identity.
- Update profile on nickname or avatar change.
- Delete avatar (set null) retains profile; placeholder rendered.
