# Phase 4 — Interface 3.0 Implementation Progress

> Tracker for the OneApp 3 Phase 4 upgrade described in
> [`ONEAPP_3_PRD.md`](./ONEAPP_3_PRD.md) §6 and
> [`PHASE_4_IMPLEMENTATION_PLAN.md`](./PHASE_4_IMPLEMENTATION_PLAN.md).
> Updated as each milestone lands.

**Last updated:** 2026-06-11

## Status legend

- ✅ shipped
- 🟡 in progress
- ⬜ not started

## Milestones

| #   | Milestone                                           | Status | Notes                                                                                    |
| --- | --------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| M0  | Scaffold — flags + theme-engine migration + docs    | ✅     | `PHASE_4_FLAGS`, migration `20260611120000_*` (file only), this tracker + plan doc.      |
| M1  | Neumorphic Design System (tokens + opt-in variants) | ✅     | `--neu-*` tokens, `.neu-card` utility, `<Card variant="neu">`, `<Button variant="neu">`. |
| M2  | Micro-Interaction Library                           | ⬜     | Framer Motion press/draw/overshoot set. Future session.                                  |
| M3  | Cinematic Transition System                         | ⬜     | Module/route transitions, progress bar, login assemble. Future session.                  |
| M4  | OneApp Theme Engine + accent-hue system             | ⬜     | `/settings/appearance/themes`, 6 presets + custom hue. Future session.                   |
| M5  | Canvas Dashboard 3.0 widgets                        | ⬜     | New widget registry entries with spring drag-in. Future session.                         |
| M6  | Sidebar 3.0 + hardening, tests, docs                | ⬜     | Activity feed, pinned actions, pulse strip. Future session.                              |

## Schema changes staged (Phase 4)

| Object                                 | Change                                 | Migration          | Applied?       |
| -------------------------------------- | -------------------------------------- | ------------------ | -------------- |
| `user_settings.theme_preset`           | New column (text default `'midnight'`) | `20260611120000_*` | No (file only) |
| `user_settings.accent_hue`             | New column (integer default `186`)     | `20260611120000_*` | No (file only) |
| `user_settings.sidebar_pinned_actions` | New column (jsonb default `[]`)        | `20260611120000_*` | No (file only) |

Apply via the Supabase migration workflow when M4/M6 consume these columns.

## Feature flags

| Flag                    | Default (dev) | Default (prod) | Env var                      |
| ----------------------- | ------------- | -------------- | ---------------------------- |
| `FF_NEU_DESIGN`         | ON            | OFF            | `VITE_FF_NEU_DESIGN`         |
| `FF_THEME_ENGINE`       | ON            | OFF            | `VITE_FF_THEME_ENGINE`       |
| `FF_MICRO_INTERACTIONS` | ON            | OFF            | `VITE_FF_MICRO_INTERACTIONS` |

To roll out in production, set each `VITE_FF_*` to `1` (or `true`) and rebuild.

## Verification status

- `npm run lint` — passes (0 errors)
- `npm run test` — passes
- `npm run build` — passes (CSS tokens + opt-in variants compile cleanly)

## Deferred (manual/CI — cannot run headless in agent env)

- Visual check of the `neu` variant in-app (light + dark).
- Apply the Phase 4 migration to the remote Supabase project.
