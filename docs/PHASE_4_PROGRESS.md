# Phase 4 — Interface 3.0 Implementation Progress

> Tracker for the OneApp 3 Phase 4 upgrade described in
> [`ONEAPP_3_PRD.md`](./ONEAPP_3_PRD.md) §6 and
> [`PHASE_4_IMPLEMENTATION_PLAN.md`](./PHASE_4_IMPLEMENTATION_PLAN.md).
> Updated as each milestone lands.

**Last updated:** 2026-06-11 (M3 shipped)

## Status legend

- ✅ shipped
- 🟡 in progress
- ⬜ not started

## Milestones

| #   | Milestone                                           | Status | Notes                                                                                                                                                   |
| --- | --------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M0  | Scaffold — flags + theme-engine migration + docs    | ✅     | `PHASE_4_FLAGS`, migration `20260611120000_*` (file only), this tracker + plan doc.                                                                     |
| M1  | Neumorphic Design System (tokens + opt-in variants) | ✅     | `--neu-*` tokens, `.neu-card` utility, `<Card variant="neu">`, `<Button variant="neu">`.                                                                |
| M2  | Micro-Interaction Library                           | ✅     | Motion tokens (`src/lib/motion.ts`), `useMicroInteractions` gate, `Pressable` + `Stagger` primitives. Per-element adoption rolls out opportunistically. |
| M3  | Cinematic Transition System                         | ✅     | `RouteProgressBar`, `PageTransition`; wired into `App.tsx` + `AppLayout`.                                                                               |
| M4  | OneApp Theme Engine + accent-hue system             | ⬜     | `/settings/appearance/themes`, 6 presets + custom hue. Future session.                                                                                  |
| M5  | Canvas Dashboard 3.0 widgets                        | ⬜     | New widget registry entries with spring drag-in. Future session.                                                                                        |
| M6  | Sidebar 3.0 + hardening, tests, docs                | ⬜     | Activity feed, pinned actions, pulse strip. Future session.                                                                                             |

## Schema changes staged (Phase 4)

| Object                                 | Change                                 | Migration          | Applied?                             |
| -------------------------------------- | -------------------------------------- | ------------------ | ------------------------------------ |
| `user_settings.theme_preset`           | New column (text default `'midnight'`) | `20260611120000_*` | ✅ Applied to `gvcelxiwxqkzgfpxkiuv` |
| `user_settings.accent_hue`             | New column (integer default `186`)     | `20260611120000_*` | ✅ Applied to `gvcelxiwxqkzgfpxkiuv` |
| `user_settings.sidebar_pinned_actions` | New column (jsonb default `[]`)        | `20260611120000_*` | ✅ Applied to `gvcelxiwxqkzgfpxkiuv` |

All 25 migrations (including full base schema) applied to the new project `gvcelxiwxqkzgfpxkiuv` (oneapp3, ap-northeast-1).

## Feature flags

| Flag                    | Default (dev) | Default (prod) | Env var                      |
| ----------------------- | ------------- | -------------- | ---------------------------- |
| `FF_NEU_DESIGN`         | ON            | OFF            | `VITE_FF_NEU_DESIGN`         |
| `FF_THEME_ENGINE`       | ON            | OFF            | `VITE_FF_THEME_ENGINE`       |
| `FF_MICRO_INTERACTIONS` | ON            | OFF            | `VITE_FF_MICRO_INTERACTIONS` |

To roll out in production, set each `VITE_FF_*` to `1` (or `true`) and rebuild.

## Verification status

- `npm run lint` — passes (0 errors)
- `npm run test` — passes (37 total; +4 for cinematic transitions in `src/test/cinematic.test.tsx`)
- `npm run build` — passes (CSS tokens + opt-in variants + motion primitives compile cleanly)

## M2 — Micro-Interaction Library (files)

| Path                                  | Purpose                                                         |
| ------------------------------------- | --------------------------------------------------------------- |
| `src/lib/motion.ts`                   | Shared easing/timing/spring tokens + reusable Framer variants.  |
| `src/hooks/useMicroInteractions.ts`   | Gate: `FF_MICRO_INTERACTIONS` AND not `prefers-reduced-motion`. |
| `src/components/motion/Pressable.tsx` | Tactile press (scale 0.96 / 120ms) for any tappable surface.    |
| `src/components/motion/Stagger.tsx`   | Staggered fade+slide reveal (`Stagger` + `StaggerItem`).        |

The library is non-breaking and opt-in: existing components are unchanged until they
adopt these primitives. Remaining F4.2 interactions (checkbox path-draw, toggle
momentum overshoot, spring toasts) adopt the same tokens as components migrate.

## M3 — Cinematic Transition System (files)

| Path                                         | Purpose                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `src/components/motion/RouteProgressBar.tsx` | Thin accent bar at viewport top; plays on every route change.           |
| `src/components/motion/PageTransition.tsx`   | `AnimatePresence` wrapper: exit 200ms fade, enter 400ms EXPO_OUT slide. |
| `src/components/layout/AppLayout.tsx`        | Replaced inline `AnimatePresence` block with `<PageTransition>`.        |
| `src/App.tsx`                                | `<RouteProgressBar />` mounted alongside `<Sonner />` in shell.         |
| `src/test/cinematic.test.tsx`                | 4 render tests covering both primitives.                                |

## Deferred (manual/CI — cannot run headless in agent env)

- Visual check of the `neu` variant, micro-interactions, and cinematic transitions in-app (light + dark, reduced-motion).

## Supabase

- **Project:** `gvcelxiwxqkzgfpxkiuv` (oneapp3, ap-northeast-1) — `ACTIVE_HEALTHY`
- **URL:** `https://gvcelxiwxqkzgfpxkiuv.supabase.co`
- All 25 migrations applied (full schema including P4 columns).
- `.env` updated to point to this project.
