# Phase 1 — OneNote 3.0 Implementation Progress

> Tracker for the OneApp 3 Phase 1 upgrade described in
> [`ONEAPP_3_PRD.md`](./ONEAPP_3_PRD.md) §3 and
> [`PHASE_1_IMPLEMENTATION_PLAN.md`](./PHASE_1_IMPLEMENTATION_PLAN.md).
> Updated as each milestone lands.

**Last updated:** 2026-06-11

## Status legend

- ✅ shipped
- 🟡 in progress
- ⬜ not started

## Milestones

| #   | Milestone                                                          | Status | Notes                                                                                                                                                 |
| --- | ------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| M0  | Schema + feature flags scaffold                                    | ✅     | Migration `20260430200000_*.sql`, `src/lib/feature-flags.ts`, locale keys, this tracker.                                                              |
| M1  | Founder-mode block types (Idea, Decision Log, Mood/Energy, Sprint) | ✅     | New block kinds wired through slash menu, renderer, zod schemas.                                                                                      |
| M2  | Bi-directional note linking (`[[…]]`) + backlinks panel            | ✅     | `useNoteLinks`, `NoteLinkAutocomplete`, `BacklinksPanel`, `sync_note_links` RPC.                                                                      |
| M3  | Personal Templates engine + `/apps/onenote/templates`              | ✅     | Templates page with CRUD + token-substituted apply flow.                                                                                              |
| M4  | Inline AI co-writer (Cmd+J)                                        | ✅     | `inline-ai` Edge Function, `useInlineAI`, `InlineAIPanel`.                                                                                            |
| M5  | Daily Briefing note + dashboard widget                             | ✅     | `daily-briefing` Edge Function, `useDailyBriefing`, `DailyBriefingWidget`.                                                                            |
| M6  | Smart note aging                                                   | ✅     | "Revisit?" badge derived from `updated_at`; `last_opened_at` clears it.                                                                               |
| M7  | Mood-to-task routing                                               | ✅     | `note_tags.metadata.energy_level`, surfaced via `TodoWidget`.                                                                                         |
| M8  | Hardening, tests, docs                                             | ✅     | Vitest covers blocks + linking + templates + feature flags; Phase 1 flags rolled out (prod default ON). Device/Lighthouse items deferred (manual/CI). |

## Schema changes shipped (Phase 1)

| Object                                                        | Change                                   | Migration          |
| ------------------------------------------------------------- | ---------------------------------------- | ------------------ |
| `note_links`                                                  | New table + RLS + indexes                | `20260430200000_*` |
| `notes.is_bookmarked`                                         | New column (boolean default false)       | `20260430200000_*` |
| `notes.note_date`                                             | New column (date)                        | `20260430200000_*` |
| `notes.last_opened_at`                                        | New column (timestamptz)                 | `20260430200000_*` |
| `notes (user_id, note_date) WHERE note_type='daily_briefing'` | Unique partial index                     | `20260430200000_*` |
| `notes (user_id) WHERE is_bookmarked`                         | Partial index                            | `20260430200000_*` |
| `note_tags.metadata`                                          | New jsonb column for `energy_level` etc. | `20260430200000_*` |
| `sync_note_links(uuid, uuid[])`                               | RPC for diff-based link sync             | `20260430200000_*` |

`note_type` column on `notes` already exists from earlier migrations; values used by P1: `'standard'` (default), `'daily_briefing'`.

## Feature flags

| Flag                | Default (dev) | Default (prod) | Env var                  |
| ------------------- | ------------- | -------------- | ------------------------ |
| `FF_FOUNDER_BLOCKS` | ON            | ON             | `VITE_FF_FOUNDER_BLOCKS` |
| `FF_NOTE_LINKS`     | ON            | ON             | `VITE_FF_NOTE_LINKS`     |
| `FF_TEMPLATES`      | ON            | ON             | `VITE_FF_TEMPLATES`      |
| `FF_INLINE_AI`      | ON            | ON             | `VITE_FF_INLINE_AI`      |
| `FF_DAILY_BRIEFING` | ON            | ON             | `VITE_FF_DAILY_BRIEFING` |
| `FF_NOTE_AGING`     | ON            | ON             | `VITE_FF_NOTE_AGING`     |
| `FF_MOOD_ROUTING`   | ON            | ON             | `VITE_FF_MOOD_ROUTING`   |

Phase 1 is rolled out: prod defaults are now ON in `src/lib/feature-flags.ts`. To
disable a feature in production, set its `VITE_FF_*` env var to `0` (or `false`) and
rebuild.

## Edge functions added

- `supabase/functions/inline-ai/` — Cmd+J co-writer; reuses Anthropic key path from `ai-chat`.
- `supabase/functions/daily-briefing/` — generates today's `daily_briefing` note for a user.

## Known deltas from PRD

- The `useBlockEditor` hook lives at `src/components/onenote/pro/useBlockEditor.tsx`, not `src/hooks/`. Plan paths updated accordingly.
- `note_type` column already existed before Phase 1 (default `'note'`). We did not add it; daily-briefing uses the existing column with a new value `'daily_briefing'`.
- The 24h Decision-Log lock is enforced client-side only (DB column drift wasn't required); editing past the lock requires typing an unlock reason that is stored on the block JSON.
- Pre-existing RLS gap on `notes`, `note_items`, `note_templates`, `user_api_keys` (no policies). Out of Phase 1 scope; tracked for Phase 7 (OneApp Data 3.0). New table `note_links` ships with RLS on day one.

## Verification status

- `npm run lint` — passes (0 errors)
- `npm run test` — passes (blocks, links, templates, feature-flags)
- `npm run build` — passes
- Manual QA — golden path walked: create note → insert each new block → link `[[A]]` → apply template → invoke Cmd+J → see daily briefing → toggle mood block.

## Deferred (manual/CI — cannot run headless in agent env)

- Lighthouse mobile audit on note-heavy views.
- Production flag-flip smoke test on the live deployment (defaults are flipped in code;
  verify in prod after deploy).
