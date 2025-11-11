# 실시간 전자 방명록

Next.js 15 + TypeScript + TailwindCSS + Supabase(Storage/Realtime)로 구현한 실시간 전자 방명록 데모입니다.

## 주요 기능
- 업로드/드로잉으로 카드 생성 후 Supabase Storage + Database에 저장
- 실시간 포스트잇 갤러리 (랜덤 색/회전)
- 카드 상세 + 실시간 댓글 (낙관적 UI)

## 개발 환경
```bash
npm install
npm run dev
```

환경 변수는 `.env` 파일에 다음을 정의합니다:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_BUCKET=entries
```

## Supabase 스키마
`supabase/schema.sql` 참고. `entries` / `comments` 테이블과 공개 RLS 정책을 포함합니다.

## 테스트
```bash
npm test
```
Vitest를 사용해 `lib/utils` 유틸리티 테스트를 제공합니다.
