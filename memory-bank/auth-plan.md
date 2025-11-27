# Auth & Authorization Implementation Plan

## Objectives
- Supabase 인증(Email/Password + 소셜 확장 가능)을 프로젝트에 통합한다.
- 모든 데이터 조작에 사용자 ID를 연결하고, RLS로 `나만 내 카드/댓글을 관리`할 수 있도록 보호한다.
- ch13.md 시나리오처럼 "이름 충돌" 문제를 제거하고 안전한 프로필 관리 플로우를 갖춘다.

## Application Tasks
1. **Supabase Auth 초기화**
   - Dashboard → Authentication → Email Provider 활성화, 필요 시 OAuth Provider도 ON.
   - `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 관리형 비밀 업데이트.

2. **세션 관리 & Provider**
   - `app/providers.tsx` 혹은 layout에서 `SessionContextProvider` 구성 (`@supabase/auth-helpers-nextjs` or custom), React Query와 공유.
   - `useSession`/`useUser` 훅 래핑.

3. **UI 플로우**
   - `/login` + `/signup` 페이지(폼 유효성 검증, 오류 토스트, 리디렉션).
   - 헤더에 현재 사용자 정보/로그아웃 버튼.

4. **Entry 작성 제한**
   - `useEntries` mutation payload에 `userId` 포함 (세션에서 가져오기) → Supabase insert 시 `user_id` 자동 세팅.
   - 익명 모드가 필요하면 별도 `display_name` 필드 노출하지만 내부적으로 auth UID만 사용.

5. **Comment 작성 제한**
   - `useEntryComments` mutation에서 동일하게 `user_id` 전달.
   - Detail 페이지에 "로그인 필요" 가드/CTA 추가.

6. **Profiles 관리**
   - `profiles` 테이블 CRUD 훅 + 기본 설정 페이지 추가 (닉네임/아바타 등).
   - 프로필이 없을 경우 회원가입 직후 `/api/profiles` route(서비스 롤 키 사용)에서 기본 row 생성해 RLS 제약을 우회한다.

7. **UX & Error Handling**
   - Auth form loading state, password reset flow (Supabase Magic link).
   - Unauthorized 응답 시 라우트 보호 (middleware or server component guard).

## Supabase Migration Plan
1. **새 테이블/필드 추가**
   - `profiles` 테이블 생성:
     ```sql
     create table public.profiles (
       id uuid primary key references auth.users(id) on delete cascade,
       display_name text not null,
       avatar_url text,
       created_at timestamptz default timezone('utc', now())
     );
     alter table public.profiles enable row level security;
     ```

   - `entries` 테이블에 `user_id uuid references auth.users(id)` 컬럼 추가, NOT NULL + 인덱스.
   - `comments` 테이블에 `user_id uuid references auth.users(id)` 컬럼 추가, NOT NULL + 인덱스.

2. **데이터 백필(필요 시)**
   - 기존 데이터가 있다면 service key로 임시 사용자 생성 or 관리자 UID에 매핑.
   - `update entries set user_id = '<fallback-user-uuid>' where user_id is null;` 등 실행 후 NOT NULL 제약 추가.

3. **RLS 정책 재정의**
   - `entries`:
     - SELECT: `true` (공개 보기 허용) 또는 `auth.role() = 'authenticated'`로 제한.
     - INSERT: `auth.role() = 'authenticated'`.
     - UPDATE/DELETE: `auth.uid() = user_id`.
   - `comments`:
     - SELECT: 필요 시 전체 공개.
     - INSERT: `auth.uid() = user_id`.
     - UPDATE/DELETE: `auth.uid() = user_id`.
   - `profiles`: SELECT 제한 여부 결정 (공개 프로필이면 `true`, 비공개면 해당 사용자만).

4. **Storage 정책**
   - `guestbook` 버킷에 RLS equivalent(정책) 추가 → `auth.uid()`와 경로(prefix user id) 연결하거나 Edge Function으로 서명 URL 발급.
   - 최소한 업로드는 인증 사용자만 허용.

5. **Supabase Config & Types**
   - `supabase gen types typescript --project-id ... > src/types/supabase.ts` 재생성하여 새 컬럼 반영.
   - `.env`에 서비스 키 보관 (서버 액션/route handler에서만 사용).

6. **한 번에 적용하기 위한 Migration 순서**
   1. 새 컬럼/테이블 추가 (NULL 허용)
   2. 백필 및 기본 프로필 생성
   3. NOT NULL + 인덱스 + FK 제약 적용
   4. RLS 활성화 및 정책 적용
   5. Storage 정책 업데이트
   6. 타입 재생성 및 앱 코드 배포

## Validation Checklist
- [ ] 로그인하지 않은 사용자는 글 작성 버튼 클릭 시 로그인 페이지로 이동.
- [ ] 로그인 후 작성한 카드/댓글은 `user_id`가 채워지고 다른 유저는 수정/삭제 불가.
- [ ] 실시간 기능은 기존과 동일하게 동작하며, 새 필드 포함 payload를 처리.
- [ ] 프로필 닉네임이 카드에 노출되어 이름 충돌 방지.
- [ ] 로그아웃 시 캐시/세션 초기화.
