# OneApp 3 — Product Requirements Document (PRD)

> **Version:** 3.0.0  
> **Status:** Planning  
> **Author:** Thomas (Solo Founder)  
> **Last Updated:** 2026-04-26  
> **Source Codebase:** https://github.com/binhvu284/oneapp-2.6.8  
> **Current Live App:** https://oneapp-2.vercel.app  

---

## 0. Context for AI Agents

This document is the **single source of truth** for developing OneApp 3. Before touching any code, read this entire document. Key things to understand:

- OneApp is a **personal productivity OS** built by and for a solo founder/PM. It is not a generic SaaS product — every decision is filtered through what serves Thomas's specific workflow.
- The codebase already exists at v2.6.8. OneApp 3 is an **upgrade**, not a rewrite. Preserve existing patterns unless explicitly told to change them.
- **Always use `useAuthSource()`** — never `useAuth()`. Auth uses `oneapp_users` table, not Supabase's `auth.users`.
- **Always use Data Layer hooks** — `useDataQuery`, `useDataInsert` from `@/lib/data-layer`.
- **Never hardcode colors** — use semantic HSL tokens from `index.css` and `tailwind.config.ts`.
- The codebase uses: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Supabase, Framer Motion, anime.js, react-grid-layout, react-router-dom v6.

---

## 1. Product Overview

### 1.1 Vision

OneApp 3 is the **Founder's OS** — a hyper-personalized workspace built around one person's complete workflow. Not built for everyone. Built for Thomas. That specificity is the product's core competitive advantage over generic tools like Notion or Obsidian.

**North star:** Make every daily task faster, every decision better-documented, every tool accessible without switching context.

### 1.2 Design Philosophy

| Principle | Description |
|-----------|-------------|
| **High-tech minimal** | Dense information, clean surfaces, nothing decorative that isn't functional |
| **Cinematic motion** | Deliberate, slow reveals. Every entrance earns its moment. Built on Framer Motion + anime.js |
| **Neumorphic dark** | Soft embossed surfaces on dark backgrounds. Cards feel physically pressable |
| **Micro-interactions** | Every click, hover, and state change has a satisfying physical response |
| **Personalization-first** | User-defined accent colors, 6+ theme presets, module-level customization |

### 1.3 Tech Stack (inherited + extended)

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui, CSS custom properties |
| Animation | Framer Motion (upgrade), anime.js (micro-interactions) |
| State | TanStack Query v5, React Context |
| Routing | react-router-dom v6 |
| Backend | Supabase (PostgreSQL + Edge Functions + Realtime) |
| Auth | OneApp Custom Auth (`oneapp_users` table, JWT in localStorage) |
| Dashboard | react-grid-layout v2 |
| DB Layer | DatabaseProvider abstraction (new in v3) |
| Firebase | Firebase SDK (new in v3, second DB provider) |
| AI | Anthropic API (claude-sonnet), ElevenLabs (voice) |
| Dev Tools | Octokit (GitHub API), Vercel API |
| Testing | Vitest (target: 60%+ coverage) |
| Deployment | Vercel |

### 1.4 User Roles

| Role | Level | Description |
|------|-------|-------------|
| General Admin | 1 | Full system access, manages all users, roles, permissions, system settings |
| Developer | 2 | Access to OneCommand, data tools, developer workspace, system logs |
| Partner | 3 | Role-default permissions + per-user overrides. Optional expiry date |
| Customer | 4 | Self-service when admin opens signup. Freemium base. Billing in OneApp 4 |

---

## 2. Development Phases Overview

OneApp 3 is built in **8 sequential phases**. Each phase is independently shippable.

| Phase | Name | Type | Duration |
|-------|------|------|----------|
| P1 | OneNote 3.0 | Core upgrade | 5–7 weeks |
| P2 | OneCommand | New module | 4–5 weeks |
| P3 | OneAI 3.0 | Deep upgrade | 4–6 weeks |
| P4 | Interface 3.0 | New phase | 5–6 weeks |
| P5 | Website 3.0 | New phase | 4–5 weeks |
| P6 | User Hierarchy 3.0 | Complete rebuild | 4–5 weeks |
| P7 | OneApp Data 3.0 | Deep upgrade | 4–5 weeks |
| P8 | OneCrypto 3.0 + Polish | Upgrade + debt | 3–4 weeks |

**Total estimated: 33–43 weeks (solo builder)**

---

## 3. Phase 1 — OneNote 3.0: Your Actual Second Brain

### 3.1 Goal

Transform OneNote from a generic note-taking module into a founder-specific thinking system. Power of Notion/Obsidian, zero of their genericism.

### 3.2 Current State

- Dual Mode: Simple Mode + Pro Mode (block editor)
- Block types: Paragraph, Heading (h1–h3), Bullet/Numbered List, Checklist, Quote, Code, Divider
- Slash command menu (`/` to insert blocks)
- Floating toolbar for inline formatting
- Drag-and-drop block reordering
- Task system with sub-tasks (1-level nesting)
- Tag system, color coding, auto-save
- Export as Markdown
- Folder system with CRUD

### 3.3 Features to Build

#### F1.1 — Founder-Mode Block Types
New custom block types inserted via slash command:

- **Idea Block** — fields: hypothesis, validation_status (untested/validated/invalidated), confidence (1–5). Renders as a distinctive card with status color ring.
- **Decision Log Block** — fields: decision (text), reasoning (text), date (auto), outcome (pending/good/bad retrospectively). Immutable after 24h (prevents revisionism).
- **Mood/Energy Block** — fields: energy (1–5 slider), mood (emoji select), note (optional). Renders inline, feeds the morning briefing and mood-to-task routing system.
- **Sprint Block** — a mini kanban inside a note. Columns: Todo, In Progress, Done. Drag cards between columns. Max 10 cards per Sprint Block.

All new block types must be stored as JSON in `notes.content` consistent with existing block schema.

#### F1.2 — Bi-Directional Note Linking
- Syntax: `[[note title]]` anywhere in any block triggers a link
- Autocomplete dropdown shows matching note titles as user types
- Rendered as a styled inline link chip with note icon
- **Backlinks panel**: new sidebar section below folder tree showing every note that links to the current note
- New DB table: `note_links (id, source_note_id, target_note_id, created_at)`
- RLS: users can only read/write links for their own notes

#### F1.3 — Daily Briefing Note
- Automatically created each day at first login (or via cron edge function)
- Auto-populated with:
  - Tasks due today (from `note_items` where `due_date = today` and `is_completed = false`)
  - Open Decision Log blocks from last 7 days where `outcome = pending`
  - Yesterday's Mood/Energy block summary
  - Unfinished Idea blocks (validation_status = untested, older than 3 days)
  - Bookmarked notes (new `is_bookmarked` boolean column on `notes`)
- Opens automatically on dashboard load if not yet viewed today
- Stored as a regular note with `note_type = 'daily_briefing'` and `note_date = today`
- Edge function: `daily-briefing` — generates content server-side, called on login or via cron

#### F1.4 — Inline AI Co-Writer (Cmd+J)
- Keyboard shortcut `Cmd+J` (or `Ctrl+J`) opens AI panel anchored to current block
- AI receives: current block content + 3 blocks above + 3 blocks below as context
- Available AI actions: Continue writing, Summarize this section, Generate ideas, Fix grammar, Translate to English/Vietnamese
- Response streams into a preview panel; user clicks "Insert" to add as new block(s)
- Uses Anthropic API via existing `ai-chat` edge function pattern
- API key comes from user's `user_api_keys` table

#### F1.5 — Personal Templates Engine
- New route: `/apps/onenote/templates`
- Admin/Developer can create system templates; any user can create personal templates
- Template structure: name, description, icon, block_content (JSON array of blocks with placeholder tokens like `{{date}}`, `{{project_name}}`)
- Apply template: dropdown in "New Note" creation flow
- DB table: `note_templates` (already exists in schema — implement the UI)
- Template tokens auto-populated on creation: `{{date}}` → today, `{{week}}` → current week number

### 3.4 DB Changes

```sql
-- New table
CREATE TABLE note_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_note_id uuid REFERENCES notes(id) ON DELETE CASCADE,
  target_note_id uuid REFERENCES notes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_note_id, target_note_id)
);

-- New columns on notes
ALTER TABLE notes ADD COLUMN is_bookmarked boolean DEFAULT false;
ALTER TABLE notes ADD COLUMN note_date date; -- for daily briefing
```

### 3.5 Surprise Features (P1)

- **Smart note aging**: A background job checks notes untouched for 30 days. Adds a subtle "revisit?" indicator on the note card. Cleared when user opens the note.
- **Mood-to-task routing**: On dashboard load, reads today's Mood/Energy block. If energy ≤ 2, surfaces only tasks tagged `low-energy`. If energy ≥ 4, surfaces `deep-work` tasks. Tag system extended with `energy_level` metadata.

---

## 4. Phase 2 — OneCommand: Founder's Control Center

### 4.1 Goal

Eliminate context switching between GitHub, Vercel, and Supabase. Everything accessible from one panel without leaving OneApp.

### 4.2 New Route

`/apps/onecommand` — accessible to Developer and Admin roles only (permission: `use_onecommand`)

### 4.3 Features to Build

#### F2.1 — GitHub Integration Panel
- Connect via Personal Access Token (stored encrypted in `user_api_keys`, type: `github`)
- Shows: open PRs (title, author, status, CI checks), recent commits (last 10), failed checks
- Actions: merge PR, create branch, view diff (opens GitHub in new tab)
- Uses Octokit.js via edge function `github-proxy` (never expose PAT to client)
- Polling interval: 60s, or manual refresh button

#### F2.2 — Vercel Live Deployment View
- Connect via Vercel API token (stored encrypted in `user_api_keys`, type: `vercel`)
- Shows: current deployment status, build progress (streamed logs), preview URL, last deploy time
- Actions: one-click rollback to previous deployment
- Edge function: `vercel-proxy` streams Vercel API responses
- Deployment status badge: queued / building / ready / error — with color coding

#### F2.3 — Supabase Quick Query Runner
- Uses existing system connection credentials (already in `system_connection` table)
- Lightweight SQL input textarea with syntax highlighting (CodeMirror lite or existing `react-syntax-highlighter`)
- Results rendered as a clean responsive table with column types inferred
- Query history: last 20 queries stored in localStorage with timestamps
- Safety: only SELECT queries by default; toggle to allow mutations (with confirmation dialog)
- Edge function: `quick-query` — validates SQL, executes via service key, returns results

#### F2.4 — Unified Project Status Dashboard
- Default view of `/apps/onecommand`
- One card per connected project showing:
  - Last deploy status + time ago
  - Open GitHub issues count
  - Supabase DB size (from health monitor)
  - Pending tasks from OneNote linked to this project
- Projects configured in OneCommand settings (name, GitHub repo, Vercel project ID)

#### F2.5 — Supercharged Global Command Palette (Cmd+K)

Upgrade the existing `GlobalCommandMenu.tsx` (uses `cmdk`):

| Command | Action |
|---------|--------|
| `note: <title>` | Create new note with title |
| `task: <text>` | Create new task |
| `deploy` | Trigger Vercel redeploy |
| `query: <sql>` | Open quick query runner with SQL pre-filled |
| `pr` | Open GitHub PRs panel |
| `switch db` | Open DB provider switcher |
| `backup` | Trigger full database backup |
| Search anything | Searches notes, tasks, and command history |

### 4.4 DB Changes

```sql
-- Store integration connections per user
CREATE TABLE onecommand_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES oneapp_users(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'github' | 'vercel'
  project_name text,
  github_repo text, -- e.g. 'binhvu284/oneapp-3'
  vercel_project_id text,
  created_at timestamptz DEFAULT now()
);
```

---

## 5. Phase 3 — OneAI 3.0: AI That Knows You

### 5.1 Goal

Transform OneAI from a generic chat interface into a context-aware thinking partner that reads your workspace and acts on it.

### 5.2 Current State

- AI chat interface with conversations + messages tables
- Multi-model support via `user_api_keys`
- Basic markdown + code block rendering
- Conversation sidebar

### 5.3 Features to Build

#### F3.1 — Project-Aware Memory (RAG on Notes)
- Before each AI response, inject context: last 5 notes modified, today's tasks, today's briefing note, open decisions
- Implement as a system prompt builder that queries user's data server-side before calling Anthropic
- Memory stored in `ai_agent_memory` table (already exists) — structured as key/value pairs per user
- Context injection edge function: `build-ai-context` — called before every chat message

#### F3.2 — Contextual Actions from Chat
- AI can return structured action payloads alongside text responses
- Supported actions:
  - `create_note` — creates a note with AI-suggested title + content
  - `create_task` — creates a task in OneNote
  - `trigger_deploy` — calls Vercel API via OneCommand
  - `run_query` — executes a SQL query via quick-query edge function
- Action cards render below AI response text; user clicks to execute
- Uses Anthropic tool-use / function calling API

#### F3.3 — Morning AI Briefing
- Runs daily at login (or configurable time via user settings)
- Generates a plain-language 3–5 sentence briefing: tasks due, deploy status, unread decisions, suggested priority
- Displayed as a special AI conversation type `briefing` at top of conversation sidebar
- Fetches data from: `note_items` (due today), last Vercel deployment status, `notes` (open decision logs)

#### F3.4 — Voice Input (ElevenLabs)
- Microphone button in AI chat input area
- Records audio, sends to ElevenLabs Speech-to-Text API
- Transcribed text populates the message input field
- User reviews and sends (not auto-send)
- ElevenLabs API key stored in `user_api_keys` (type: `elevenlabs`)
- The logo asset `/public/logos/elevenlabs.png` already exists — use it in the UI

### 5.4 DB Changes

No new tables. Uses existing `ai_agent_memory`, `ai_conversations`, `ai_messages`.

New columns:
```sql
ALTER TABLE ai_conversations ADD COLUMN conversation_type text DEFAULT 'chat'; 
-- values: 'chat' | 'briefing' | 'inline' (for Cmd+J)
ALTER TABLE ai_conversations ADD COLUMN context_snapshot jsonb; 
-- stores the context injected at conversation start
```

---

## 6. Phase 4 — Interface 3.0: The Physical Workspace

### 6.1 Goal

Give OneApp a completely unique visual identity: high-tech minimal with neumorphic dark aesthetics, cinematic transitions, and micro-interactions so satisfying that every click feels physical.

### 6.2 Design Language

**Neumorphic dark**: Soft embossed surfaces on dark backgrounds. Cards have dual box shadows — a lighter shadow top-left (highlight) and a darker shadow bottom-right (depth). On press: shadows invert (inner shadow), creating a tactile "pressed" feel.

```css
/* Neumorphic card — light state */
.neu-card {
  background: var(--neu-surface);
  box-shadow: 
    6px 6px 12px var(--neu-shadow-dark),
    -6px -6px 12px var(--neu-shadow-light);
  border-radius: 12px;
}

/* Neumorphic card — pressed state */
.neu-card:active {
  box-shadow: 
    inset 4px 4px 8px var(--neu-shadow-dark),
    inset -4px -4px 8px var(--neu-shadow-light);
}
```

**Accent color system**: Single user-defined accent color propagated via CSS custom property `--accent-hue`. All accent usages derive from this single hue using HSL variations.

**Cinematic timing**: All transitions use `cubic-bezier(0.16, 1, 0.3, 1)` (expo out). Module switches: 400ms. Page loads: staggered 80ms delays per element. Micro-interactions: 120–200ms.

### 6.3 Features to Build

#### F4.1 — Neumorphic Design System
- New CSS token layer added to `index.css`: `--neu-surface`, `--neu-shadow-dark`, `--neu-shadow-light` — all derived from current `--background` HSL value
- Updated base components in `components/ui/`: Card, Button, Switch, Input, Select all get neumorphic variants
- Neumorphic variant opt-in via `variant="neu"` prop — keeps existing variants intact

#### F4.2 — Micro-Interaction Library
Built with Framer Motion (already installed). Key interactions:

| Element | Interaction |
|---------|-------------|
| Buttons | Press: scale(0.96) + shadow invert over 120ms |
| Checkboxes | Check: SVG path draws itself (stroke animation 200ms) |
| Toggle switches | Physical slide with momentum overshoot |
| Sidebar items | Hover: subtle left-border reveal + background lighten |
| Cards | Hover: 2px lift via translateY(-2px) + shadow increase |
| Dropdowns | Open: staggered items fade+slide in 40ms apart |
| Toast notifications | Slide in from right with spring physics |

#### F4.3 — Cinematic Transition System
- Module switches: current page fades out (200ms), new page slides up from y+20px and fades in (400ms)
- Login entrance: logo assembles from pieces (anime.js), then content stagger-reveals
- Deploy success: full-screen overlay with animated success state (3s), then dismisses
- Route change progress bar: thin accent-colored bar at top of screen during navigation

#### F4.4 — Canvas Dashboard 3.0
Built on existing `react-grid-layout`. New widget types (add to widget registry):

| Widget | Description |
|--------|-------------|
| `DeployStatusWidget` | Shows last 3 deploys, current status, time ago |
| `AIBriefingWidget` | Today's AI briefing card, refreshable |
| `NoteGraphWidget` | Mini visualization of note connection graph |
| `TaskBurndownWidget` | Tasks completed vs. remaining this week |
| `DBHealthWidget` | Provider name, connection status, DB size, last backup |
| `AdminPulseWidget` | New signups today, active sessions, suspicious logins |
| `CryptoPulseWidget` | Portfolio value, 24h change, top mover |

Widgets animate into position on drag-drop with spring physics. Magnetic snap alignment on drop.

#### F4.5 — OneApp Theme Engine
New route: `/settings/appearance/themes`

| Theme | Base | Accent |
|-------|------|--------|
| Midnight | #0a0a0a | Cyan (#00F0FF) — current default |
| Carbon | #111111 | White (#FFFFFF) |
| Slate | #0f172a | Blue (#3B82F6) |
| Arctic | #f8fafc | Blue (#1D4ED8) — light mode |
| Sand | #faf8f4 | Amber (#D97706) — light mode |
| Obsidian | #1a1a2e | Purple (#7C3AED) |

User can also: pick any custom accent hue via color wheel. All module accent colors derive from user's chosen hue.

#### F4.6 — Sidebar 3.0

Keep existing sidebar structure. Add:
- **Mini activity feed**: last 5 events (note saved, deploy triggered, task completed) — appears in a collapsible section at bottom of sidebar
- **Pinnable quick-actions**: each module can expose 1–3 quick actions pinned to sidebar (e.g., OneNote: "New Note", OneCommand: "Trigger Deploy")
- **System pulse strip**: very bottom of sidebar — 3 dots: DB status (green/red), last deploy status (green/red), AI connection (green/red)

### 6.4 DB Changes

```sql
ALTER TABLE user_settings ADD COLUMN theme_preset text DEFAULT 'midnight';
ALTER TABLE user_settings ADD COLUMN accent_hue integer DEFAULT 186; -- 186 = cyan
ALTER TABLE user_settings ADD COLUMN sidebar_pinned_actions jsonb DEFAULT '[]';
```

---

## 7. Phase 5 — Website 3.0: A Product Worth Showing

### 7.1 Goal

Upgrade the public-facing website from "beautiful but abstract" to "beautiful and clearly a real product." Add missing pages that make OneApp look professionally maintained.

### 7.2 Current State (OneApp 2)

Existing pages:
- `/explore` — hero + constellation + orbit + stats + features grid + navigation cards
- `/ecosystem` (Features) — placeholder
- `/journey` (About) — placeholder
- `/forum` (Community) — placeholder

### 7.3 Upgraded Pages

#### Explore Page — Major Upgrade
- **Counter preloader**: upgrade to more cinematic reveal — numbers accelerate then dramatically pause at final value with a flash
- **Hero section**: "ONE SYSTEM / INFINITE CONTROL" headline → word-by-word staggered entrance (each word animates in with 80ms delay). Add 3D perspective dashboard mockup below headline.
- **3D Dashboard Mockup**: CSS `perspective` + `rotateX(15deg) rotateY(-5deg)` applied to a screenshot of the OneApp 3 dashboard. Subtly rotates on mouse move (parallax, ±3deg). Animates in with a dramatic entrance on scroll trigger.
- **GradientBlobs**: make reactive to cursor position — blobs slowly drift toward cursor using `mousemove` event + Framer Motion spring
- **Scroll storytelling**: add a side progress indicator (thin vertical line on right edge) that fills as user scrolls. Each section is a named chapter. Chapter names appear as tiny labels beside the progress line.
- **Constellation section**: add parallax depth — hub moves at 0.3x scroll speed, value nodes at 0.15x, creating a sense of 3D depth

#### Ecosystem Page — Rebuild
- Interactive module cards: each OneApp 3 module (OneNote, OneCommand, OneAI, OneCrypto, OneApp Data) gets a card with animated icon and one-line description
- Hover reveals a mini-preview screenshot of that module
- "Live" badge on active modules, "Coming Soon" on planned ones

#### Journey Page — Scroll-driven timeline
- Vertical timeline of OneApp versions: v1 → v2 → v3
- Each milestone has date, headline, key features, and a small screenshot
- Scroll-triggered animations: timeline line draws as you scroll down

### 7.4 New Pages

#### `/docs` — Documentation & Getting Started
- Searchable (client-side with fuzzy search)
- Sections: Getting Started, Authentication, Modules (OneNote, OneCrypto, OneAI, OneCommand, OneApp Data), User Roles, API Reference
- Code blocks with copy button and syntax highlighting
- Table of contents with scroll-spy active state
- Content lives in `src/data/docsContent.ts` (already partially exists — extend it)

#### `/changelog` — Version History
- Parses and renders a structured version of `CHANGELOG.md`
- Each version is a card with: version number badge, date, Added/Changed/Fixed sections
- Latest version has a "Current" badge
- Cinematic entrance: cards reveal from bottom as user scrolls
- Animated number counter showing total versions, total features shipped

#### `/pricing` — Freemium Tiers
- Three tier cards: Free, Pro (placeholder price), Enterprise (contact)
- Feature comparison list per tier
- "Free" tier clearly shows what's available now
- Pro/Enterprise tiers have "Coming Soon" overlays (not yet purchasable)
- Cinematic hover: card scales up 1.02x, border glows with accent color

### 7.5 Technical Upgrades

- **Performance**: All heavy sections (`ParticleBackground`, `DynamicNeonPaths`, `EcosystemOrbitSection`) lazy-loaded behind `IntersectionObserver`. Target: Lighthouse 90+ mobile, FCP < 1.2s.
- **Mobile-first**: Orbital ecosystem section → swipeable card carousel on mobile (Embla Carousel, already installed). All animations respect `prefers-reduced-motion`.
- **SEO**: Unique `<meta>` title, description, and OG image per page. Canonical URLs. Structured data (JSON-LD) on homepage.
- **Easter egg**: A hidden keyboard sequence on the Explore page triggers a special animation — known only to the founder. (Implementation: Konami code variant, triggers a private "signature" animation using existing anime.js constellation system.)

---

## 8. Phase 6 — User Hierarchy 3.0: Complete Access System

### 8.1 Goal

Complete the MVP user hierarchy into a production-ready role + permission system. All 4 user roles fully functional with granular per-user control.

### 8.2 Current State

- `oneapp_users` table with `level` column (1–4)
- `user_roles` and `role_permissions` tables
- `PermissionMatrix` component with 7 categories, ~20 toggles
- `SystemAdmin` page with tabs: Users, Security, Playground
- Partner keys + verified emails systems (functional)
- `UserDetailDialog` with fullscreen mode (profile + permissions + sessions tabs)

### 8.3 Permission Matrix — Expanded

Current 7 categories → 12+ categories. Add:

| New Category | Permissions |
|-------------|-------------|
| OneNote | `use_onenote`, `create_notes`, `delete_notes`, `export_notes`, `use_templates` |
| OneCommand | `use_onecommand`, `trigger_deploys`, `run_queries`, `manage_integrations` |
| OneAI | `use_ai_chat`, `use_voice_input`, `use_inline_ai`, `manage_ai_keys` |
| OneApp Data | `view_db_health`, `create_backups`, `restore_backups`, `switch_providers`, `run_migrations` |
| Webhooks | `create_webhooks`, `manage_webhooks` |

### 8.4 Per-User Permission Overrides

- Role sets the **floor** (default permissions)
- Admin can override any individual permission per user in `UserPermissionsTab`
- Override stored in new `user_permission_overrides` table
- Overridden permissions show a `⚡ override` badge in the permission matrix UI
- Permission resolution order: user override > role permission

```sql
CREATE TABLE user_permission_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES oneapp_users(id) ON DELETE CASCADE,
  permission text NOT NULL,
  granted boolean NOT NULL,
  overridden_by uuid REFERENCES oneapp_users(id),
  overridden_at timestamptz DEFAULT now(),
  UNIQUE(user_id, permission)
);
```

### 8.5 Role Transition Engine

When admin changes a user's role via command card:
1. Show a diff dialog: "These permissions will be added: [...] These will be removed: [...]"
2. On confirm: update `user_roles`, delete user's `user_permission_overrides`, log to `role_transition_log`, revoke all active sessions (force re-login)
3. New edge function: `role-transition` handles atomically

```sql
CREATE TABLE role_transition_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES oneapp_users(id),
  from_role text,
  to_role text,
  transitioned_by uuid REFERENCES oneapp_users(id),
  transitioned_at timestamptz DEFAULT now(),
  reason text
);
```

### 8.6 Partner Onboarding — Two Paths

**Path A: Partner Key**
- Admin generates key in `PartnerKeysManager` (already exists)
- Partner visits `/auth/signup/partner/key`, enters key
- Key validated, partner completes registration
- Key marked as used, `usage_count` incremented

**Path B: Email Waitlist**
- Admin adds email to `verified_emails` table (already exists)
- Partner visits `/auth/signup/partner/email`, enters email
- System checks `verified_emails`, allows registration if matched
- Email marked as used

**Partner-specific account settings:**
- Optional `expires_at` date field on `oneapp_users` (new column)
- System cron checks expiry daily → auto-suspends expired partners → alerts admin 7 days before
- `is_suspended` boolean on `oneapp_users` (separate from `is_active`)

### 8.7 Customer Signup Toggle

New setting in System Admin → Security tab:
- Toggle: "Allow public customer registration" (stored in `system_connection` or new `system_settings` table)
- When ON: `/auth/signup/customer` route is accessible, free tier self-registration enabled
- When OFF: route returns 404 or "Registration closed" page

### 8.8 Freemium DB Foundation

```sql
-- Add to oneapp_users
ALTER TABLE oneapp_users ADD COLUMN customer_tier text DEFAULT 'free'; 
  -- values: 'free' | 'pro' | 'enterprise'
ALTER TABLE oneapp_users ADD COLUMN tier_expires_at timestamptz;
ALTER TABLE oneapp_users ADD COLUMN tier_feature_flags jsonb DEFAULT '{}';
ALTER TABLE oneapp_users ADD COLUMN expires_at timestamptz; -- for partner expiry
ALTER TABLE oneapp_users ADD COLUMN is_suspended boolean DEFAULT false;
```

### 8.9 Admin UX — Command Card

Each user in the list view shows a command card:

```
┌─────────────────────────────────────────────────┐
│ [Avatar + status ring]  Thomas Vu               │
│                         thomas@example.com       │
│ [●●●●○] Access: 80%    [Developer] [● Active]   │
├─────────────────────────────────────────────────┤
│ [View Details] [Edit Permissions] [Change Role]  │
│ [Suspend]                          [··· More]    │
└─────────────────────────────────────────────────┘
```

- **Status ring**: green = active, yellow = suspended, grey = inactive, red = banned
- **Access bar**: 0–100% based on permissions enabled vs total available
- **Role badge color**: Admin=red, Developer=blue, Partner=purple, Customer=teal

### 8.10 Full Audit Trail

`UserDetailDialog` gets a 4th tab: **Activity**

Shows three data streams:
1. **Login history**: timestamp, device info, IP address, session duration (from `user_sessions`)
2. **Feature usage**: module name, access count, last accessed (from `user_feature_usage`)
3. **Action log**: action type, target, timestamp (from `user_action_log`)

```sql
CREATE TABLE user_feature_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES oneapp_users(id) ON DELETE CASCADE,
  module text NOT NULL, -- 'onenote' | 'onecrypto' | 'oneai' | 'onecommand' | etc.
  access_count integer DEFAULT 1,
  last_accessed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module)
);

CREATE TABLE user_action_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES oneapp_users(id) ON DELETE CASCADE,
  action text NOT NULL, -- 'created_note' | 'triggered_deploy' | 'ran_query' | etc.
  target_id text, -- id of affected resource
  target_type text, -- 'note' | 'deployment' | 'query' | etc.
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
```

### 8.11 Real-Time Admin Dashboard Widget

`AdminPulseWidget` on canvas dashboard:
- New signups today (count)
- Active sessions right now (count, from `user_sessions` where `expires_at > now()`)
- Suspicious logins (failed login attempts in last 1h — from rate limiting logs)
- Uses Supabase Realtime subscription for live updates

---

## 9. Phase 7 — OneApp Data 3.0: Flexible Database Layer

### 9.1 Goal

Give OneApp a portable, provider-agnostic data layer. Admin can switch database providers, back up all data in multiple formats, and monitor database health in real-time.

### 9.2 Current State

- `system_connection` table + edge functions for Supabase system connection
- `external_connections` table for per-user external Supabase connections
- `DataBackupPanel`: JSON download/restore (localStorage history)
- `DataExportPanel`: per-table CSV/JSON export
- `SchemaSyncPanel`: manual schema compare + apply
- `DatabaseProvider` interface stubbed in `DevelopingData.tsx` (Firebase, Neon mentioned)

### 9.3 Provider Abstraction Layer

Define a clean TypeScript interface that all database adapters must implement:

```typescript
// src/lib/db-providers/types.ts
interface DatabaseProvider {
  id: string;
  name: string;
  type: 'supabase' | 'firebase' | 'neon' | 'custom';
  
  connect(credentials: ProviderCredentials): Promise<ConnectionResult>;
  disconnect(): Promise<void>;
  testConnection(): Promise<{ success: boolean; latency: number; error?: string }>;
  
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  insert(table: string, data: Record<string, unknown>): Promise<{ id: string }>;
  update(table: string, id: string, data: Record<string, unknown>): Promise<void>;
  delete(table: string, id: string): Promise<void>;
  
  getSchema(): Promise<SchemaInfo>;
  applyMigration(sql: string): Promise<void>;
  
  exportData(tables: string[], format: 'json' | 'sql' | 'csv'): Promise<ExportResult>;
  importData(data: BackupData): Promise<ImportResult>;
  
  getStats(): Promise<DBStats>; // tables, rows, size, latency
}
```

**Supabase adapter**: refactor existing connection logic into this interface.

**Firebase adapter**: maps OneApp relational tables to Firestore collections. Document structure per table:
- `oneapp_users` → `/users/{id}` collection
- `notes` → `/notes/{id}` collection, with `userId` field for filtering
- All FK relationships denormalized into document fields
- Queries translated from SQL semantics to Firestore `.where()` chains
- Limitations documented: no JOINs, no SQL aggregations (workaround via client-side processing)

### 9.4 Scope: OneApp 3 vs Future

**OneApp 3 — Build Now:**

| Feature | Description |
|---------|-------------|
| Provider abstraction interface | TypeScript interface + Supabase adapter refactor |
| Firebase adapter | Full Firestore implementation of the interface |
| Manual provider switch | Admin picks active provider in System Admin |
| Multi-format backup | JSON, SQL dump (.sql), CSV zip — selectable at backup time |
| Full backup | All tables, all data |
| Selective backup | Admin picks modules/tables to include |
| Scheduled auto-backup toggle | On/off + Daily/Weekly cadence via edge function cron |
| Improved restore | Upload backup file → preview contents → confirm → execute (with progress) |
| Live DB stats | Table count, row counts, estimated DB size, avg query latency |
| Health monitoring | Background ping every 60s, alerts on unreachable / slow / 90%+ full |
| All-channel alerts | In-app toast + canvas widget turns red + optional email |
| Auto-migrate schema | Detect drift vs `ONEAPP_SCHEMA_VERSION`, show diff, apply automatically |
| DB Health canvas widget | Live stats card in Canvas Dashboard 3.0 |
| Backup history (server-side) | Replace localStorage history with `backup_history` table |

**OneApp 4+ — Future Scope (do NOT build now):**

| Feature | Why deferred |
|---------|-------------|
| Cross-provider migration (Supabase → Firebase) | Requires battle-tested adapters on both sides first |
| Third+ provider adapters (Neon, PlanetScale, Turso) | Address after Firebase adapter proves the abstraction |
| Live mirror / real-time sync between providers | Complex consistency guarantees, out of solo scope |
| Full DB explorer (browse tables, preview rows) | Nice-to-have, use Supabase dashboard for now |
| Incremental backup (delta-only) | Full backup is sufficient for current data volumes |
| Cloud backup storage (S3/GCS) | Download-to-local is sufficient for now |
| Per-module DB routing | Unnecessary complexity at current scale |

### 9.5 Multi-Format Backup System

Backup creation flow:
1. Admin opens backup panel → selects format (JSON / SQL dump / CSV zip)
2. Selects scope: Full backup OR selective (checkboxes per module group)
3. Clicks "Create Backup" → progress bar per table
4. File auto-downloads; entry saved to `backup_history` table

**JSON format** (existing, improved):
```json
{
  "version": "3.0",
  "oneapp_version": "3.0.0",
  "provider": "supabase",
  "created_at": "2026-04-26T...",
  "tables": ["oneapp_users", "notes", ...],
  "total_rows": 1234,
  "data": { "oneapp_users": [...], "notes": [...] }
}
```

**SQL dump format**: Standard `INSERT INTO` statements with `ON CONFLICT DO UPDATE` for safe restore. Includes `CREATE TABLE IF NOT EXISTS` statements for empty DB seeding.

**CSV zip format**: One `.csv` file per table, plus a `manifest.json` with metadata.

### 9.6 Scheduled Auto-Backup

```sql
CREATE TABLE backup_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean DEFAULT false,
  cadence text DEFAULT 'weekly', -- 'daily' | 'weekly'
  format text DEFAULT 'json',
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE backup_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  format text NOT NULL,
  total_rows integer,
  size_kb real,
  tables text[],
  provider text,
  status text DEFAULT 'completed', -- 'completed' | 'failed'
  error_message text,
  created_at timestamptz DEFAULT now()
);
```

Edge function `scheduled-backup` runs on cron, creates backup, stores metadata in `backup_history`, emails download link if email alert enabled.

### 9.7 Health Monitoring

Edge function `health-check` runs every 60 seconds (via Supabase cron):
- Pings active provider with a simple `SELECT 1` query
- Measures latency
- Checks DB size (via `pg_database_size()` for Supabase, collection size for Firebase)
- Stores result in `db_health_log`

Alert thresholds (configurable in settings):
- Unreachable: immediate critical alert
- Latency > 2000ms: warning alert
- DB size > 90% of estimated limit: critical alert

```sql
CREATE TABLE db_health_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  status text NOT NULL, -- 'healthy' | 'warning' | 'critical' | 'unreachable'
  latency_ms integer,
  db_size_mb real,
  checked_at timestamptz DEFAULT now()
);

CREATE TABLE db_alert_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  latency_threshold_ms integer DEFAULT 2000,
  size_warning_percent integer DEFAULT 90,
  email_alerts_enabled boolean DEFAULT false,
  alert_email text,
  updated_at timestamptz DEFAULT now()
);
```

### 9.8 Auto-Migrate Schema

Replaces manual `SchemaSyncPanel`. New flow:

1. On provider connect or manual trigger: `auto-migrate` edge function runs
2. Fetches live schema from connected DB
3. Compares against `ONEAPP_SCHEMA_VERSION` definition in `src/lib/data-layer/schema.ts`
4. Generates migration plan: list of `ALTER TABLE ADD COLUMN` and `CREATE TABLE` statements
5. Shows diff UI: green = tables/columns to add, grey = already exists, red = schema conflicts
6. **Never destructive by default**: no `DROP` statements without explicit admin confirmation
7. Admin clicks "Apply Migration" → executes statements sequentially with progress
8. Migration logged to `migration_log` table

```sql
CREATE TABLE migration_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schema_version text,
  provider text,
  statements_count integer,
  applied_at timestamptz DEFAULT now(),
  applied_by uuid REFERENCES oneapp_users(id),
  success boolean,
  error_message text
);
```

### 9.9 New Edge Functions

| Function | Purpose |
|----------|---------|
| `health-check` | 60s cron ping, writes to `db_health_log`, triggers alerts |
| `scheduled-backup` | Cron backup execution, writes to `backup_history` |
| `auto-migrate` | Schema diff + migration application |
| `firebase-proxy` | All Firebase read/write operations (keeps credentials server-side) |
| `provider-switch` | Atomic provider switching with validation |

---

## 10. Phase 8 — OneCrypto 3.0 + Foundation Polish

### 10.1 OneCrypto Upgrades

#### F8.1 — AI Crypto Analyst
- New tab in OneCrypto: "AI Analysis"
- User asks "What's my portfolio doing?" → AI reads `crypto_holdings`, `crypto_transactions`, latest prices from `crypto-prices` edge function → generates plain-language summary
- Weekly portfolio performance narrative (auto-generated, stored as a `briefing` conversation)

#### F8.2 — Price Alerts
- New UI in OneCrypto: "Alerts" section
- Per-asset: set price threshold (above/below) + notification method
- Alert checks run via `crypto-prices` edge function (already exists, enhance with alert logic)
- Notification: browser push notification (Web Push API) + in-app toast

```sql
CREATE TABLE crypto_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES oneapp_users(id) ON DELETE CASCADE,
  asset_symbol text NOT NULL,
  condition text NOT NULL, -- 'above' | 'below'
  threshold_usd numeric NOT NULL,
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

#### F8.3 — Performance vs Benchmark
- New chart in portfolio overview: line chart comparing portfolio value vs BTC, ETH, S&P 500
- Uses `recharts` (already installed) — `ComposedChart` with multiple lines
- Benchmark data fetched from free public APIs via edge function proxy

### 10.2 Foundation Polish

| Area | Work |
|------|------|
| TanStack Query | Complete migration — remove all bare `useEffect` fetch patterns |
| Memory leaks | Audit `DashboardGrid` and `AIChat` for missed cleanup |
| API key encryption | AES-256 encryption for all `user_api_keys` values at rest |
| Mobile pass | Full responsive audit across all modules |
| Test coverage | Vitest target: 60%+ coverage on hooks and utility functions |
| Error boundaries | Add React error boundaries to each module |
| Loading states | Skeleton screens for all data-dependent views |

---

## 11. Cross-Cutting Concerns

### 11.1 Surprise Features (build opportunistically)

| Feature | Phase | Description |
|---------|-------|-------------|
| Mood-to-task routing | P1 | Morning energy rating filters task list |
| Smart note aging | P1 | 30-day untouched notes get "revisit?" nudge |
| Slack bot | P2/P3 | Text bot to create notes, check deploys, get briefing |
| Founder's weekly review | P3 | AI Sunday recap: built, decided, felt |
| Website easter egg | P5 | Konami-code-style hidden animation on Explore page |
| DB Passport concept | P7 | Backup file = portable OneApp identity |
| Admin impersonation mode | P6 | Log in as any user to debug their experience |
| Ambient sound layer | P4 | Optional lo-fi sound tied to current module |

### 11.2 Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse (mobile) | 90+ |
| First Contentful Paint | < 1.2s |
| Time to Interactive | < 2.5s |
| Bundle size | < 500KB initial (lazy-load the rest) |
| DB query latency | < 200ms p95 |

### 11.3 Security Requirements

- All API keys in `user_api_keys` encrypted with AES-256 before storage
- No credentials ever logged or stored in localStorage
- Rate limiting on all auth endpoints (already partially implemented)
- Session revocation on role change (implemented in P6)
- `is_suspended` check on every authenticated request
- Firebase credentials stored server-side only (in `system_connection` equivalent for Firebase)

### 11.4 Development Rules for AI Agents

1. **Always read this document before writing any code**
2. **Authentication**: use `useAuthSource()` hook — never `useAuth()` or direct Supabase auth
3. **Data fetching**: use `useDataQuery` / `useDataInsert` from `@/lib/data-layer` — never raw `supabase.from()` in components
4. **Colors**: use semantic HSL tokens only — never hardcode `#hex` values
5. **Dropdowns**: always use `bg-popover border z-50` — never transparent backgrounds
6. **New tables**: always enable RLS and add appropriate policies
7. **Permissions**: before building any feature, check if it needs a permission gate (refer to P6 permission matrix)
8. **Animation**: use `anime.js` for new animated sections; Framer Motion for component-level interactions
9. **Never modify**: `src/integrations/supabase/types.ts` (auto-generated), `.env` (auto-managed)
10. **Profile data**: lives in `oneapp_users`, NOT `profiles` table
11. **Testing**: write Vitest tests for any new hook or utility function

---

## 12. Database Schema Summary (New Tables in OneApp 3)

| Table | Phase | Purpose |
|-------|-------|---------|
| `note_links` | P1 | Bi-directional note connections |
| `onecommand_integrations` | P2 | GitHub/Vercel project mappings per user |
| `user_permission_overrides` | P6 | Per-user permission exceptions |
| `role_transition_log` | P6 | Audit log of role changes |
| `user_feature_usage` | P6 | Module access tracking |
| `user_action_log` | P6 | Detailed action audit trail |
| `crypto_alerts` | P8 | Price alert configurations |
| `backup_history` | P7 | Server-side backup log |
| `backup_schedule` | P7 | Auto-backup configuration |
| `db_health_log` | P7 | Health monitoring time series |
| `db_alert_settings` | P7 | Alert thresholds and notification config |
| `migration_log` | P7 | Schema migration audit log |

New columns on existing tables — see individual phase sections above.

---

## 13. Routes Summary (New in OneApp 3)

| Route | Component | Phase | Access |
|-------|-----------|-------|--------|
| `/apps/onecommand` | OneCommand | P2 | Developer+ |
| `/apps/onecommand/settings` | OneCommandSettings | P2 | Developer+ |
| `/apps/onenote/templates` | NoteTemplates | P1 | All |
| `/settings/appearance/themes` | ThemeEngine | P4 | All |
| `/docs` | DocsPage | P5 | Public |
| `/changelog` | ChangelogPage | P5 | Public |
| `/pricing` | PricingPage | P5 | Public |
| `/auth/signup/customer` | CustomerSignup | P6 | Public (when enabled) |

---

*End of OneApp 3 PRD — last updated 2026-04-26*  
*This document should be updated whenever a phase is completed or scope changes.*
