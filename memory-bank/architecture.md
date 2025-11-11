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
- Storage bucket `entries` (public, configurable via `NEXT_PUBLIC_SUPABASE_BUCKET`) for 업로드된 PNG.
- RLS policies allow insert/read for anonymous users; optional per-IP throttling via Edge Function later.

## Application Layers
- **UI Layer**: Next.js App Router pages `/(app)/create`, `/gallery`, `/entry/[id]`. Shared layouts, metadata.
- **State/Data Layer**: React Query for caching + mutations; Zod schemas for form validation & Supabase type safety (`Database` types via `supabase gen types typescript`).
- **Realtime Layer**: Supabase Channels for `entries` + per-entry `comments` streaming; hooks encapsulate subscription lifecycle.

## Key Modules & Files
- `lib/supabase-client.ts`: typed Supabase browser client + storage bucket constant.
- `lib/env.ts`: Zod 기반 환경 변수 로더.
- `lib/utils.ts`: 해시/랜덤/회전 유틸 (포스트잇 스타일).
- `hooks/use-entries.ts`: 목록 패칭 + 생성 뮤테이션 + realtime 머지.
- `hooks/use-comments.ts`: 댓글 패칭/구독 + 낙관적 등록.
- `hooks/use-entry.ts`: 단일 카드 조회 쿼리.
- `components/drawing-canvas.tsx`: 커스텀 캔버스(펜/지우개/초기화, PNG export).
- `components/postit-card.tsx`: 갤러리 카드 프레젠테이션.
- `components/providers.tsx`: React Query + 토스트 프로바이더.
- `components/skeletons.tsx`: 로딩 스켈레톤 모음.
- `app/` 라우트: `/`(갤러리), `/create`, `/entry/[id]`.
- `supabase/schema.sql`: 테이블/RLS 정의.
- `tests/utils.test.ts`: 유틸 단위 테스트 (Vitest).

## Flows
1. **Card Creation**
   - User selects upload or draws canvas → `File | Blob` normalized to `File`.
   - `createEntryMutation` uploads to storage (tracked progress) → gets public URL → inserts row.
   - React Query invalidates `entries list`; realtime feed pushes to others immediately.
2. **Gallery Update**
   - `useEntries` subscribes to `entries` channel; merges incoming records while preserving desc sort.
   - 카드 컴포넌트는 Tailwind 전환 효과로 hover/focus 피드백만 제공.
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
- Vitest + jsdom 환경에서 유틸 단위 테스트 실행.
- 추후 확장을 위해 hooks 테스트/RTL 도입 가능.
- ESLint(`eslint-config-next`) 적용, Tailwind/TypeScript 기본 설정.

## Open Questions
- Auth: currently anonymous; consider OTP login for spam mitigation.
- Rate limiting for uploads? Potential use of Edge Functions.
