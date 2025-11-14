[나] : Supabase 프로젝트를 시작하려면 데이터베이스 테이블부터 만들어야 할 것 같은데, 어떻게 하는 게 가장 좋은 방법인가요?
[단테] : 맞아요. 테이블을 만드는 것과 동시에 보안 규칙을 설정하는 것이 중요해요. Supabase에서는 `SQL Editor`를 사용해 테이블 구조와 Row-Level Security(RLS) 정책을 한 번에 적용하는 것이 가장 확실하고 좋은 방법입니다. 이 과정을 함께 알아보시죠.

# Supabase 데이터베이스 테이블 생성 및 RLS 정책 적용하기

Supabase는 PostgreSQL 데이터베이스를 기반으로 하므로, 모든 데이터 구조는 테이블(Table)로 정의됩니다. 하지만 단순히 테이블을 만드는 것에서 그치지 않고, 누가 그 데이터에 접근하고 조작할 수 있는지를 제어하는 보안 규칙을 설정하는 것이 매우 중요합니다.

이 가이드에서는 방명록 애플리케이션에 필요한 `entries`와 `comments` 테이블을 만들고, Supabase의 핵심 보안 기능인 RLS(Row-Level Security) 정책을 적용하는 방법을 단계별로 알아봅니다.

## 전체 SQL 스크립트 (`supabase/schema.sql`)

우선, 우리 프로젝트의 `supabase/schema.sql` 파일에 담긴 전체 코드는 다음과 같습니다. 이 하나의 파일로 테이블 생성부터 정책 적용까지 모든 것을 처리할 수 있습니다. 각 부분은 아래에서 자세히 설명합니다.

```sql
-- 1. `entries` 테이블 생성 (방명록 글)
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(), -- 각 행을 식별하는 고유 ID
  created_at timestamptz not null default timezone('utc', now()), -- 생성 시각
  author text not null, -- 작성자 이름
  message text not null, -- 방명록 메시지
  image_url text not null -- 업로드된 이미지 주소
);

-- 2. `comments` 테이블 생성 (댓글)
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(), -- 댓글의 고유 ID
  entry_id uuid not null references public.entries(id) on delete cascade, -- 어떤 방명록 글에 달린 댓글인지 참조 (원본 글 삭제 시 함께 삭제됨)
  author text not null, -- 댓글 작성자 이름
  body text not null, -- 댓글 내용
  created_at timestamptz not null default timezone('utc', now()) -- 댓글 생성 시각
);

-- 3. 테이블에 RLS(Row-Level Security) 활성화
alter table public.entries enable row level security;
alter table public.comments enable row level security;

-- 4. `entries` 테이블에 대한 정책(Policy) 설정
create policy "Allow anonymous insert entries"
  on public.entries
  for insert -- '쓰기(INSERT)' 작업에 대하여
  to anon -- '익명(anon)' 역할을 가진 사용자에게
  with check (true); -- 별도 조건 없이 항상 허용함

create policy "Allow anonymous select entries"
  on public.entries
  for select -- '읽기(SELECT)' 작업에 대하여
  to anon -- '익명(anon)' 역할을 가진 사용자에게
  using (true); -- 별도 조건 없이 항상 허용함

-- 5. `comments` 테이블에 대한 정책(Policy) 설정
create policy "Allow anonymous insert comments"
  on public.comments
  for insert
  to anon
  with check (true);

create policy "Allow anonymous select comments"
  on public.comments
  for select
  to anon
  using (true);
```

---

## 단계별 상세 설명

### 1단계: 테이블 구조 정의 (`CREATE TABLE`)

-   **`entries`**: 사용자가 작성한 방명록 글을 저장하는 테이블입니다. 작성자, 메시지, 이미지 주소 등의 정보를 가집니다.
-   **`comments`**: 각 방명록 글에 달린 댓글을 저장하는 테이블입니다. `entry_id`를 통해 어떤 `entries` 글에 속한 댓글인지 관계를 맺습니다.
-   **주요 컬럼**:
    -   `id uuid primary key`: 각 행(row)을 식별하는 고유한 기본 키입니다. `gen_random_uuid()` 함수로 자동 생성됩니다.
    -   `created_at timestamptz`: 데이터가 생성된 시간을 자동으로 기록합니다.
    -   `references public.entries(id)`: `comments` 테이블의 `entry_id`가 `entries` 테이블 `id`를 참조하는 외래 키(Foreign Key) 관계를 설정하여 데이터 무결성을 보장합니다.

### 2단계: RLS 활성화 (`ENABLE ROW LEVEL SECURITY`)

이 명령은 해당 테이블에 RLS 보안 시스템을 "켜는" 스위치와 같습니다.

```sql
alter table public.entries enable row level security;
alter table public.comments enable row level security;
```

**매우 중요한 점**: RLS가 활성화되면, **기본적으로 아무도 해당 테이블에 접근할 수 없습니다.** (Default Deny 원칙). 따라서, 접근을 허용하려면 반드시 다음 3단계에서 설명하는 '정책(Policy)'을 만들어야만 합니다.

### 3단계: 접근 규칙 만들기 (`CREATE POLICY`)

정책은 RLS 시스템의 핵심 규칙입니다. "누가, 무엇을, 어떻게 할 수 있는지"를 명시적으로 정의합니다.

-   `create policy "정책이름"`: 정책을 생성합니다.
-   `on public.테이블이름`: 어떤 테이블에 적용할지 지정합니다.
-   `for 작업종류`: `SELECT`(읽기), `INSERT`(쓰기), `UPDATE`(수정), `DELETE`(삭제) 중 어떤 작업에 대한 규칙인지 지정합니다.
-   `to 역할`: 어떤 사용자 역할에게 적용할지 지정합니다. Supabase에서는 기본적으로 로그인하지 않은 사용자를 `anon`(익명) 역할로 간주합니다.
-   `with check (true)` / `using (true)`: `true`는 '별도의 조건 없이 항상 허용한다'는 의미입니다. 이 부분을 `auth.uid() = user_id` 와 같이 바꾸면 "로그인한 사용자는 자기 자신의 데이터만 수정할 수 있다"와 같은 복잡한 규칙도 만들 수 있습니다.

우리 프로젝트에서는 익명의 모든 사용자가 글을 읽고 쓸 수 있어야 하므로, `anon` 역할에 `SELECT`와 `INSERT`를 `true` 조건으로 허용하는 정책을 만들었습니다.

### 4단계: Supabase에 스크립트 적용하기

이제 완성된 `supabase/schema.sql` 스크립트를 실제 Supabase 프로젝트 데이터베이스에 적용할 차례입니다.

1.  프로젝트의 `supabase/schema.sql` 파일에 있는 전체 SQL 코드를 복사합니다.
2.  Supabase 프로젝트 대시보드로 이동하여 왼쪽 메뉴의 **SQL Editor**를 선택합니다.
3.  새 쿼리 창에 복사한 코드를 모두 붙여넣습니다.
4.  오른쪽 하단의 **`RUN`** 버튼을 클릭하여 스크립트를 실행합니다.

성공적으로 실행되면, 데이터베이스에 `entries`, `comments` 테이블이 생성되고 필요한 RLS 정책까지 모두 적용되어 애플리케이션이 정상적으로 데이터를 읽고 쓸 준비가 완료됩니다.
