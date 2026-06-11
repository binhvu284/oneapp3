# Phase 4 — Interface 3.0 Implementation Plan

> **Source:** [ONEAPP_3_PRD.md](./ONEAPP_3_PRD.md), Section 6
> **Phase:** P4 — Interface 3.0
> **Estimated duration:** 5–6 weeks (solo builder)
> **Status:** In progress (M0–M1 shipped)

This document translates the PRD Phase 4 requirements into a sequenced engineering
plan. Phase 4 gives OneApp a unique visual identity — high-tech minimal with
neumorphic dark surfaces, cinematic transitions, and tactile micro-interactions —
**without breaking the existing UI**. Every new surface is opt-in and flag-gated.

---

## 0. Guardrails (apply to every milestone)

- **Non-breaking & opt-in.** New visual treatments ship as additional variants
  (`variant="neu"`), additional utilities (`.neu-card`), or behind a feature flag.
  Existing components keep their current look until explicitly migrated.
- **No hardcoded colors** — neumorphic shadows/surfaces derive from existing
  `--background` via new HSL tokens (`--neu-surface`, `--neu-shadow-dark`,
  `--neu-shadow-light`) in `src/index.css`. The accent system derives every accent
  from a single user `--accent-hue`.
- **Respect `prefers-reduced-motion`** — all micro-interactions and cinematic
  transitions gate on `useReducedMotion()` (already exists from Phase 5).
- **Animation split** — Framer Motion for component-level interactions; anime.js for
  orchestrated/canvas sequences (both already installed).
- **Flags** — `FF_NEU_DESIGN`, `FF_THEME_ENGINE`, `FF_MICRO_INTERACTIONS` in
  `src/lib/feature-flags.ts` (`PHASE_4_FLAGS`); dev ON, prod OFF until sign-off.

---

## 1. Milestones & Sequence

| #   | Milestone                                           | PRD Ref  | Depends on | Est. | Status |
| --- | --------------------------------------------------- | -------- | ---------- | ---- | ------ |
| M0  | Scaffold — flags + theme-engine migration + docs    | 6.4      | —          | 2 d  | ✅     |
| M1  | Neumorphic Design System (tokens + opt-in variants) | 6.3 F4.1 | M0         | 5 d  | ✅     |
| M2  | Micro-Interaction Library                           | 6.3 F4.2 | M1         | 5 d  | ⬜     |
| M3  | Cinematic Transition System                         | 6.3 F4.3 | M1         | 5 d  | ⬜     |
| M4  | OneApp Theme Engine + accent-hue system             | 6.3 F4.5 | M0, M1     | 5 d  | ⬜     |
| M5  | Canvas Dashboard 3.0 widgets                        | 6.3 F4.4 | M1         | 6 d  | ⬜     |
| M6  | Sidebar 3.0 + hardening, tests, docs                | 6.3 F4.6 | all        | 5 d  | ⬜     |

Order rationale: tokens + base variants first (everything else composes on them);
micro-interactions and transitions are independent and parallelizable; the theme
engine needs the token layer; dashboard widgets and sidebar are the largest surfaces
and land last alongside hardening.

---

## 2. M0 — Scaffold (✅ shipped)

**Files added:**

- `supabase/migrations/20260611120000_*_phase4_interface_scaffold.sql` — adds
  `user_settings.theme_preset` (default `'midnight'`), `accent_hue` (default `186`),
  `sidebar_pinned_actions` (jsonb default `[]`). Idempotent; **file only — not yet
  applied to the remote DB**.

**Files modified:**

- `src/lib/feature-flags.ts` — `PHASE_4_FLAGS` added; `flag()` gains a `prodDefault`
  option (also used to roll out Phase 1).
- `docs/PHASE_4_IMPLEMENTATION_PLAN.md`, `docs/PHASE_4_PROGRESS.md` — new.
- `docs/ONEAPP_3_PRD.md` — P4 status → 🟡.

**Exit criteria:** flags importable; migration file present; docs scaffolded.

---

## 3. M1 — Neumorphic Design System (✅ shipped, PRD §6.3 F4.1)

**Files modified:**

- `src/index.css` — `--neu-surface` / `--neu-shadow-dark` / `--neu-shadow-light`
  tokens in both `:root` and `.dark`; `.neu-card` utility (dual box-shadow) and
  `.neu-card:active` (inset/pressed) using the expo-out cubic-bezier.
- `src/components/ui/button.tsx` — `neu` added to the CVA `variant` union.
- `src/components/ui/card.tsx` — opt-in `variant?: "default" | "neu"` prop.

**Exit criteria:** `<Card variant="neu">` and `<Button variant="neu">` render an
embossed surface that inverts to a pressed state on `:active`; flat defaults unchanged.

**Follow-ups (future milestones):** neumorphic variants for `Switch`, `Input`,
`Select` per PRD §6.3 F4.1.

---

## 4. M2 — Micro-Interaction Library (PRD §6.3 F4.2)

Framer Motion interaction set, gated on `FF_MICRO_INTERACTIONS` + reduced-motion:
button press `scale(0.96)` + shadow invert (120ms); checkbox SVG path draw; toggle
momentum overshoot; sidebar hover left-border reveal; card hover lift; staggered
dropdown items; spring toast entrance. Land as a small set of reusable wrappers/
variants under `src/components/ui/` and `src/components/motion/`.

## 5. M3 — Cinematic Transition System (PRD §6.3 F4.3)

Module-switch fade/slide (200/400ms), route-change top progress bar, login assemble
sequence (anime.js), deploy-success overlay. Hook into the app shell / router.

## 6. M4 — OneApp Theme Engine (PRD §6.3 F4.5)

New route `/settings/appearance/themes`. Six presets (Midnight/Carbon/Slate/Arctic/
Sand/Obsidian) + custom accent hue via color wheel; persist to the `user_settings`
columns added in M0; derive all accents from `--accent-hue`. Extend the existing
`useCustomTheme` hook; gate on `FF_THEME_ENGINE`.

## 7. M5 — Canvas Dashboard 3.0 (PRD §6.3 F4.4)

New widget types registered in `src/components/dashboard/widgets/WidgetRegistry.tsx`
(DeployStatus, AIBriefing, NoteGraph, TaskBurndown, DBHealth, AdminPulse,
CryptoPulse) with spring drag-in + magnetic snap on `react-grid-layout`.

## 8. M6 — Sidebar 3.0 + Hardening (PRD §6.3 F4.6)

Mini activity feed, pinnable quick-actions (backed by `sidebar_pinned_actions`),
system pulse strip. Plus: Vitest coverage for new hooks/variants, reduced-motion
verification, copy polish, docs.

---

## Deferred to OneApp 4+

Ambient sound layer (PRD §11.1) is opportunistic and not in the P4 critical path.
