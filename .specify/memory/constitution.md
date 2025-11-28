<!--
Sync Impact Report
- Version change: N/A → 1.0.0
- Modified principles: placeholders → I. Memory Bank Reference First; II. Test Discipline (Vitest & Coverage); III. Code Quality & Modularity; IV. Experience Consistency; V. Delivery Traceability
- Added sections: Project-Specific Constraints; Development Workflow & Quality Gates
- Removed sections: None
- Templates requiring updates: .specify/templates/plan-template.md ✅; .specify/templates/tasks-template.md ✅; .specify/templates/spec-template.md ✅
- Follow-up TODOs: None
-->

# Realtime Guestbook Constitution

## Core Principles

### I. Memory Bank Reference First
Every work cycle starts by reading `AGENTS.md` and the relevant `memory-bank` docs (architecture,
plans, progress). Plans/specs/tasks must cite existing decisions, and new learnings or deviations
are recorded back in `memory-bank/progress.md` the same day.

### II. Test Discipline (Vitest & Coverage)
All code changes require automated tests in `tests/` using Vitest (Testing Library for UI). Write
or update tests before/with implementation so they fail first. Regressions add reproducing tests.
Supabase/realtime paths need contract or integration coverage to prove data sync and RLS-critical
flows. PRs without passing tests are blocked.

### III. Code Quality & Modularity
Keep TypeScript type-safe, lint/format clean. Supabase interactions live in `src/lib` or
`src/hooks`; UI uses shared components in `src/components/ui` and Tailwind utility-first styling.
Prefer small, composable functions with minimal duplication; side effects are isolated and tested.

### IV. Experience Consistency
Deliver consistent UX across devices: responsive layouts, accessible labels/ARIA, predictable
loading/empty/error states, and real-time UI that matches persisted state (optimistic updates
resolved). Animations and feedback mirror existing patterns; no ad-hoc styling outside Tailwind +
shared components without documented rationale.

### V. Delivery Traceability
Every change is anchored to a spec/plan/tasks derived from the templates. Each phase records
decisions, risks, and test evidence. Releases document user-facing impact and any data migrations.
If traceability gaps appear, work pauses until artifacts are updated.

## Project-Specific Constraints

- Tech stack: Next.js 14 (App Router), TypeScript, TailwindCSS, Supabase (Postgres/Storage/Realtime),
  TanStack Query, Zod, Sonner, Framer Motion, Vitest + Testing Library.
- UI: Tailwind utility-first with shared components in `src/components/ui`; new primitives are added
  there before reuse.
- Data access: Supabase logic belongs in `src/lib` or `src/hooks`; components consume typed helpers
  instead of inlining queries.
- Testing: Tests live in `tests/`; integration/contract coverage required for Supabase/realtime and
  auth-sensitive flows; unit tests cover pure logic.
- Documentation sync: Memory-bank documents stay current with any architectural or workflow change.

## Development Workflow & Quality Gates

1. Align: Read `AGENTS.md` and relevant `memory-bank` docs before planning; note deltas to capture.
2. Specify: Create/update spec and plan from templates; populate Constitution Check with pass/fail
   status for each principle and gate.
3. Build: Implement with modular structure (`src/lib`/`src/hooks` for Supabase, shared UI components,
   Tailwind utilities). Keep changes traceable to plan/tasks.
4. Test: Add fail-first Vitest coverage in `tests/`; include integration tests for realtime/data
   integrity and accessibility checks for UI states.
5. Review: PRs must cite spec/plan/tasks links, show test results, and confirm constitution
   compliance (principles I-V).
6. Release: Update memory-bank progress/notes and any user-facing docs for behavior or UX changes.

## Governance

- Precedence: This constitution guides all delivery; conflicting practices are superseded.
- Amendments: Proposed via PR referencing impacts, updated gates in templates, and migration/testing
  plans. Consensus or maintainer approval required before merging.
- Versioning: Semantic versioning for governance—MAJOR for breaking principle changes/removals,
  MINOR for new/expanded principles or sections, PATCH for clarifications. Update
  `Last Amended` when changes land.
- Compliance Reviews: Every spec/plan/tasks file includes a Constitution Check; reviewers block
  merges lacking test evidence or traceability. Quarterly check ensures templates and memory-bank
  stay aligned.

**Version**: 1.0.0 | **Ratified**: 2025-11-27 | **Last Amended**: 2025-11-27
