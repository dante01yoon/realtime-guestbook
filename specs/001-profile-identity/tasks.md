---

description: "Task list template for feature implementation"
---

# Tasks: Profile Identity

**Input**: Design documents from `/specs/001-profile-identity/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Automated tests are REQUIRED for any code change. Include Vitest coverage under `tests/`
with unit + integration/contract tasks (realtime/auth flows need integration). Documentation-only
changes may omit tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Verify env vars for Supabase clients are set (`.env.local` keys) and note values needed in README.
- [X] T002 Confirm storage bucket `avatars` exists or is created in Supabase dashboard; document policy plan in `memory-bank/progress.md`.

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T003 Create DB migration for `profiles` table with unique nickname and owner RLS (add file in `supabase/migrations/` per repo convention).
- [X] T004 Add fk columns `author_profile_id` to `entries` and `comments` (nullable, fk -> profiles.id) in same migration; backfill existing rows to null default.
- [X] T005 Update `supabase/schema.sql` (or generated types) to reflect profiles and new fks; regenerate Supabase types if applicable.
- [X] T006 Add storage policy for `avatars` bucket: public read, owner-only write/delete; 5 MB limit enforced in validation layer.

**Checkpoint**: Foundation ready - user story work can begin.

---

## Phase 3: User Story 1 - Set Identity (Priority: P1) 🎯 MVP

**Goal**: Authenticated user sets nickname (unique) and profile image to display identity.

**Independent Test**: User sets nickname + uploads valid image; entries/comments reflect identity after reload.

### Tests for User Story 1 (Required) ⚠️

- [X] T007 [P] [US1] Contract test for profile API (GET/PUT/DELETE avatar) in `tests/contract/profile-api.test.ts`.
- [X] T008 [P] [US1] Integration test for profile form flow in `tests/integration/profile-form.test.tsx`.
- [X] T009 [P] [US1] Unit test for profile validation (nickname rules, file constraints) in `tests/unit/profile-validation.test.ts`.

### Implementation for User Story 1

- [X] T010 [US1] Add profile validation schema (nickname, avatar file) in `src/lib/validation/profile.ts`.
- [X] T011 [US1] Implement Supabase profile helper (CRUD) in `src/lib/profiles.ts` using `supabase` client.
- [X] T012 [US1] Add profile hook `useProfile` (fetch/update/delete avatar) in `src/hooks/use-profile.ts`.
- [X] T013 [US1] Create profile settings page/form at `src/app/(main)/profile/page.tsx` using shared UI + Tailwind.
- [X] T014 [US1] Add avatar upload component with preview/validation in `src/components/ui/avatar-upload.tsx`.
- [X] T015 [US1] Wire profile API route handlers (if applicable) in `src/app/api/profile/route.ts` (GET/PUT) and `src/app/api/profile/avatar/route.ts` (DELETE) per contracts.
- [X] T016 [US1] Ensure nickname uniqueness errors surface in UI; add toast and inline error handling in `src/app/profile/page.tsx`.
- [X] T017 [US1] Document profile setup UX and storage requirements in `memory-bank/progress.md`.
- [X] T035 [US1] Update entry creation mutation to set `author_profile_id` for new entries in `src/hooks/use-entries.ts`; handle failures gracefully.
- [X] T036 [US1] Update comment creation mutation to set `author_profile_id` for new comments in `src/hooks/use-comments.ts`.
- [X] T037 [US1] Add integration test ensuring new entries/comments persist `author_profile_id` in `tests/integration/profile-fk.test.ts`.

**Checkpoint**: User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Edit or Remove Identity (Priority: P2)

**Goal**: User updates nickname/image or removes image with clear feedback.

**Independent Test**: User changes nickname and swaps/removes image; new identity persists and renders everywhere after reload.

### Tests for User Story 2 (Required) ⚠️

- [X] T018 [P] [US2] Integration test for nickname change + avatar swap/remove in `tests/integration/profile-edit.test.tsx`.

### Implementation for User Story 2

- [X] T019 [US2] Extend `useProfile` to handle avatar removal and nickname change flow in `src/hooks/use-profile.ts`.
- [X] T020 [US2] Update profile settings UI to support remove-avatar action and change nickname in `src/app/(main)/profile/page.tsx`.
- [X] T021 [US2] Add API support for avatar delete (`src/app/api/profile/avatar/route.ts`) and nickname change conflict handling.
- [X] T022 [US2] Update storage cleanup logic to delete replaced avatars in `src/lib/profiles.ts`.
- [X] T023 [US2] Add regression note for identity edit flows to `memory-bank/progress.md`.

**Checkpoint**: User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - View Identities in Guestbook (Priority: P3)

**Goal**: Guestbook viewers see nickname + avatar (or placeholder) on entries/comments consistently.

**Independent Test**: Gallery and comments render author identity consistently after refresh.

### Tests for User Story 3 (Required) ⚠️

- [X] T024 [P] [US3] Integration test for identity display on entries/comments in `tests/integration/identity-display.test.tsx`.

### Implementation for User Story 3

- [X] T025 [US3] Update entries fetch/subscription to include profile join in `src/hooks/use-entries.ts`.
- [X] T026 [US3] Update comments fetch/subscription to include profile join in `src/hooks/use-comments.ts`.
- [X] T027 [US3] Render nickname/avatar (placeholder on null) on gallery cards in `src/components/postit-card.tsx`.
- [X] T028 [US3] Render nickname/avatar on comments UI in `src/components/comment-thread.tsx` (or comment item component).
- [X] T029 [US3] Add loading/empty/error states for identity display (skeleton/placeholder) in relevant components.
- [X] T030 [US3] Verify realtime consistency for identity updates (refresh path) and log findings in `memory-bank/progress.md`.
- [X] T038 [US3] Add fallback handling for legacy entries/comments with null `author_profile_id` (placeholder render + safe joins) and cover with test in `tests/integration/identity-display.test.tsx`.

**Checkpoint**: All user stories should now be independently functional.

---

## Phase N: Polish & Cross-Cutting Concerns

- [X] T031 [P] Accessibility pass for profile form/avatar upload (labels, keyboard, ARIA) across `src/app/profile/page.tsx` and related components.
- [X] T032 [P] Performance review: ensure avatar fetch cached and images optimized; note in `memory-bank/progress.md`.
- [X] T033 [P] Update README with profile feature usage and env/storage notes in `README.md`.
- [X] T034 [P] Add final test run results and links to `tests/` artifacts in `memory-bank/progress.md`.
- [ ] T039 [P] Measure profile fetch render time (<150ms p95) and avatar upload (<5s for 5 MB) and record results in `memory-bank/progress.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies.
- Foundational (Phase 2): Depends on setup completion; blocks all user stories.
- User Stories (Phase 3+): Each depends on Foundational completion; US2 depends on US1; US3 depends on US1 for data shape (but can start after foundational once profile data available).
- Polish: Depends on all desired user stories completion.

### User Story Dependencies

- User Story 1 (P1): No story dependencies (after foundational).
- User Story 2 (P2): Depends on User Story 1 completion.
- User Story 3 (P3): Depends on User Story 1 data availability; display can proceed after profile data exists.

### Within Each User Story

- Tests written and FAIL before implementation (where applicable).
- Models/validation before services/hooks.
- Services/hooks before UI wiring.
- Core implementation before integration polish.

### Parallel Opportunities

- Foundation DB migration (T003-T006) sequential; documentation T002 in parallel with T003.
- Tests for each story (e.g., T007-T009) can run in parallel with UI if mocks are ready.
- US3 UI updates (T027-T029) can parallel hook adjustments (T025-T026) once data shape settled.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup + Foundational.
2. Deliver US1 (profile set) with tests (T007-T017).
3. Validate identity shows on entries/comments after reload.

### Incremental Delivery

1. US1 → deploy/demo identity creation.
2. US2 → enable edits/removal.
3. US3 → ensure gallery/comments display identities consistently.

### Parallel Team Strategy

- Dev A: Foundational migration + hooks (`src/lib`, `src/hooks`).
- Dev B: Profile UI + API routes (`src/app/profile`).
- Dev C: Identity display in gallery/comments (`src/components/postit-card.tsx`, `src/components/comment-thread.tsx`).
