# AGENTS
- 항상 이 문서를 조회하고 최신 상태로 유지한다.
- 모든 작업 사이클마다 이 문서를 확인하고 필요한 내용을 추가/수정한다.
- memory-bank 폴더의 설계/계획/진행 문서와 동기화해 일관성을 유지한다.
- 최신 작업 히스토리를 memory-bank에 간단히 기록해 협업 힌트를 남긴다. (예: 2025-11-12 인증/인가 구현 계획 작성)

- 프런트엔드 코드 작성 시 Tailwind 유틸리티 우선, 공통 UI 컴포넌트(`src/components/ui`) 재사용을 우선한다.
- Supabase 관련 로직은 `src/lib` 및 `src/hooks` 하위에 모듈화한다.
- 테스트는 `tests/` 디렉터리에 배치하고 Vitest를 사용한다.

## Recent Changes
- 001-profile-identity: Planning started; global nickname uniqueness, profile storage in Supabase
  (Postgres + avatars bucket) to show authorship in guestbook.
