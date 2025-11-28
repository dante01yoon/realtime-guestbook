# 실시간 전자 방명록

Next.js + Supabase 기반으로 사진 업로드 혹은 드로잉으로 방명록 카드를 만들고 실시간 갤러리/댓글을 제공하는 앱입니다.

## 기술 스택
- Next.js 14 (App Router)
- TypeScript, TailwindCSS
- Supabase (Postgres, Storage, Realtime)
- TanStack Query, Zod, Sonner, Framer Motion
- Vitest + Testing Library

## 환경 변수
`.env.local` 파일에 다음 값을 설정하세요.

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_PUBLIC_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY" # 서버 전용, 절대 클라이언트에 노출 금지
```

## Supabase 준비
1. Supabase Dashboard → Authentication → Email Provider를 활성화하고 (필요 시) OAuth Provider를 추가합니다.
2. SQL Editor에서 `supabase/schema.sql` 내용을 실행해 `profiles`, `entries`, `comments` 테이블과 RLS 정책을 생성합니다. 아바타용 `avatars` 버킷 및 정책도 함께 적용됩니다.
3. Storage에 `guestbook` 버킷을 만들고 인증된 사용자만 업로드할 수 있도록 정책을 설정한 뒤(public read 권장) 클라이언트에서 해당 버킷을 사용합니다. 프로필 이미지는 `avatars` 버킷(public read, 소유자만 쓰기/삭제)에서 관리합니다.
4. 프로필 닉네임은 전역 고유(2-20자)이며 `author_profile_id`가 entries/comments에 저장됩니다. 스키마 적용 후 `supabase gen types typescript` 등을 통해 타입을 최신화하세요.

## 개발 스크립트
- `npm run dev` – 개발 서버
- `npm run lint` – ESLint
- `npm run build` – 프로덕션 빌드
- `npm run test` – Vitest 테스트
