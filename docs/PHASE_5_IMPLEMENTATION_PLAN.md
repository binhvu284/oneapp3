# Phase 5 — Website 3.0 Implementation Plan

> **Source:** [ONEAPP_3_PRD.md](./ONEAPP_3_PRD.md), Section 7
> **Phase:** P5 — Website 3.0
> **Estimated duration:** 4–5 weeks (solo builder)
> **Status:** In progress

This document translates the PRD Phase 5 requirements into a sequenced engineering plan. The website is the public-facing surface of OneApp — it must look like a real product, ship fast, and respect accessibility settings.

---

## 0. Guardrails (apply to every milestone)

- All new public pages render under a single shell so header/footer/SEO live in one place.
- No hardcoded colors — use semantic HSL tokens from `index.css` / `tailwind.config.ts`. Cyan accent on the explore page is the established brand mark.
- All entrance / scroll / parallax animations gate on `prefers-reduced-motion`.
- Heavy decorative components (`ParticleBackground`, `DynamicNeonPaths`, `EcosystemOrbitSection`) stay lazy-loaded behind `IntersectionObserver` (already partially done; finish it).
- Per-page `<title>` and `<meta>` set with a tiny in-house `useDocumentMeta` hook — no new dependency.
- New pages must work without auth — never call `useAuthSource()` in a way that gates render.

---

## 1. Milestones & Sequence

| #   | Milestone                                                    | PRD Ref | Depends on | Est. |
| --- | ------------------------------------------------------------ | ------- | ---------- | ---- |
| M0  | Public shell + reduced-motion + meta hook                    | 7.5     | —          | 2 d  |
| M1  | `/pricing` — freemium tiers                                  | 7.4     | M0         | 2 d  |
| M2  | `/changelog` — version history                               | 7.4     | M0         | 2 d  |
| M3  | `/explore` upgrades (scroll progress, cursor blobs, 3D mock) | 7.3     | M0         | 5 d  |
| M4  | `/ecosystem` rebuild (interactive module cards)              | 7.3     | M0         | 3 d  |
| M5  | `/journey` rebuild (scroll-driven timeline)                  | 7.3     | M0         | 3 d  |
| M6  | Performance + SEO pass + Konami easter egg                   | 7.5     | M3         | 3 d  |
| M7  | Hardening, copy polish, docs                                 | —       | all        | 2 d  |

Order rationale: shared shell first so every new page benefits; new pages (Pricing, Changelog) are isolated and ship value early; Explore upgrades are the highest-effort visual work; Ecosystem and Journey are smaller rebuilds; performance + easter egg + tests close out.

---

## 2. M0 — Public Shell + Reduced-Motion + Meta Hook

**Files added:**

- `src/components/website/PublicLayout.tsx` — `<SharedHeader />` + `<Outlet />` + `<SimpleFooter />` wrapper.
- `src/hooks/useReducedMotion.ts` — wraps `window.matchMedia('(prefers-reduced-motion: reduce)')`. Returns boolean, updates on change.
- `src/hooks/useDocumentMeta.ts` — sets `document.title` + a small set of `<meta>` tags (description, og:title, og:description, og:url) on mount, restores prior values on unmount.
- `src/components/website/SectionHeading.tsx` — shared section header used by Pricing/Changelog/Ecosystem/Journey for visual consistency.

**Files modified:**

- `src/App.tsx` — wrap `/explore`, `/ecosystem`, `/journey`, `/forum`, `/docs`, `/pricing`, `/changelog` in `<Route element={<PublicLayout />}>`. Keep `/explore` rendering its own preloader/footer for the cinematic landing.
- `src/components/explore/RevealSection.tsx` — short-circuit animations when reduced motion is on.
- `src/components/landing/ParticleBackground.tsx` — bail out (return `null`) when reduced motion is on.

**Exit criteria:** all public pages share header/footer; reduced-motion users see static layouts; per-page titles render in the tab strip.

---

## 3. M1 — `/pricing` — Freemium Tiers (PRD §7.4)

Three tier cards (Free / Pro / Enterprise) rendered in a responsive grid. Pro and Enterprise are "Coming soon" — disabled CTAs.

**Files added:**

- `src/pages/Pricing.tsx` — page shell, hero copy, tier grid, FAQ section.
- `src/components/website/PricingTierCard.tsx` — single tier card with feature list, badge, accent ring on hover.
- `src/data/pricingTiers.ts` — typed tier definitions: `{ id, name, price, cadence, badge?, features: string[], cta: { label, href, disabled } }`.

**Behavior:**

- "Free" card highlighted with the cyan accent ring (current default = today's offering).
- Pro/Enterprise cards have a `Coming Soon` overlay (low-opacity gradient + lock icon).
- Hover (only when motion not reduced): card scales `1.02` + accent border glow via Framer Motion.

**Exit criteria:** route resolves at `/pricing`, mobile responsive, hover states work, reduced motion turns off scale.

---

## 4. M2 — `/changelog` — Version History (PRD §7.4)

Renders a structured list of OneApp versions with Added/Changed/Fixed sections.

**Files added:**

- `src/pages/Changelog.tsx` — page shell + scroll-revealed cards.
- `src/data/changelog.ts` — typed version log: `{ version, date, isCurrent, added?, changed?, fixed? }`. Seed data covers 2.x history (paraphrased from `old version/CHANGELOG.md`) plus a placeholder 3.0.0 entry tied to current Phase 1 progress.
- `src/components/website/ChangelogEntry.tsx` — single version card.

**Behavior:**

- Latest version gets a `Current` badge.
- Hero shows two animated counters: total versions, total features shipped.
- Cards reveal from bottom on scroll (reuse `RevealSection`).

**Exit criteria:** `/changelog` resolves, counters animate when motion is allowed, current version highlighted.

---

## 5. M3 — `/explore` Upgrades (PRD §7.3)

Scope is the highest-touch milestone. Order inside it:

1. **Scroll storytelling**: `src/components/explore/ScrollProgressRail.tsx` — vertical line on right edge, fills as user scrolls. Chapter labels for sections (Hero, Values, Ecosystem, Stats, Features). Hidden on mobile.
2. **Cursor-reactive blobs**: extend `GradientBlobs.tsx` — track `mousemove`, drift the largest blob toward cursor with a Framer Motion spring.
3. **3D dashboard mockup**: `src/components/explore/DashboardMockup3D.tsx` — CSS perspective + parallax on `mousemove` (±3°). Uses a lightweight SVG/CSS mockup (no real screenshot dependency).
4. **Hero word-stagger**: split "ONE SYSTEM / INFINITE CONTROL" into spans, animate with 80 ms staggered fade+slide via Framer Motion.
5. **Constellation parallax**: enhance `CoreValuesSection.tsx` — apply `useScroll()` translateY at 0.3× / 0.15× to hub vs value nodes.
6. **Counter preloader polish**: small change in `CounterPreloader.tsx` — final-value flash via a one-shot CSS animation.

All gated behind `useReducedMotion()`.

**Exit criteria:** explore page passes Lighthouse a11y; `prefers-reduced-motion` produces a clean static page; cursor parallax doesn't jank.

---

## 6. M4 — `/ecosystem` Rebuild (PRD §7.3)

Replace placeholder Features page with module showcase. Cards for OneNote, OneCommand, OneAI, OneCrypto, OneApp Data.

**Files added:**

- `src/data/ecosystemModules.ts` — typed module list: `{ id, name, tagline, status: 'live' | 'coming_soon', icon, accent, screenshot? }`.
- `src/components/website/ModuleCard.tsx` — card with animated icon, status badge, hover-reveal mini preview (CSS gradient mock, since real screenshots arrive later).

**Files modified:**

- `src/pages/Features.tsx` — gut the existing placeholder, render the new grid + intro hero.

**Exit criteria:** `/ecosystem` shows 5 module cards with correct status badges and hover behavior.

---

## 7. M5 — `/journey` Rebuild (PRD §7.3)

Scroll-driven vertical timeline of OneApp v1 → v2 → v3.

**Files added:**

- `src/data/journeyMilestones.ts` — typed milestone list: `{ id, version, date, headline, summary, features: string[] }`.
- `src/components/website/TimelineItem.tsx` — milestone item, pulls in scroll-driven line draw via Framer Motion `useScroll` + path-length tween.

**Files modified:**

- `src/pages/About.tsx` — replace existing About placeholder content with the timeline.

**Exit criteria:** timeline renders top-down, line draws with scroll, milestones animate in when in view, mobile collapses to a single column.

---

## 8. M6 — Performance + SEO + Easter Egg

**Performance:**

- Wrap `EcosystemOrbitSection`, `DynamicNeonPaths`, `ParticleBackground` with `IntersectionObserver` mount gating where not yet done.
- Audit explore page imports for any non-lazy heavy assets.

**SEO:**

- Use `useDocumentMeta` on every public page with unique title + description.
- Update `index.html` with a generic title; per-page meta wins at runtime.
- Inject one JSON-LD `<script type="application/ld+json">` on the home page (Organization + WebSite schema).

**Easter egg:**

- `src/hooks/useKonamiCode.ts` — listens to the classic sequence (`↑ ↑ ↓ ↓ ← → ← → B A`), fires a callback once.
- On `/explore`, trigger a one-shot anime.js burst from the constellation hub (extra rays + brief headline glow). Logged once to console with a wink. No user-visible UI button.

**Exit criteria:** Lighthouse mobile ≥ 90 on `/explore`; per-page `<title>` works; konami sequence triggers exactly once and is silent for reduced-motion users.

---

## 9. M7 — Hardening

- Manual mobile pass on real device sizes (375 / 414 / 768).
- Snapshot tests for `PricingTierCard`, `ChangelogEntry`, `ModuleCard`, `TimelineItem` under Vitest + Testing Library.
- Update `docs/PHASE_5_PROGRESS.md` and link from PRD as each milestone lands.
- Update root `README.md` to mention the new public routes.

---

## 10. Out of Scope (defer)

- Real product screenshots for `ModuleCard` (placeholder gradients are fine until P4 Interface 3.0 ships).
- Full client-side fuzzy search on `/changelog` (the list is short — anchor links are enough).
- Dynamic OG image generation per page (static OG image stays the global one for now).
- A blog. Not requested.

---

_End of Phase 5 implementation plan._
