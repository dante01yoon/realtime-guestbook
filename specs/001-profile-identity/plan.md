# Implementation Plan: Profile Identity

**Branch**: `001-profile-identity` | **Date**: 2025-11-27 | **Spec**: specs/001-profile-identity/spec.md
**Input**: Feature specification from `/specs/001-profile-identity/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command (or manually if the command is
unavailable). Follow the constitution for gates and traceability expectations.

## Summary

Enable authenticated users to set/edit a unique nickname and profile image so entries/comments show
clear authorship. Use existing Next.js + Supabase stack; add/align profile data and image storage per
memory-bank guidance.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript, Next.js 14 (App Router)
**Primary Dependencies**: Supabase client/SSR, React Query, Zod, Tailwind, Sonner, Framer Motion
**Storage**: Supabase Postgres (profiles table, entries/comments linkage), Supabase Storage bucket
for avatars
**Testing**: Vitest + Testing Library (unit, integration, contract for Supabase/auth/realtime)
**Target Platform**: Web
**Project Type**: Single web app (app router)
**Performance Goals**: Profile fetch/render <150ms p95 after cache warm; avatar upload completes <5s
on 5 MB files
**Constraints**: Reuse existing Next.js + Supabase; align DB changes with memory-bank architecture
and implementation-plan docs
**Scale/Scope**: Community guestbook scale (hundreds-thousands of users; low write contention)
**API Approach**: Next.js API routes for profile CRUD (GET/PUT profile, DELETE avatar) backed by
Supabase auth/storage; client hooks call these routes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Memory-bank alignment: PASS — `AGENTS.md`, `memory-bank/architecture.md`, `memory-bank/implementation-plan.md`
  reviewed; will log deltas in `memory-bank/progress.md`.
- Traceability: PASS — Spec/plan paths documented here; tasks to link back when generated.
- Modularity: PASS — Supabase logic confined to `src/lib`/`src/hooks`; shared UI in
  `src/components/ui`; avoid duplication.
- Testing: PASS — Vitest coverage planned (unit + integration/contract for auth/Supabase/realtime);
  fail-first expectation noted.
- Experience consistency: PASS — Responsive, accessible states, and realtime identity consistency
  will be documented in tasks.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── app/...
├── components/
│   └── ui/
├── hooks/
└── lib/

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Single web app (Next.js app router); Supabase helpers in `src/lib`/`src/hooks`
and shared UI in `src/components/ui`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
