# Architecture Overview

## Product Summary
실시간 전자 방명록 웹앱. 업로드/드로잉으로 만든 카드들을 갤러리로 보여주고 개별 카드에서 실시간 댓글을 남긴다. Next.js 15(App Router) + TypeScript + TailwindCSS + Supabase(Schema/Storage/Realtime).

## Core Domains
1. **Creation (Page 1)**: 이미지 업로드 또는 캔버스 드로잉 → PNG 생성 → Storage 업로드 → `entries` 레코드 작성.
2. **Gallery (Page 2)**: `entries` 구독 + Masonry/Tile UI. 포스트잇 느낌을 위해 색상 팔레트 + 랜덤 회전.
3. **Detail + Comments (Page 3)**: 카드 이미지, 메타 정보, `comments` 실시간 스레드, 낙관적 업데이트.

## Data Model (Supabase)
- `entries`: `id (uuid, pk)`, `created_at (timestamp, default now)`, `author (text)`, `message (text)`, `image_url (text, storage public path)`.
- `comments`: `id (uuid, pk)`, `entry_id (uuid, fk -> entries.id)`, `author (text)`, `body (text)`, `created_at (timestamp)`.
- Storage bucket `guestbook` (public) for uploaded/drawn PNGs.
- RLS policies allow insert/read for anonymous users; optional per-IP throttling via Edge Function later.

## Application Layers
- **UI Layer**: Next.js App Router pages `/(app)/create`, `/gallery`, `/entry/[id]`. Shared layouts, metadata.
- **State/Data Layer**: React Query for caching + mutations; Zod schemas for form validation & Supabase type safety (`Database` types via `supabase gen types typescript`).
- **Realtime Layer**: Supabase Channels for `entries` + per-entry `comments` streaming; hooks encapsulate subscription lifecycle.

## Key Modules & Files
- `lib/supabase-client.ts`: browser/server safe client factory; reads env (NEXT_PUBLIC_SUPABASE_URL/KEY).
- `lib/zod-schemas.ts`: `EntryPayload`, `CommentPayload`, `DrawingStroke` definitions.
- `hooks/use-entries.ts`: list, create, subscribe. returns `entries`, `createEntry`, `uploadProgress`.
- `hooks/use-comments.ts`: `useEntryComments(entryId)` with realtime + optimistic mutation helpers.
- `components/canvas-board.tsx`: fabric.js or custom canvas with pen/eraser/clear; exports PNG blob.
- `components/image-upload.tsx`: drag-n-drop + preview + progress bar.
- `components/postit-card.tsx`: card presentation w/ rotation + color logic + skeleton state.
- `components/comment-thread.tsx`: list, composer, optimistic row; handles focus management.
- `components/toast-provider.tsx`: wraps Radix/sonner for errors.
- `tests/**`: vitest/react-testing-library for hooks + util.

## Flows
1. **Card Creation**
   - User selects upload or draws canvas → `File | Blob` normalized to `File`.
   - `createEntryMutation` uploads to storage (tracked progress) → gets public URL → inserts row.
   - React Query invalidates `entries list`; realtime feed pushes to others immediately.
2. **Gallery Update**
   - `useEntries` subscribes to `entries` channel; merges incoming records while preserving sort (desc by `created_at`).
   - UI animates card entrance (Framer Motion) to highlight new entry.
3. **Comments**
   - `useEntryComments(entryId)` fetches base data, sets channel filter for `entry_id`.
   - Composer validates w/ Zod, uses optimistic add; rollback on failure w/ toast.

## UI/UX Guidelines
- Tailwind design tokens for post-it palette + drop shadows.
- Layouts responsive (1col mobile → Masonry grid desktop). Use CSS Grid w/ auto-fit.
- Canvas accessible: keyboard toggle between draw/erase, announce actions.
- Loading states: skeleton cards for gallery, shimmer placeholders for comments.
- Error handling: toast & inline message; file upload failure regresses progress bar.

## Testing & Tooling
- Add unit tests for hooks (mock Supabase client) + zod schemas.
- Cypress component tests for canvas + gallery interactions (future).
- Linting via `eslint-config-next`, formatting via `prettier`.

## Open Questions
- Auth: currently anonymous; consider OTP login for spam mitigation.
- Rate limiting for uploads? Potential use of Edge Functions.
