# Phase 1 — OneNote 3.0 Implementation Plan

> **Source:** [ONEAPP_3_PRD.md](./ONEAPP_3_PRD.md), Section 3
> **Phase:** P1 — OneNote 3.0
> **Estimated duration:** 5–7 weeks (solo builder)
> **Status:** Planning

This document translates the PRD Phase 1 requirements into a sequenced engineering plan. Each milestone is independently reviewable and shippable behind feature flags where noted.

---

## 0. Guardrails (apply to every milestone)

- Use `useAuthSource()` — never `useAuth()`.
- All DB access goes through `useDataQuery` / `useDataInsert` from `@/lib/data-layer`.
- No hardcoded colors — use HSL semantic tokens from `index.css` / `tailwind.config.ts`.
- Every new block type must serialize as JSON inside `notes.content`, consistent with the existing block schema.
- RLS policies must be defined in the same migration that creates a table.
- Every Edge Function must read its API keys from `user_api_keys` (never ship keys to the client).

---

## 1. Milestones & Sequence

| # | Milestone | PRD Ref | Depends on | Est. |
|---|-----------|---------|------------|------|
| M0 | Schema + flags scaffold | 3.4 | — | 2 d |
| M1 | Founder-Mode Block Types | F1.1 | M0 | 7–10 d |
| M2 | Bi-Directional Note Linking | F1.2 | M0 | 5–7 d |
| M3 | Personal Templates Engine | F1.5 | M1 | 4–6 d |
| M4 | Inline AI Co-Writer (Cmd+J) | F1.4 | M1 | 5–7 d |
| M5 | Daily Briefing Note | F1.3 | M1, M2 | 5–7 d |
| M6 | Surprise: Smart Note Aging | 3.5 | M0 | 2 d |
| M7 | Surprise: Mood-to-Task Routing | 3.5, F1.1 | M1 | 3 d |
| M8 | Hardening, tests, docs | — | all | 4–6 d |

Order rationale: schema first; block types unlock everything else; linking is independent and useful early; templates and Cmd+J build on the new block types; daily briefing aggregates work from prior milestones.

---

## 2. M0 — Schema + Flags Scaffold

**Migrations** (new file under `supabase/migrations/`):

```sql
CREATE TABLE note_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_note_id uuid REFERENCES notes(id) ON DELETE CASCADE,
  target_note_id uuid REFERENCES notes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_note_id, target_note_id)
);

ALTER TABLE notes ADD COLUMN is_bookmarked boolean DEFAULT false;
ALTER TABLE notes ADD COLUMN note_date date;
ALTER TABLE notes ADD COLUMN note_type text DEFAULT 'standard';
-- values: 'standard' | 'daily_briefing'
```

**RLS:** mirror existing `notes` policies on `note_links` — a user can read/write a link only when they own both `source_note_id` and `target_note_id`.

**Indexes:**
- `note_links (target_note_id)` — backlink lookup.
- `notes (note_type, note_date)` — daily briefing lookup.
- `notes (is_bookmarked) WHERE is_bookmarked = true` — partial index.

**Feature flags** (env-driven boolean constants in `src/lib/feature-flags.ts`):
`FF_FOUNDER_BLOCKS`, `FF_NOTE_LINKS`, `FF_TEMPLATES`, `FF_INLINE_AI`, `FF_DAILY_BRIEFING`, `FF_NOTE_AGING`, `FF_MOOD_ROUTING`. Default `false`; flip per milestone PR.

**Exit criteria:** migrations applied to a Supabase branch, types regenerated, feature flags wired into the OneNote module.

---

## 3. M1 — Founder-Mode Block Types (F1.1)

Four new block kinds rendered inside the existing Pro Mode block editor:

| Block | Fields | Rendering notes |
|-------|--------|-----------------|
| `idea` | `hypothesis`, `validation_status` (`untested` \| `validated` \| `invalidated`), `confidence` 1–5 | Card with status color ring derived from accent HSL |
| `decision_log` | `decision`, `reasoning`, `date` (auto), `outcome` (`pending` \| `good` \| `bad`) | Locked for editing after `now() - date > 24h` |
| `mood_energy` | `energy` 1–5 (slider), `mood` (emoji select), `note?` | Inline pill; feeds Daily Briefing + mood routing |
| `sprint` | `cards: { id, title, column }[]` (max 10), columns `todo` \| `in_progress` \| `done` | Mini kanban via existing dnd primitives |

**Touch points:**
- `src/components/onenote/blocks/` — add one component per block type.
- `src/components/onenote/SlashCommandMenu.tsx` — register new commands.
- `src/types/note-blocks.ts` — extend the block discriminated union.
- Block storage stays in `notes.content` JSON. Add a content migration helper that no-ops on legacy notes.

**Validation:** zod schema per block; reject malformed blocks at insert.

**Tests:** Vitest component tests for render + state transitions; one snapshot per block.

**Exit criteria:** all four blocks insertable via slash menu, persisted, reloadable, and editable except where the 24h decision-log lock applies.

---

## 4. M2 — Bi-Directional Note Linking (F1.2)

**Editor:**
- Detect `[[` token in any text-based block; open a popover (`cmdk`) listing matching note titles for the current user.
- On select: insert a `note_link` inline node referencing the target note id.
- Render link chips with the note icon and a hover preview of the target's first 80 chars.

**Persistence:**
- On note save, diff outbound links and upsert/delete rows in `note_links`.
- Wrap in a single transaction via an RPC `sync_note_links(source_id uuid, target_ids uuid[])`.

**Backlinks panel:**
- New sidebar section under the folder tree, shown when a note is open.
- Query: `note_links` joined to `notes` filtered by `target_note_id = current`.
- Click → navigate to source note.

**Edge cases:** broken links (target deleted) render with a strike-through and a "remove link" affordance; the `ON DELETE CASCADE` on `note_links` keeps rows clean.

**Exit criteria:** linking a note from A→B updates the backlinks panel on B in real time (TanStack Query invalidation).

---

## 5. M3 — Personal Templates Engine (F1.5)

- New route `/apps/onenote/templates` in `src/pages/onenote/`.
- Use existing `note_templates` table — UI only, no schema change.
- Template body: JSON array of blocks; placeholders `{{date}}`, `{{week}}`, `{{project_name}}` are substituted at apply time by a small `renderTemplate(blocks, context)` helper.
- "New Note" creation flow gains a template dropdown (system templates + the current user's personal templates).
- Permissions: Admin/Developer can create system templates (`is_system = true`); any user can create personal ones.

**Exit criteria:** create, edit, delete templates; apply on new-note flow with token substitution.

---

## 6. M4 — Inline AI Co-Writer (Cmd+J) (F1.4)

- Global keyboard handler in OneNote scoped to focus inside the editor.
- Panel anchored to the active block via Floating UI (already in deps).
- Context payload: active block + 3 above + 3 below, serialized to plain text + block kind.
- Reuse the `ai-chat` Edge Function pattern; add a thin `inline-ai` route that streams Anthropic responses.
- Preview pane → "Insert" inserts response as one or more blocks below the anchor.
- Actions: Continue writing, Summarize this section, Generate ideas, Fix grammar, Translate to EN/VI.
- Keys: `Cmd+J` / `Ctrl+J` to open, `Esc` to close, `Enter` to insert.

**Failure modes:** missing Anthropic key in `user_api_keys` → show inline CTA linking to settings; never silently fail.

**Exit criteria:** all five actions work end-to-end, streamed, with insert/cancel.

---

## 7. M5 — Daily Briefing Note (F1.3)

- Edge Function `daily-briefing` generates a note for today if missing.
  - Inputs: due tasks (`note_items.due_date = today AND is_completed = false`), pending decisions ≤ 7 days old, yesterday's mood/energy, untested ideas > 3 days, bookmarked notes.
  - Output: a new `notes` row with `note_type = 'daily_briefing'`, `note_date = today`.
- Trigger paths: on first login of the day (client-side check), and a daily cron via Supabase scheduled function as a safety net.
- Dashboard auto-opens the briefing note if today's has not been viewed yet (track in `localStorage` keyed by user + date).

**Exit criteria:** logging in produces today's briefing exactly once, with all five sections populated when data exists.

---

## 8. M6 — Smart Note Aging (Surprise)

- Add `last_opened_at` to `notes` (migration in M0 if cheap, otherwise here).
- Background-light: a TanStack Query that flags notes with `updated_at < now() - 30d`.
- Note card renders a subtle "revisit?" badge; opening the note clears the flag (updates `last_opened_at`).

**Exit criteria:** badge appears/disappears based on activity without a page refresh.

---

## 9. M7 — Mood-to-Task Routing (Surprise)

- Extend tag metadata with `energy_level` (`low` | `deep` | null) — stored on existing tag rows as JSON metadata column or a new column if the schema lacks one (verify in `schema.txt`).
- On dashboard load, read today's `mood_energy` block.
  - Energy ≤ 2 → surface tasks tagged `energy_level = low`.
  - Energy ≥ 4 → surface tasks tagged `energy_level = deep`.
  - Otherwise default ordering.

**Exit criteria:** dashboard task widget reorders based on today's mood block.

---

## 10. M8 — Hardening

- Vitest coverage target for new code: ≥ 60%.
- Manual QA pass against the golden path (create note → add each new block → link → apply template → invoke Cmd+J → see daily briefing).
- Update `docs/ONEAPP_3_PRD.md` if any spec drift occurred and capture deltas.
- Lighthouse + bundle size sanity check on the OneNote route.

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Block schema migrations break legacy notes | Keep a versioned `block.kind` discriminator and a no-op upgrader for unknown kinds |
| `[[` autocomplete latency on large vaults | Cache note title list in memory; refresh on note CRUD |
| Decision-log 24h lock disputes | Soft lock with a manual unlock requiring a typed reason, written to an audit column |
| AI cost runaway via Cmd+J | Cap context tokens; show a per-day usage indicator pulled from `user_api_keys` usage table |
| Daily briefing duplication | Unique partial index `(user_id, note_date) WHERE note_type = 'daily_briefing'` |

---

## 12. Definition of Done for Phase 1

- All five primary features (F1.1–F1.5) shipped behind flags, then enabled in production.
- Both surprise features live.
- Migrations applied on prod with rollback notes documented.
- No regressions on existing OneNote flows (Simple Mode, Pro Mode, folders, export).
- README and `docs/ONEAPP_3_PRD.md` reference the as-built behavior where it diverges from spec.
