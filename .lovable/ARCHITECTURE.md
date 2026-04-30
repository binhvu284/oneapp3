# OneApp 2 - Architecture Documentation

> **Last Updated:** 2026-02-12 (v2.9)
> **GitHub:** https://github.com/binhvu284/oneapp2

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        OneApp 2 Frontend                         │
│                    (React + TypeScript + Vite)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Pages      │  │  Components  │  │    Contexts/Hooks    │   │
│  │              │  │              │  │                      │   │
│  │  - Landing   │  │  - UI        │  │  - AuthSourceContext │   │
│  │  - Explore   │  │  - Layout    │  │  - DataSourceContext │   │
│  │  - Dashboard │  │  - Data      │  │  - useSystemConn     │   │
│  │  - Settings  │  │  - AI        │  │  - useTanstackQuery  │   │
│  │  - OneNote   │  │  - Explore   │  │  - useNotes          │   │
│  │  - AI Chat   │  │  - OneNote   │  │  - useNoteItems      │   │
│  │  - OneCrypto │  │  - Crypto    │  │  - useNoteFolders    │   │
│  │  - ForgotPwd │  │  - Profile   │  │  - useDataSourceProf │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Data Abstraction Layer                         │
│              Unified interface for all data sources              │
├─────────────────────────────────────────────────────────────────┤
│  DataSourceContext → AdapterRegistry → LovableAdapter |          │
│                                        ExternalSupabaseAdapter   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AuthSourceContext                            │
│         (OneApp Custom Auth - Independent System)                │
│  oneapp-auth Edge Function → oneapp_users Table                  │
│  Actions: signup, signin, validate, signout, refresh,            │
│           sync-to-lovable, get-user-roles, update-profile,       │
│           reset-password                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Architecture (OneApp Custom Auth)

### 2.1 Overview

OneApp 2 sử dụng **hệ thống xác thực độc lập** thay vì Supabase Auth:

- **Database:** Bảng `oneapp_users` chứa toàn bộ thông tin user (20 columns)
- **Password:** Hash bằng bcrypt
- **Token:** Custom JWT lưu trong localStorage (`oneapp_token`)
- **Session:** Bảng `user_sessions` để track sessions
- **Roles:** Bảng `user_roles` với enum `oneapp_role`

### 2.2 Authentication Flow

```
1. SIGNUP:         User → Signup Form → oneapp-auth (signup) → Hash password → Insert oneapp_users → Generate JWT
2. SIGNIN:         User → Login Form → oneapp-auth (signin) → Verify password → Update last_login_at → Generate JWT
3. VALIDATE:       App Init → Read token → oneapp-auth (validate) → Verify JWT → Return user data
4. SIGNOUT:        User → Logout → oneapp-auth (signout) → Invalidate session → Clear localStorage
5. RESET-PASSWORD: User → Forgot Password → oneapp-auth (reset-password) → Verify email → Hash new password → Update DB
6. UPDATE-PROFILE: User → Profile Settings → oneapp-auth (update-profile) → Update oneapp_users → Return safe user
```

### 2.3 Key Components

| Component | File | Purpose |
|-----------|------|---------|
| `AuthSourceContext` | `src/contexts/AuthSourceContext.tsx` | Provides unified auth API (signIn, signUp, signOut, user, updateUser) |
| `useAuthSource` | `src/hooks/useAuthSource.tsx` | Hook to consume auth context |
| `oneapp-auth` | `supabase/functions/oneapp-auth/` | Edge function for all auth operations |
| `ProtectedRoute` | `src/components/auth/ProtectedRoute.tsx` | Route guard |
| `useDataSourceProfile` | `src/hooks/useDataSourceProfile.tsx` | Profile CRUD via edge function |
| `ForgotPassword` | `src/pages/ForgotPassword.tsx` | Password reset page |

### 2.4 Role & Level System

| Role | Level | Description |
|------|-------|-------------|
| admin | 99 | Full system access |
| developer | 80 | Development features |
| business_partner | 50 | Business features |
| customer | 10 | Basic user access |
| default | 1 | New users |

---

## 3. Data Abstraction Layer

Unified interface for all data operations across Lovable Cloud and External Supabase.

| Component | File | Purpose |
|-----------|------|---------|
| `DataSourceContext` | `src/lib/data-layer/DataSourceContext.tsx` | Central context |
| `useDataQuery/Insert/Update/Delete` | `src/lib/data-layer/hooks.ts` | React Query hooks |
| `AdapterRegistry` | `src/lib/data-layer/registry.ts` | Adapter management |
| `LovableAdapter` | `src/lib/data-layer/adapters/lovable-adapter.ts` | Default adapter |
| `ExternalSupabaseAdapter` | `src/lib/data-layer/adapters/supabase-adapter.ts` | Optional adapter |

### 3.1 Profile Data Flow

Profile data lives in `oneapp_users` (NOT `profiles` table):
```
ProfileSettings → useDataSourceProfile → oneapp-auth (update-profile) → oneapp_users
                                       → updateUser() → AuthSourceContext → AppHeader
```

---

## 4. Explore Page Architecture

### 4.1 Core Values Section - Flowchart Layout
- Desktop: Hub logo → horizontal bar → 3 value cards
- Mobile: Hub logo → vertical stack with MobileNeonPath between cards
- Scroll-linked animations with `useScrollProgress`

### 4.2 Ecosystem Orbit Section
- Desktop: Orbital layout with rotating satellites (anime.js)
- Mobile: 3x2 grid with staggered entrance

### 4.3 Key Components

| Component | File |
|-----------|------|
| `CoreValuesSection` | `src/components/explore/CoreValuesSection.tsx` |
| `ConstellationHub` | `src/components/explore/ConstellationHub.tsx` |
| `DynamicNeonPaths` | `src/components/explore/DynamicNeonPaths.tsx` |
| `MobileNeonPath` | `src/components/explore/MobileNeonPath.tsx` |
| `EcosystemOrbitSection` | `src/components/explore/EcosystemOrbitSection.tsx` |

---

## 5. OneNote Architecture

### 5.1 Overview

Dual-mode note-taking and task management system:

```
┌─────────────────────────────────────────────────────────────────┐
│                    OneNote Architecture                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  OneNote.tsx (Toolbar + Mode Switcher Dropdown)                   │
│       │                                                          │
│       ├── SimpleMode.tsx                                          │
│       │   ├── NoteListItem.tsx (card list)                        │
│       │   ├── NoteEditorInline.tsx (desktop)                      │
│       │   ├── NoteEditorPanel.tsx (mobile sheet)                  │
│       │   └── TodoItems.tsx (simple todo)                         │
│       │                                                          │
│       └── ProMode.tsx (ResizablePanelGroup)                       │
│           ├── Sidebar (25%)                                       │
│           │   ├── Search                                          │
│           │   ├── Folder Tree (useNoteFolders)                    │
│           │   ├── Note List with NoteActionsMenu                  │
│           │   └── CreateNoteMenu (New Note / New Task)            │
│           │                                                      │
│           └── Editor (75%)                                        │
│               ├── note_type === "note" → BlockEditor              │
│               │   ├── BlockRenderer → Block components            │
│               │   ├── SlashCommandMenu (/ commands)               │
│               │   └── FloatingToolbar (inline formatting)         │
│               │                                                  │
│               └── note_type === "todo" → TaskView                 │
│                   ├── TaskFilters (All/Today/Upcoming/Overdue)    │
│                   ├── TaskItem (checkbox, priority, due date)     │
│                   │   └── Sub-tasks (parent_item_id)              │
│                   └── Completed section (collapsible)             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Data Model

| Table | Purpose |
|-------|---------|
| `notes` | Note/task entries with JSON block content |
| `note_items` | Task items with priority, due_date, parent_item_id |
| `note_folders` | Hierarchical folder structure |
| `note_tags` / `note_tag_links` | Tagging system |
| `note_reminders` | Scheduled reminders (future) |
| `note_shares` | Share tokens (future) |
| `note_templates` | Templates (future) |

### 5.3 Block Editor Content Format

Notes in Pro Mode store content as JSON in `notes.content`:

```json
{
  "blocks": [
    { "id": "uuid", "type": "paragraph", "content": "text" },
    { "id": "uuid", "type": "heading", "level": 2, "content": "Section" },
    { "id": "uuid", "type": "checklist", "items": [{ "id": "uuid", "content": "Task", "checked": true }] },
    { "id": "uuid", "type": "code", "language": "js", "content": "..." },
    { "id": "uuid", "type": "divider" }
  ]
}
```

### 5.4 Task System

- Tasks are notes with `note_type = "todo"`
- Task items stored in `note_items` table
- Sub-tasks: `parent_item_id` column (1-level nesting, soft reference)
- Priority: `"high"` | `"medium"` | `"low"` | `null`
- Smart filters are client-side on fetched items

### 5.5 Note Actions

NoteActionsMenu provides per-note actions via Radix DropdownMenu:
- Pin/Unpin, Archive/Unarchive, Duplicate
- Move to Folder (submenu), Change Color (submenu)
- Export as Markdown (converts block JSON to MD syntax)
- Share Link (placeholder)
- Delete (destructive)

### 5.6 Key Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useNotes` | `src/hooks/useNotes.tsx` | Notes CRUD, filter, sort, realtime |
| `useNoteItems` | `src/hooks/useNoteItems.tsx` | Task items CRUD with sub-task support |
| `useNoteFolders` | `src/hooks/useNoteFolders.tsx` | Folder tree management |
| `useNoteTags` | `src/hooks/useNoteTags.tsx` | Tag CRUD and note-tag linking |
| `useBlockEditor` | `src/components/onenote/pro/useBlockEditor.tsx` | Block state, serialization, auto-save |

---

## 6. Edge Functions

| Function | File | Purpose | Auth | Actions |
|----------|------|---------|------|---------|
| `oneapp-auth` | `supabase/functions/oneapp-auth/` | Custom authentication & profile | No | signup, signin, validate, signout, refresh, sync-to-lovable, get-user-roles, update-profile, reset-password |
| `ai-chat` | `supabase/functions/ai-chat/` | AI chat requests | Yes | - |
| `admin-users` | `supabase/functions/admin-users/` | Admin user management | Yes | - |
| `get-system-connection` | `supabase/functions/get-system-connection/` | Fetch system connection | No | - |
| `manage-system-connection` | `supabase/functions/manage-system-connection/` | CRUD system connection | Yes | - |
| `data-query` | `supabase/functions/data-query/` | Query external Supabase | Yes | - |
| `sync-schema` | `supabase/functions/sync-schema/` | Validate/sync schema | Yes | - |
| `manage-connection` | `supabase/functions/manage-connection/` | Manage user connections | Yes | - |
| `test-external-connection` | `supabase/functions/test-external-connection/` | Test external DB | Yes | - |
| `validate-api-key` | `supabase/functions/validate-api-key/` | Validate AI API keys | Yes | - |
| `crypto-prices` | `supabase/functions/crypto-prices/` | Fetch crypto prices | No | - |
| `crypto-market` | `supabase/functions/crypto-market/` | Fetch market data | No | - |

---

## 7. Styling Architecture

### 7.1 CSS Variables (index.css)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --primary: 199 89% 48%;
  /* ... */
}

.dark {
  --background: 0 0% 4%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### 7.2 Animation Classes

Custom animations for Explore page: `animate-neon-draw-*`, `animate-hub-breathe`, `animate-glow-soft`

---

## 8. Development Guidelines

### 8.1 Authentication
- **ALWAYS** use `useAuthSource()` instead of `useAuth()`
- Token stored in `localStorage.oneapp_token`
- Use `updateUser()` to sync local state after profile changes

### 8.2 Data Layer
```typescript
import { useDataQuery, useDataInsert } from '@/lib/data-layer';
```

### 8.3 Profile Updates
- Profile data is in `oneapp_users` table (NOT `profiles`)
- Use `useDataSourceProfile` hook which calls `oneapp-auth` edge function
- After save, call `updateUser()` from AuthSourceContext to update header

### 8.4 OneNote Development
- Pro Mode content is JSON blocks in `notes.content`
- Task notes use `note_type = "todo"` with `note_items` table
- Sub-tasks use `parent_item_id` (max 1 level nesting)
- All dropdowns: solid `bg-popover` + `border` + `z-50`

### 8.5 Animation Guidelines
- Prefer slow, gentle effects
- Use anime.js for new sections, CSS transitions for legacy
- Apply Mount-Gating pattern for scroll-triggered animations

### 8.6 Mount-Gating Pattern (Scroll Animations)

```
1. PAGE LOAD → useLayoutEffect → window.scrollTo(0,0)
2. SCROLL LOCK → document.body.style.overflow = "hidden" (during preloader)
3. MOUNT-GATE → {!showPreloader && <Section key={location.key} />}
4. PRELOADER COMPLETE → Unlock scroll → Section mounts → Observer starts
```

### 8.7 For New Features
1. Use Data Layer hooks for all data operations
2. Follow design system tokens (no direct colors)
3. Implement for both datasources
4. Add RLS policies for new tables
5. Update schema in `src/lib/data-layer/schema.ts`
6. Apply Mount-Gating for scroll-triggered animations

---

## 9. Animation System (anime.js)

### 9.1 Common Patterns

```typescript
import anime from 'animejs';

// Timeline sequencing
const tl = anime.timeline({ easing: 'easeOutExpo', duration: 800 });
tl.add({ targets: '.header', opacity: [0, 1], translateY: [-20, 0] })
  .add({ targets: '.card', opacity: [0, 1], scale: [0.9, 1], delay: anime.stagger(100) }, '-=400');

// SVG path drawing
anime({ targets: '.neon-path', strokeDashoffset: [anime.setDashoffset, 0], easing: 'easeInOutQuad', duration: 1500 });

// Spring physics
anime({ targets: '.bounce', translateY: [-30, 0], easing: 'spring(1, 80, 10, 0)' });
```

### 9.2 When to Use

| Use Case | Tool |
|----------|------|
| Simple fade/scale/hover | CSS Transitions |
| Sequential phases | anime.js Timeline |
| Stagger effects | anime.js `stagger()` |
| SVG path drawing | anime.js |
| Spring physics | anime.js or `useSpringValue` |
| Scroll-linked continuous | CSS + `useScrollProgress` |
