# Supabase 연동 문제 해결 가이드

이 문서는 `realtime-guestbook` 프로젝트를 Supabase와 연동하면서 발생했던 주요 오류와 해결 과정을 기록합니다.

## 1. 환경 변수 설정 누락

### 증상

- 애플리케이션이 Supabase에 연결하지 못함.
- `supabase-client.ts`에서 URL 또는 Key 관련 오류 발생 가능성.

### 원인

Supabase 접속에 필요한 `NEXT_PUBLIC_SUPABASE_URL`와 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 환경 변수가 설정되지 않았습니다.

### 해결 방안

1.  프로젝트 최상위 경로에 `.env.local` 파일을 생성합니다.
2.  Supabase 프로젝트 대시보드의 **Project Settings > API** 메뉴로 이동합니다.
3.  `Project URL`과 `anon` `public` 키를 복사하여 아래와 같이 `.env.local` 파일에 추가합니다.

    ```bash
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

## 2. 스토리지 버킷 미생성

### 증상

- 파일 업로드 시 `{"statusCode":"404","error":"Bucket not found"}` 오류 발생.

### 원인

코드(`src/lib/upload.ts`)에서는 `entries`라는 이름의 스토리지 버킷을 사용하도록 되어 있으나, 해당 버킷이 Supabase 프로젝트에 생성되지 않았습니다.

### 해결 방안

1.  Supabase 대시보드의 **Storage** 메뉴로 이동합니다.
2.  **"Create a new bucket"**을 클릭합니다.
3.  버킷 이름으로 `entries`를 입력하고, **공개 버킷(Public bucket)**으로 설정하여 생성합니다.

---

## 부록: Supabase의 핵심 보안 기능, RLS (Row-Level Security)란?

이어지는 3번과 4번 문제의 직접적인 원인이었던 RLS에 대해 이해하는 것은 Supabase를 안전하게 사용하는 데 매우 중요합니다. RLS는 데이터베이스 테이블의 **각 행(row)마다** 접근 및 작업 권한을 세밀하게 제어하는 PostgreSQL의 강력한 보안 기능입니다.

-   **핵심 개념**: "누가(역할)", "어떤 데이터에(대상)", "무슨 작업을(액션)", "어떤 조건에서(규칙)" 할 수 있는지를 정의하는 규칙들의 집합입니다.
-   **비유**: 아파트의 각 세대(행)마다 다른 출입 카드(정책)가 있어야만 문을 열 수 있는 시스템과 같습니다. 아파트 건물(테이블)에 들어올 수 있더라도, 각 세대의 문을 열 권한이 없다면 들어갈 수 없습니다.
-   **기본 원칙 (Default Deny)**: RLS가 활성화된 테이블에 **어떠한 정책(Policy)도 설정되어 있지 않다면, 기본적으로 아무도 해당 테이블의 데이터를 읽고(SELECT), 쓰고(INSERT), 수정(UPDATE), 삭제(DELETE)할 수 없습니다.** 이것이 "기본적으로 안전하게(Secure by default)" 설계된 이유입니다.
-   **오류의 의미**: `...violates row-level security policy` 오류는 바로 이 RLS 정책을 위반했다는, 즉 "당신은 이 작업을 수행할 권한(정책)이 없습니다" 라는 명확한 신호입니다. 따라서 우리는 `supabase/schema.sql`에 정의된 것처럼 명시적으로 "모든 사용자가 글을 쓸 수 있다" (`INSERT`) 또는 "파일을 올릴 수 있다" 와 같은 정책을 직접 만들어 데이터베이스에 적용해야 합니다.

---

## 3. 데이터베이스 테이블 및 RLS 정책 미적용

### 증상

- 방명록 글 작성 시 `{"statusCode":"403","error":"Unauthorized","message":"new row violates row-level security policy"}` 오류 발생.

### 원인

`entries`, `comments` 테이블이 데이터베이스에 존재하지 않거나, 존재하더라도 데이터를 추가(INSERT)할 수 있는 RLS(Row-Level Security) 정책이 설정되지 않았습니다. 프로젝트 내 `supabase/schema.sql` 파일은 설계도일 뿐, 실제 데이터베이스에 적용되지 않은 상태였습니다.

### 해결 방안

1.  `supabase/schema.sql` 파일의 전체 내용을 복사합니다.
2.  Supabase 대시보드의 **SQL Editor**로 이동합니다.
3.  복사한 SQL 코드를 붙여넣고 **`RUN`** 버튼을 눌러 실행합니다.
4.  이 스크립트는 필요한 테이블 생성, RLS 활성화, 익명 사용자의 `SELECT` 및 `INSERT`를 허용하는 정책 생성을 모두 한 번에 처리합니다.

## 4. 스토리지 버킷 업로드 정책 누락

### 증상

- 파일 업로드(`src/lib/upload.ts`) 과정에서 `{"statusCode":"403","error":"Unauthorized","message":"new row violates row-level security policy"}` 오류 발생.
- **참고**: 3번과 동일한 오류 메시지이지만, 발생 지점이 다름.

### 원인

Supabase 스토리지에 파일을 업로드하는 것은 내부적으로 `storage.objects`라는 관리 테이블에 파일 메타데이터를 `INSERT`하는 동작입니다. 스토리지 버킷에 `INSERT`를 허용하는 정책이 없으면, 이 과정에서 데이터베이스 RLS 정책 위반 오류가 발생합니다.

### 해결 방안

1.  Supabase 대시보드의 **Storage** 메뉴로 이동합니다.
2.  `entries` 버킷 옆의 메뉴(...)를 클릭하여 **"Policies"**를 선택합니다.
3.  `INSERT` 작업을 위한 새 정책(New policy)을 생성합니다.
4.  **`anon`** 역할(role)에게 **`INSERT`** 작업을 허용(Allowed operations)하는 정책을 추가하고 저장합니다. (템플릿: "Give users access to all objects" 사용 후 `INSERT`만 선택)
