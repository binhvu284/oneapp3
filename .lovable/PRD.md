# OneApp 2 - Product Requirements Document (PRD)

> **Last Updated:** 2026-02-12
> **Version:** 2.9
> **GitHub:** https://github.com/binhvu284/oneapp2

---

## 1. Product Overview

### 1.1 Vision
OneApp là một nền tảng quản lý ứng dụng cá nhân, cho phép người dùng tổ chức, quản lý và tùy chỉnh các ứng dụng họ sử dụng. OneApp 2 được phát triển dựa trên OneApp 1, kế thừa UI/UX và mở rộng tính năng.

### 1.2 Reference Style
- **UI/UX Reference:** https://vennor.vercel.app (OneApp 1)
- **Design Principles:** Clean, compact, space-optimized, smooth loading animations
- **Motion Design:** Slow, gentle effects (breathing, soft glow); avoid fast rotations or floating elements
- **Responsive:** Desktop-first with mobile optimization

### 1.3 Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| State | TanStack Query, React Context |
| Backend | Lovable Cloud (Supabase) |
| Auth | **OneApp Custom Auth** (độc lập, sử dụng bảng `oneapp_users`) |
| Edge Functions | Deno (Supabase Edge Functions) |
| Data Layer | Custom Data Abstraction Layer |
| Animation | **anime.js** (cho các section mới), CSS Transitions (legacy) |

---

## 2. Core Architecture

### 2.1 Authentication System (OneApp Custom Auth)

OneApp 2 sử dụng **hệ thống xác thực độc lập** thay vì Supabase Auth:

**Key Features:**
- Bảng `oneapp_users` chứa toàn bộ thông tin user (20 columns)
- Password được hash bằng bcrypt
- Token JWT lưu trong localStorage
- `AuthSourceContext` cung cấp API: `signIn`, `signUp`, `signOut`, `user`, `updateUser`
- Edge function `oneapp-auth` cho authenticate
- **Forgot Password flow** (reset trực tiếp qua email verification)
- **Profile update** qua `oneapp-auth` edge function (`update-profile` action)

### 2.2 Data Abstraction Layer

Unified API for all data operations, supporting Lovable Cloud and External Supabase.

### 2.3 Role & Level System

| Role | Level |
|------|-------|
| admin | 99 |
| developer | 80 |
| business_partner | 50 |
| customer | 10 |

---

## 3. Database Schema (27+ Tables)

### Categories:
- **Auth & Users** (6): oneapp_users, user_roles, user_sessions, role_permissions, profiles, user_settings
- **Apps & Library** (4): categories, in_use_apps, app_categories, user_api_keys
- **AI Chat** (2): conversations, messages
- **OneNote** (8): notes, note_items, note_folders, note_tags, note_tag_links, note_reminders, note_shares, note_templates
- **Crypto** (4): crypto_platforms, crypto_holdings, crypto_transactions, crypto_watchlist
- **Registration** (2): partner_keys, verified_emails
- **Connections** (2): external_connections, system_connection

---

## 4. Features

### 4.1 Completed Features

#### Core Infrastructure
- [x] React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- [x] TanStack Query for server state
- [x] Lovable Cloud (Supabase) integration
- [x] **Data Abstraction Layer** with unified schema
- [x] Database schema with 27+ tables
- [x] RLS policies for all tables

#### Authentication System
- [x] **OneApp Custom Auth** (independent from Supabase Auth)
- [x] `oneapp_users` table with 20 columns
- [x] `AuthSourceContext` providing unified API with `updateUser`
- [x] Login/Signup pages with required display name
- [x] **Forgot Password page** (`/auth/forgot-password`) with direct reset
- [x] **Friendly error messages** on login (EN/VI)
- [x] Protected routes & session management
- [x] Partner registration flow (key/email verification)
- [x] **Profile update** via `oneapp-auth` edge function (syncs header immediately)

#### Explore Page (Landing)
- [x] Hero section with animated text
- [x] Core Values Constellation with scroll-linked neon paths
- [x] Ecosystem Orbit Section (orbital layout with satellites, anime.js)
- [x] Floating header navigation
- [x] Responsive mobile layout

#### OneNote (Note-Taking & Task Management)
- [x] **Dual Mode System:** Simple Mode + Pro Mode
- [x] **Toolbar header** with dropdown mode switcher
- [x] **Simple Mode:** Note cards with inline/sheet editor, filters, tags
- [x] **Pro Mode:**
  - [x] Resizable two-panel layout (sidebar 25% + editor 75%)
  - [x] Hierarchical folder system with CRUD
  - [x] Custom block editor (JSON-based content)
  - [x] Block types: Paragraph, Heading (h1-h3), Bullet/Numbered List, Checklist, Quote, Code, Divider
  - [x] Slash command menu (`/` to insert/change blocks)
  - [x] Floating toolbar for inline formatting (Bold, Italic, Strikethrough, Code)
  - [x] Drag-and-drop block reordering
- [x] **Task System (TickTick-style):**
  - [x] Dedicated TaskView for `note_type = "todo"` notes
  - [x] Task items with checkbox, inline editing, priority indicators, due date badges
  - [x] Sub-task support (1-level nesting via `parent_item_id`)
  - [x] Collapsible "Completed" section
  - [x] Smart filters: All / Today / Upcoming / Overdue
  - [x] Create menu dropdown: New Note / New Task
- [x] **Note Actions Menu:**
  - [x] Pin / Unpin, Archive / Unarchive
  - [x] Duplicate (copies content + note_items)
  - [x] Move to Folder (submenu)
  - [x] Change Color (submenu with swatches)
  - [x] Export as Markdown (converts block JSON to .md)
  - [x] Share Link (placeholder for Phase 4)
  - [x] Delete (destructive)
- [x] Tag system with create, assign, filter
- [x] Note color coding
- [x] Auto-save with debounce

#### Data Management
- [x] OneApp Data page (`/developing/data`)
- [x] Datasource switching, schema display, connection testing
- [x] Schema Sync Panel with one-click sync

#### Settings
- [x] Profile, Account, Theme/Appearance, Display/Layout, Header/Sidebar settings
- [x] **Profile settings** update via edge function with header sync

#### AI Integration
- [x] AI Chat interface with conversations & messages
- [x] API key management

#### OneLibrary (App Library)
- [x] 4-tab interface: Explore, Categories, All Apps, Coming Soon
- [x] Source-type badges, route-based icons, search & filtering

#### OneCrypto (Crypto Portfolio)
- [x] Portfolio overview with allocation chart
- [x] Transaction history, dual currency (USD/VND)
- [x] Market data with Fear & Greed Index

#### System Admin
- [x] User management (admin only)
- [x] Partner keys management
- [x] Verified emails management
- [x] Permission matrix

### 4.2 Pending/Future Features

- [ ] OneNote: Note templates (system + custom)
- [ ] OneNote: Search & replace in block editor
- [ ] OneNote: Reminder system with notifications
- [ ] OneNote: Share notes via public link (`note_shares`)
- [ ] Auto-migration for external databases
- [ ] Data sync between sources
- [ ] Advanced analytics
- [ ] Team collaboration

---

## 5. Edge Functions

| Function | Purpose | Auth | Actions |
|----------|---------|------|---------|
| `oneapp-auth` | OneApp Custom Authentication | No | signup, signin, validate, signout, refresh, sync-to-lovable, get-user-roles, update-profile, reset-password |
| `ai-chat` | Handle AI chat requests | Yes | - |
| `admin-users` | Admin user management | Yes | - |
| `get-system-connection` | Fetch system connection | No | - |
| `manage-system-connection` | CRUD for system connection | Yes | - |
| `data-query` | Query external Supabase | Yes | - |
| `sync-schema` | Validate/sync schema | Yes | - |
| `manage-connection` | Manage user connections | Yes | - |
| `test-external-connection` | Test external DB | Yes | - |
| `validate-api-key` | Validate AI API keys | Yes | - |
| `custom-auth` | Legacy auth function | No | - |
| `crypto-prices` | Fetch crypto prices | No | - |
| `crypto-market` | Fetch market data | No | - |

---

## 6. UI/UX Guidelines

### 6.1 Design System
- **Colors:** Semantic tokens from `index.css` and `tailwind.config.ts` (HSL)
- **Components:** shadcn/ui with custom variants
- **Theme:** Dark mode default, light mode supported
- **Dropdowns:** Always solid `bg-popover` background with `border` and high `z-index`

### 6.2 Layout Principles
- Clean and compact, optimize space usage
- Loading UI animations for smooth UX
- Desktop-first, mobile-responsive

### 6.3 Motion Design
- Prefer slow, gentle effects (breathing, soft glow)
- Avoid fast rotation or floating content cards
- Use `anime.js` for new animated sections, CSS transitions for legacy

---

## 7. Routes

### Public Routes
| Route | Page | Description |
|-------|------|-------------|
| `/explore` | ExplorePage | Landing page |
| `/home` | → `/explore` | Redirect |
| `/ecosystem` | Features | Features page |
| `/journey` | About | About page |
| `/forum` | Community | Community page |
| `/auth/login` | Login | Login page |
| `/auth/forgot-password` | ForgotPassword | Password reset |
| `/auth/signup` | SignUpRoleSelection | Signup role selection |
| `/auth/signup/developer` | DeveloperInfo | Developer signup |
| `/auth/signup/partner` | PartnerVerification | Partner verification |
| `/auth/signup/partner/key` | PartnerKeyVerification | Partner key check |
| `/auth/signup/partner/email` | PartnerEmailVerification | Partner email check |
| `/auth/signup/partner/register` | PartnerRegistration | Partner registration |

### Protected Routes (requires auth)
| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Main dashboard |
| `/library` | OneLibrary | App library |
| `/workspace/data` | WorkspaceData | Workspace data |
| `/workspace/developer` | WorkspaceDeveloper | Developer workspace |
| `/developing/data` | DevelopingData | Data management |
| `/developing/ai` | OneAppAI | AI settings |
| `/developing/ai/chat` | AIChat | AI chat interface |
| `/customization/interface` | Interface | Interface settings |
| `/customization/interface/theme` | ThemeSettings | Theme customization |
| `/customization/interface/layout` | LayoutOptions | Layout options |
| `/customization/interface/display` | DisplaySettings | Display settings |
| `/customization/interface/sidebar` | SidebarSettings | Sidebar settings |
| `/customization/interface/header` | HeaderSettings | Header settings |
| `/customization/admin` | SystemAdmin | System admin |
| `/profile` | Profile | User profile |
| `/settings` | Settings | Settings hub |
| `/settings/account` | AccountSettings | Account settings |
| `/settings/profile` | ProfileSettings | Profile settings |
| `/settings/appearance` | AppearanceSettings | Appearance settings |
| `/settings/security` | SecuritySettings | Security settings |
| `/apps/crypto` | OneCrypto | Crypto portfolio |
| `/apps/onenote` | OneNote | Note-taking app |

---

## 8. Development Guidelines

### 8.1 Authentication
- **ALWAYS** use `useAuthSource()` instead of `useAuth()`
- Token stored in `localStorage.oneapp_token`
- Use `updateUser()` from AuthSourceContext to update local user state after profile changes

### 8.2 Data Layer
```typescript
import { useDataQuery, useDataInsert } from '@/lib/data-layer';
```

### 8.3 Profile Updates
- Profile data lives in `oneapp_users` table (NOT `profiles`)
- Updates go through `oneapp-auth` edge function with `update-profile` action
- Hook: `useDataSourceProfile` handles both Lovable Cloud and External DB
- After saving, call `updateUser()` to sync header display

### 8.4 OneNote Development
- Notes content in Pro Mode is stored as JSON blocks in `notes.content`
- Simple Mode reads plain text or extracts from blocks
- Task notes use `note_type = "todo"` and items in `note_items` table
- Sub-tasks use `parent_item_id` (1-level max nesting)
- All dropdowns must use solid `bg-popover` background with `border` and `z-50`

### 8.5 For New Features
1. Use Data Layer hooks for all data operations
2. Follow design system tokens (no direct colors)
3. Add RLS policies for new tables
4. Apply Mount-Gating pattern for scroll-triggered animations

---

## 9. Known Issues & Solutions

| Issue | Solution | Date |
|-------|----------|------|
| Profile update 500 error | Use `.maybeSingle()` + null check for updatedUser | 2026-02-12 |
| Dropdown transparency | Use `bg-popover border z-50` | 2026-02-11 |
| Animation starts too early | Set `startOffset: 0.5` | 2026-01-30 |
| Header shows email not name | Prioritize `user.display_name` + `updateUser()` | 2026-02-12 |
| Logout loop (403) | Added logout guard | 2026-01-22 |

---

## 10. Important Notes

- Never modify `src/integrations/supabase/types.ts` - auto-generated
- Never modify `.env` - auto-managed
- Use semantic tokens for all colors
- Always enable RLS for new tables
- **Authentication độc lập** - dùng `oneapp_users`, KHÔNG dùng `auth.users`
- **Profile data** lives in `oneapp_users`, NOT in `profiles` table
