# Phase 4 — Interface 3.0 Implementation Progress

> Tracker for the OneApp 3 Phase 4 upgrade described in
> [`ONEAPP_3_PRD.md`](./ONEAPP_3_PRD.md) §6 and
> [`PHASE_4_IMPLEMENTATION_PLAN.md`](./PHASE_4_IMPLEMENTATION_PLAN.md).
> Updated as each milestone lands.

**Last updated:** 2026-06-12 (M4 + M5 + M6 shipped — Phase 4 complete)

## Status legend

- ✅ shipped
- 🟡 in progress
- ⬜ not started

## Milestones

| #   | Milestone                                           | Status | Notes                                                                                                                                                         |
| --- | --------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M0  | Scaffold — flags + theme-engine migration + docs    | ✅     | `PHASE_4_FLAGS`, migration `20260611120000_*` (file only), this tracker + plan doc.                                                                           |
| M1  | Neumorphic Design System (tokens + opt-in variants) | ✅     | `--neu-*` tokens, `.neu-card` utility, `<Card variant="neu">`, `<Button variant="neu">`.                                                                      |
| M2  | Micro-Interaction Library                           | ✅     | Motion tokens (`src/lib/motion.ts`), `useMicroInteractions` gate, `Pressable` + `Stagger` primitives. Per-element adoption rolls out opportunistically.       |
| M3  | Cinematic Transition System                         | ✅     | `RouteProgressBar`, `PageTransition`; wired into `App.tsx` + `AppLayout`.                                                                                     |
| M4  | OneApp Theme Engine + accent-hue system             | ✅     | `src/lib/themes.ts` (6 presets), `--accent-hue` CSS refactor, `useThemeEngine`, `AppearanceThemes.tsx` page, route `/settings/appearance/themes`.             |
| M5  | Canvas Dashboard 3.0 widgets                        | ✅     | 7 widgets (Deploy/AIBriefing/NoteGraph/TaskBurndown/DBHealth/AdminPulse/CryptoPulse) gated by `FF_CANVAS_WIDGETS`; spring drag-in via `useMicroInteractions`. |
| M6  | Sidebar 3.0 + hardening, tests, docs                | ✅     | Pinnable quick-actions (`sidebar_pinned_actions`), mini activity feed, system pulse strip; gated by `FF_SIDEBAR_3`. Tests + docs included.                    |

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
| `FF_CANVAS_WIDGETS`     | ON            | OFF            | `VITE_FF_CANVAS_WIDGETS`     |
| `FF_SIDEBAR_3`          | ON            | OFF            | `VITE_FF_SIDEBAR_3`          |

To roll out in production, set each `VITE_FF_*` to `1` (or `true`) and rebuild.

## Verification status

- `npm run lint` — passes (0 errors)
- `npm run test` — passes (79 total; M0–M3 baseline 37 + M4 theme-engine 17 + M5 dashboard-metrics 15 + M6 sidebar-actions 10)
- `npm run build` — passes (all Phase 4 modules compile cleanly)

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

## M4 — Theme Engine UI (files)

| Path                             | Purpose                                                                                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/themes.ts`              | 6 presets (Midnight/Carbon/Slate/Arctic/Sand/Obsidian), `applyThemePreset`, `applyAccentHue`, localStorage FOUC guard.      |
| `src/index.css`                  | `--accent-hue: 199` added to `:root`; `--primary`, `--ring`, sidebar + card accent vars derived via `var(--accent-hue)`.    |
| `src/hooks/useCustomTheme.tsx`   | `useThemeEngine` hook: reads DB via `useDataQuery`, writes via `useDataUpsert`; FOUC prevention via localStorage sync init. |
| `src/pages/AppearanceThemes.tsx` | Preset grid (6 × `<Card variant="neu">`) + native range hue slider; Stagger entrance; Save + error toast.                   |
| `src/App.tsx`                    | Lazy import + route `/settings/appearance/themes`; redirects to `/settings/appearance` when `FF_THEME_ENGINE` OFF.          |
| `src/test/theme-engine.test.ts`  | 17 tests: 6-preset contract, default-hue math, DOM side-effects, localStorage round-trip.                                   |

Non-breaking design: `--accent-hue: 199` default produces identical output to the previous literal `199 89% 48%` — zero visual change when flag is OFF.

## M5 — Canvas Dashboard 3.0 (files)

| Path                                                  | Purpose                                                                                                         |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/lib/dashboard-metrics.ts`                        | Pure helpers: relative time, portfolio, burndown, activity merge, note graph.                                   |
| `src/components/dashboard/widgets/*.tsx` (×7)         | DeployStatus, AIBriefing, NoteGraph, TaskBurndown, DBHealth, AdminPulse, CryptoPulse — data via `useDataQuery`. |
| `src/components/dashboard/widgets/WidgetEmpty.tsx`    | Shared empty-state for the new widgets.                                                                         |
| `src/hooks/useLatestSystemConnection.ts`              | Shared single-fetch read of the latest `system_connection` row.                                                 |
| `src/components/dashboard/widgets/WidgetRegistry.tsx` | Registers the 7 new types + `CANVAS_3_WIDGET_TYPES`.                                                            |
| `src/components/dashboard/AddWidgetDialog.tsx`        | Hides Canvas 3.0 widgets from the picker unless `FF_CANVAS_WIDGETS`.                                            |
| `src/components/dashboard/DashboardGrid.tsx`          | Spring drag-in (`dashboard-spring` + `animate-widget-drop`) gated on micro-interactions.                        |
| `src/index.css`                                       | `widget-drop-in` keyframe + springy magnetic-snap timing.                                                       |
| `src/test/dashboard-metrics.test.ts`                  | 15 tests for the metric helpers.                                                                                |

## M6 — Sidebar 3.0 (files)

| Path                                             | Purpose                                                                 |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| `src/lib/sidebar-actions.ts`                     | Quick-action catalog + pure pin/unpin helpers.                          |
| `src/hooks/useSidebarPinnedActions.ts`           | Reads/writes `user_settings.sidebar_pinned_actions` via the data-layer. |
| `src/hooks/useSidebarActivity.ts`                | Merges recent notes/tasks/trades into the activity feed.                |
| `src/hooks/useSystemPulse.ts`                    | DB / deploy / AI status signals for the pulse strip.                    |
| `src/components/layout/SidebarPinnedActions.tsx` | Pinned quick-actions + manage popover (max 3).                          |
| `src/components/layout/SidebarActivityFeed.tsx`  | Collapsible last-5 activity feed.                                       |
| `src/components/layout/SidebarPulseStrip.tsx`    | Three status dots at the sidebar foot.                                  |
| `src/components/layout/AppSidebar.tsx`           | Renders the three sections gated on `FF_SIDEBAR_3`.                     |
| `src/test/sidebar-actions.test.ts`               | 10 tests for the catalog + pin helpers.                                 |

## Deferred (manual/CI — cannot run headless in agent env)

- Visual check of the `neu` variant, micro-interactions, and cinematic transitions in-app (light + dark, reduced-motion).
- Visual check of all 6 theme presets + hue slider in AppearanceThemes.
- Visual check of the 7 Canvas 3.0 widgets and the Sidebar 3.0 sections (light + dark, collapsed + expanded, reduced-motion).

## Supabase

- **Project:** `gvcelxiwxqkzgfpxkiuv` (oneapp3, ap-northeast-1) — `ACTIVE_HEALTHY`
- **URL:** `https://gvcelxiwxqkzgfpxkiuv.supabase.co`
- All 25 migrations applied (full schema including P4 columns).
- `.env` updated to point to this project.
