# Implementation Plan

1. **Project Bootstrap**
   - Next.js 15(App Router) + TypeScript + Tailwind 초기 세팅.
   - ESLint(`eslint-config-next`), Vitest 환경 구성.
   - 필수 패키지: `@supabase/supabase-js`, `@tanstack/react-query`, `zod`, `sonner`, `clsx` 등.

2. **Supabase Setup**
   - `supabase/schema.sql`에 테이블(`entries`, `comments`)과 RLS 정책 정의.
   - 스토리지 버킷 `entries` 생성, public read/insert 허용.
   - `lib/database.types.ts`로 타입 수동 정의(필요 시 `supabase gen types`로 갱신).

3. **Utility Layer**
   - `lib/supabase-client.ts`: 브라우저 클라이언트 + storage helper.
   - `lib/env.ts`: Zod 기반 환경 변수 검증.
   - `lib/utils.ts`: 포스트잇 색상/회전 로직.

4. **Hooks & Data Logic**
   - `useEntries`: 목록 조회 + 생성 뮤테이션 + realtime 구독.
   - `useEntry`: 단일 카드 조회.
   - `useComments` / `useAddComment`: 댓글 로드, 낙관적 추가.

5. **Components**
   - **DrawingCanvas**: 펜/지우개/초기화, PNG export.
   - **PostitCard**: 포스트잇 스타일 카드.
   - **Skeletons**: 갤러리/댓글 스켈레톤.
   - **Providers**: React Query + Toaster 래퍼.

6. **Pages / Routing**
   - `/`: 갤러리 목록 (실시간 반영).
   - `/create`: 업로드/드로잉 폼.
   - `/entry/[id]`: 카드 상세 + 댓글.

7. **Supabase Realtime Wiring**
   - Channels per table; filter comments by `entry_id`.
   - Manage subscription cleanup on unmount.
   - Provide connection status indicator if channel drops.

8. **UX Polish**
   - Loading skeletons, error toasts, focus traps on modals (if any).
   - Accessibility labels on buttons/tools, keyboard shortcuts for canvas tools.
   - Responsive layout + safe-area padding.

9. **Testing & QA**
   - Vitest 단위 테스트(`lib/utils`).
   - 추후 hooks/mock supabase 테스트 확장.

10. **Deployment Prep**
    - Environment variable documentation in README.
    - Optional: `supabase/config.toml`, GitHub Actions (lint/test).
