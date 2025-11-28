# Progress Log

| Date | Update | Next Steps |
| --- | --- | --- |
| 2025-11-27 | 프로필 실시간/표시 검증 완료: `author_profile_id` 전파, 표시용 fallback, API/훅/페이지 테스트 통과 (`pnpm test --run`). 아바타 버킷 정책 추가. README 갱신. | 성능 계측(T039) 남음; 나머지 폴리시/문서 완료. |
| 2025-11-27 | env 확인(.env.local에 Supabase URL/키 존재 확인), avatars 버킷 정책 적용, 갤러리/엔트리 이미지 lazy-loading 추가. `pnpm test --run` 21 tests pass. | T039 성능 계측 수치 기록 필요. |
| 2025-11-27 | 프로필 닉네임/아바타 기능 구현: 고유 닉네임 + `author_profile_id` 연동, 프로필 페이지/훅/밸리데이션, API(GET/PUT/DELETE), 타입/조회/표시 로직 교체. 기본 테스트 추가. | US2/US3 통합 테스트(T007, T008, T018, T024, T037, T038) 작성, 스토리지 정책/문서 점검, 성능 계측(T039) 및 README 업데이트(T033). |
| 2025-11-15 | `profiles` 테이블 RLS(`auth.uid() = id`) 때문에 신규 row insert 실패 → 세션 UID 기반 insert 또는 service role 정책 필요. | 회원가입 후 프로필 자동 생성 trigger/edge function 추가, service role용 정책 정의. |
| 2025-11-15 | Supabase MCP로 인증/인가 대비 DB 상태 점검: `profiles` 테이블과 `user_id` 컬럼/정책 미구현 확인. | 프로필 테이블 생성, entries/comments `user_id` 추가 및 RLS/정책 재구축, Supabase 타입 재생성. |
| 2025-11-12 | 초기 설계 문서(architecture, implementation plan) 작성. 프로젝트 운영 규칙을 `AGENTS.md`에 정의. | 구현 계획을 세부 태스크로 쪼개고 Next.js 프로젝트 부트스트랩. |
| 2025-11-12 | Supabase 인증/인가 구조, `profiles` 테이블, 로그인/회원가입 페이지, RLS 적용, 카드/댓글 훅 및 UI 업데이트. | Storage 정책 강화 및 테스트 자동화, 프로필 편집 UI 추가. |
| 2025-11-13 | Next.js + Tailwind 프로젝트 구조 수동 구성, Supabase 연동 훅/컴포넌트/페이지 구현, Vitest 단위 테스트 추가. | 환경 변수 세팅 후 실제 Supabase 프로젝트 연결 및 UI 폴리싱. |
