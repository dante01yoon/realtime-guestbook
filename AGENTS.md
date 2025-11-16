# AGENTS
- 항상 이 문서를 조회하고 최신 상태로 유지한다.
- 모든 작업 사이클마다 이 문서를 확인하고 필요한 내용을 추가/수정한다.
- memory-bank 폴더의 설계/계획/진행 문서와 동기화해 일관성을 유지한다.
- 최신 작업 히스토리를 간단히 기록해 협업 힌트를 남긴다. (예: 2025-11-12 인증/인가 구현 계획 작성)
- Supabase 테이블/설정 현황을 확인하거나 변경할 때는 supabase MCP(or CLI)을 사용해 일관성을 유지한다.

## 최근 작업
- 2025-11-15: Supabase MCP 재점검 결과, `public.profiles` 테이블/`user_id` FK 컬럼이 아직 없고 `public.guestbook` RLS 비활성화 상태이므로 schema.sql과 실제 DB 동기화 필요.
- 2025-11-15: Supabase MCP로 인증/인가 대비 DB 상태 점검(Profiles/user_id 컬럼 및 RLS 재정비 필요).
- 2025-11-15: `profiles` 테이블 RLS(`auth.uid() = id`)로 인해 신규 행 삽입 실패 → 세션 UID와 동일한 PK 사용 또는 service role 정책/trigger 필요.
- 2025-11-12: Supabase 인증/인가 적용, 로그인·회원가입 페이지 및 프로필 기반 카드/댓글 작성 흐름 구현.
- 2025-11-16: Supabase MCP 재점검 결과 — `public.guestbook` 여전히 RLS 꺼짐, `entries/comments` 테이블에 legacy `author` 컬럼/익명 정책 존재, `user_id` 컬럼 nullable, `profiles`는 `id/display_name/avatar_url/created_at` 4컬럼뿐이라 schema.sql과 실제 DB 간 차이 정리 필요.
- 2025-11-16: 코드 42501(`profiles` insert) 재현 → 이메일 확인이 필요한 환경에서는 signUp 직후 세션이 없어 RLS 위반 발생, server-side service role/trigger로 프로필 생성 필요.
- 2025-11-16: `public.guestbook` 테이블 제거 시도했으나 Supabase 인스턴스가 read-only 모드라 migration 적용 불가 → 운영자가 쓰기 권한 열어주면 `DROP TABLE public.guestbook CASCADE` 수행 예정.
- 2025-11-16: 회원가입 후 프로필 생성을 `/api/profiles` route(서비스 롤 키 사용)로 위임, 클라이언트에서는 해당 API 호출로 RLS 우회 삽입 처리.
- 2025-11-16: ch13.md에 "왜 가입 직후 RLS 우회를 해야 하는지" 섹션 추가, 서비스 롤/트리거 대안 정리.
- 프런트엔드 코드 작성 시 Tailwind 유틸리티 우선, 공통 UI 컴포넌트(`src/components/ui`) 재사용을 우선한다.
- Supabase 관련 로직은 `src/lib` 및 `src/hooks` 하위에 모듈화한다.
- 테스트는 `tests/` 디렉터리에 배치하고 Vitest를 사용한다.
