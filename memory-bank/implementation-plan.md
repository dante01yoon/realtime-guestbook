# Implementation Plan

1. **Project Bootstrap**
   - Create Next.js 15 (app router) project with TypeScript & Tailwind.
   - Configure ESLint/Prettier, Husky (optional), testing stack (Vitest + RTL).
   - Install deps: `@supabase/supabase-js`, `@supabase/ssr`, `react-query`, `zod`, `zustand` (optional), `sonner`, `framer-motion`, canvas helper (e.g., `perfect-freehand` or custom).

2. **Supabase Setup**
   - Define tables `entries`, `comments`, enable realtime on both.
   - Create storage bucket `guestbook`, public read + insert policy.
   - Generate types via `supabase gen types typescript --project-id ...` → `types/supabase.ts`.

3. **Utility Layer**
   - `lib/supabase-client.ts`: browser/server clients, channel helpers.
   - `lib/zod-schemas.ts`: entry/comment payloads, file constraints (size, type).
   - `lib/colors.ts` for post-it palette + rotation seeds.

4. **Hooks & Data Logic**
   - `useEntries` hook: fetch list (`rpc` or `select`), create mutation (upload + insert), realtime subscription merge.
   - `useCanvas` hook/service: manage drawing state, stroke serialization, export PNG blob.
   - `useEntryComments(entryId)` hook: load comments, subscribe to realtime, provide `addComment` with optimistic updates.

5. **Components**
   - **CanvasBoard**: pen/eraser/clear, undo stack, exports blob.
   - **ImageUpload**: dropzone, preview, progress indicator.
   - **EntryForm**: combines canvas/upload result + text fields + submit; uses `useEntries` create mutation.
   - **PostItBoard**: Masonry Grid + `PostItCard` child.
   - **EntryDetail**: hero image, metadata.
   - **CommentThread** + **CommentComposer**.
   - Shared UI: `Button`, `Input`, `Skeleton`, `ToastProvider`.

6. **Pages / Routing**
   - `/create`: EntryForm + canvas/upload components.
   - `/gallery`: PostItBoard, suspense + skeleton, realtime badge.
   - `/entry/[id]`: detail view + CommentThread.
   - Default redirect `/` → `/gallery`.

7. **Supabase Realtime Wiring**
   - Channels per table; filter comments by `entry_id`.
   - Manage subscription cleanup on unmount.
   - Provide connection status indicator if channel drops.

8. **UX Polish**
   - Loading skeletons, error toasts, focus traps on modals (if any).
   - Accessibility labels on buttons/tools, keyboard shortcuts for canvas tools.
   - Responsive layout + safe-area padding.

9. **Testing & QA**
   - Unit tests: zod validators, `useEntries`, `useEntryComments` (mock supabase).
   - Integration snapshot for PostItBoard (React Testing Library).
   - Manual RT test: add entry/comment, ensure other tab updates.

10. **Deployment Prep**
    - Environment variable documentation in README.
    - Optional: `supabase/config.toml`, GitHub Actions (lint/test).
