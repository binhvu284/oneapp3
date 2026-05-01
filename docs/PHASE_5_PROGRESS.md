# Phase 5 — Website 3.0 Implementation Progress

> Tracker for the OneApp 3 Phase 5 upgrade described in
> [`ONEAPP_3_PRD.md`](./ONEAPP_3_PRD.md) §7 and
> [`PHASE_5_IMPLEMENTATION_PLAN.md`](./PHASE_5_IMPLEMENTATION_PLAN.md).
> Updated as each milestone lands.

**Last updated:** 2026-05-01

## Status legend

- ✅ shipped
- 🟡 in progress
- ⬜ not started

## Milestones

| #   | Milestone                                 | Status | Notes                                                                                        |
| --- | ----------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| M0  | Public shell + reduced-motion + meta hook | ✅     | `PublicLayout`, `useReducedMotion`, `useDocumentMeta`, `SectionHeading` shipped.             |
| M1  | `/pricing` — freemium tier cards          | ✅     | Three tier grid, Free highlighted, Pro/Enterprise locked with "Coming Soon" overlay.         |
| M2  | `/changelog` — version history            | ✅     | Cards parsed from `src/data/changelog.ts`; hero counters animate.                            |
| M3  | `/explore` upgrades                       | ✅     | Scroll progress rail, cursor-reactive blobs, 3D dashboard mock, hero word-stagger, parallax. |
| M4  | `/ecosystem` rebuild                      | ✅     | Five module cards, status badges, hover mini-preview gradient.                               |
| M5  | `/journey` rebuild                        | ✅     | Vertical timeline with scroll-driven line draw + milestone reveal.                           |
| M6  | Performance + SEO + Konami easter egg     | ✅     | Per-page meta, JSON-LD on home, intersection-gated heavy components, easter egg on explore.  |
| M7  | Hardening, copy polish, docs              | 🟡     | Manual mobile + Lighthouse pass + final tests pending.                                       |

## Routes shipped (Phase 5)

| Route        | Component                   | Status                        |
| ------------ | --------------------------- | ----------------------------- |
| `/explore`   | `src/pages/ExplorePage.tsx` | upgraded                      |
| `/ecosystem` | `src/pages/Features.tsx`    | rebuilt                       |
| `/journey`   | `src/pages/About.tsx`       | rebuilt                       |
| `/forum`     | `src/pages/Community.tsx`   | unchanged                     |
| `/docs`      | `src/pages/DocsPage.tsx`    | unchanged (P1 left it stable) |
| `/pricing`   | `src/pages/Pricing.tsx`     | new                           |
| `/changelog` | `src/pages/Changelog.tsx`   | new                           |

## New shared website primitives

| Path                                            | Purpose                                             |
| ----------------------------------------------- | --------------------------------------------------- |
| `src/components/website/PublicLayout.tsx`       | Shared header + footer wrapper for public routes.   |
| `src/components/website/SectionHeading.tsx`     | Consistent heading block for new pages.             |
| `src/components/website/PricingTierCard.tsx`    | Tier card.                                          |
| `src/components/website/ChangelogEntry.tsx`     | Version card.                                       |
| `src/components/website/ModuleCard.tsx`         | Ecosystem module card.                              |
| `src/components/website/TimelineItem.tsx`       | Journey timeline node.                              |
| `src/components/explore/ScrollProgressRail.tsx` | Right-edge scroll progress with chapter labels.     |
| `src/components/explore/DashboardMockup3D.tsx`  | CSS-perspective dashboard mock with mouse parallax. |
| `src/hooks/useReducedMotion.ts`                 | Boolean flag bound to `prefers-reduced-motion`.     |
| `src/hooks/useDocumentMeta.ts`                  | Imperative per-page `<title>` + `<meta>` setter.    |
| `src/hooks/useKonamiCode.ts`                    | Konami sequence detector for the easter egg.        |
| `src/data/pricingTiers.ts`                      | Pricing tier data.                                  |
| `src/data/changelog.ts`                         | Version history data.                               |
| `src/data/ecosystemModules.ts`                  | Ecosystem module data.                              |
| `src/data/journeyMilestones.ts`                 | Journey milestone data.                             |

## Open work for M7

- Lighthouse mobile audit on `/explore` and `/pricing`.
- Snapshot tests for new website components.
- Mobile sweep at 375 / 414 / 768.

## Out of scope (deferred)

- Real screenshots for ecosystem cards — use placeholder gradients until Phase 4 ships polished UI.
- Per-page dynamic OG images.
- Public blog.
