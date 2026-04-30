# OneApp 2 - Database Schema Documentation

> **Last Updated:** 2026-02-12
> **Total Tables:** 28+ (Lovable Cloud)
> **Schema Version:** 2.9.0
> **Schema Definition:** `src/lib/data-layer/schema.ts`
> **Schema Generator:** `src/lib/schemaGenerator.ts` (imports from data-layer)
> **Auto-Sync:** Enabled via `data-query` edge function + `SchemaSyncPanel` UI

---

## 🔄 Unified Schema Definition

Schema definitions have been **unified** - `schemaGenerator.ts` now imports from `data-layer/schema.ts`:

```typescript
// src/lib/schemaGenerator.ts
import { CORE_TABLES, LOVABLE_ONLY_TABLES } from './data-layer/schema';

export const ONEAPP_TABLES: TableDefinition[] = [
  ...CORE_TABLES.map(convertToGeneratorFormat),
  ...LOVABLE_ONLY_TABLES.map(convertToGeneratorFormat),
];
```

---

## Schema by Environment

| Environment | Tables | Purpose |
|-------------|--------|---------|
| **Lovable Cloud** | 28+ | All tables including system_connection + OneNote tables |
| **External Supabase** | 27+ | Core tables (no system_connection) |

### Table Categories

| Category | Tables | Description |
|----------|--------|-------------|
| **Auth & Users** (6) | oneapp_users, user_roles, user_sessions, role_permissions, profiles, user_settings | Authentication and user management |
| **Apps & Library** (4) | categories, in_use_apps, app_categories, user_api_keys | App management and categorization |
| **AI Chat** (2) | conversations, messages | AI chat system |
| **Crypto** (4) | crypto_platforms, crypto_holdings, crypto_transactions, crypto_watchlist | Crypto portfolio management |
| **OneNote** (8) | notes, note_items, note_folders, note_tags, note_tag_links, note_reminders, note_shares, note_templates | Note-taking and task management |
| **Registration** (2) | partner_keys, verified_emails | Partner registration flow |
| **Connections** (2) | external_connections, system_connection | Data source connections |

---

## Quick Reference

| Table | Columns | Category | Purpose |
|-------|---------|----------|---------|
| `oneapp_users` | 20 | Auth | User accounts with custom auth |
| `user_roles` | 5 | Auth | Role assignments |
| `user_sessions` | 8 | Auth | Session management |
| `role_permissions` | 5 | Auth | Permission per role |
| `profiles` | 12 | Auth | User profile (legacy - data now in oneapp_users) |
| `user_settings` | 10 | Auth | Theme & display preferences |
| `user_api_keys` | 6 | Apps | AI API keys storage |
| `categories` | 10 | Apps | App categories/folders |
| `in_use_apps` | 12 | Apps | User's apps |
| `app_categories` | 5 | Apps | Many-to-many relationship |
| `conversations` | 8 | AI | AI chat conversations |
| `messages` | 5 | AI | Chat messages |
| `notes` | 13 | OneNote | Notes with block content |
| `note_items` | 11 | OneNote | Task items with sub-tasks |
| `note_folders` | 9 | OneNote | Hierarchical folder structure |
| `note_tags` | 5 | OneNote | User-defined tags |
| `note_tag_links` | 4 | OneNote | Note-tag junction table |
| `note_reminders` | 6 | OneNote | Note reminders |
| `note_shares` | 7 | OneNote | Share tokens for public access |
| `note_templates` | 10 | OneNote | System & user templates |
| `partner_keys` | 10 | Registration | Partner keys |
| `verified_emails` | 8 | Registration | Pre-verified emails |
| `external_connections` | 10 | Connections | User external connections |
| `crypto_platforms` | 11 | Crypto | Exchange/wallet connections |
| `crypto_holdings` | 10 | Crypto | User crypto holdings |
| `crypto_transactions` | 12 | Crypto | Crypto transaction records |
| `crypto_watchlist` | 7 | Crypto | Coin watchlist with alerts |
| `system_connection` | 11 | Connections | System-wide external config |

---

## Detailed Schema

### 1. oneapp_users [Auth - Primary Table]

```sql
CREATE TABLE IF NOT EXISTS public.oneapp_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  nickname TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  github_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMPTZ,
  lovable_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Important:** Profile data (display_name, nickname, avatar_url, bio, social links) lives here, NOT in the `profiles` table. The `profiles` table is legacy.

### 2-6. Auth & User Tables

- `user_roles` - Role assignments (admin, developer, business_partner, customer)
- `user_sessions` - JWT session tracking (token_hash, device_info, ip_address, expires_at)
- `role_permissions` - Permission per role
- `profiles` - Legacy profile table (data now in oneapp_users)
- `user_settings` - Theme, display, layout, header, sidebar JSONB settings

### 7-10. Apps & Library Tables

- `user_api_keys` - ChatGPT/Gemini API keys
- `categories` - App categories with icon, color
- `in_use_apps` - User's active apps with status enum
- `app_categories` - Many-to-many junction table

### 11-12. AI Chat Tables

- `conversations` - Chat conversations with agent_id, agent_name
- `messages` - Individual messages with role (user/assistant)

### 13-20. OneNote Tables

#### notes
```sql
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',           -- JSON blocks for Pro Mode
  note_type TEXT NOT NULL DEFAULT 'note',  -- 'note' | 'todo'
  color TEXT,
  folder_id UUID REFERENCES note_folders(id),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  parent_id UUID,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Content format (Pro Mode):**
```json
{
  "blocks": [
    { "id": "uuid", "type": "paragraph", "content": "text" },
    { "id": "uuid", "type": "heading", "level": 2, "content": "Section" },
    { "id": "uuid", "type": "checklist", "items": [
      { "id": "uuid", "content": "Task", "checked": true }
    ]},
    { "id": "uuid", "type": "code", "language": "js", "content": "..." },
    { "id": "uuid", "type": "divider" }
  ]
}
```

#### note_items (Task items with sub-tasks)
```sql
CREATE TABLE public.note_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id),
  user_id UUID NOT NULL,
  content TEXT DEFAULT '',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  due_date TIMESTAMPTZ,
  priority TEXT,                      -- 'high' | 'medium' | 'low' | null
  parent_item_id UUID,               -- Self-reference for sub-tasks (1 level)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### note_folders
```sql
CREATE TABLE public.note_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  parent_id UUID REFERENCES note_folders(id),
  icon_name TEXT DEFAULT 'Folder',
  color TEXT DEFAULT '#3b82f6',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### note_tags, note_tag_links
- `note_tags` - User-defined tags with name and color
- `note_tag_links` - Junction table linking notes to tags

#### note_reminders
- Reminder scheduling per note with dismiss tracking

#### note_shares
- Share tokens for public note access with expiry

#### note_templates
- System and user templates with note_type and content

### 21-24. Crypto Tables

- `crypto_platforms` - Exchange/wallet connections
- `crypto_holdings` - Holdings per platform
- `crypto_transactions` - Transaction records (buy/sell/transfer/receive)
- `crypto_watchlist` - Price alert watchlist

### 25-26. Registration Tables

- `partner_keys` - Partner registration keys with usage tracking
- `verified_emails` - Pre-verified emails for partner signup

### 27-28. Connection Tables

- `external_connections` - User external DB connections
- `system_connection` - System-wide external Supabase config (Lovable only)

---

## Security Functions

```sql
-- get_user_level(_user_id UUID) → INTEGER
-- has_higher_or_equal_level(_user_id UUID, _target_level INTEGER) → BOOLEAN
-- has_oneapp_role(_user_id UUID, _role oneapp_role) → BOOLEAN
```

---

## RLS Policies Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| oneapp_users | Own + Admin | Public | Own + Admin | Admin |
| user_roles | Own + Admin | Admin | ❌ | Admin |
| user_sessions | Own | Public | ❌ | Own |
| profiles | Own | Own | Own | ❌ |
| user_settings | Own | Own | Own | Own |
| notes | Own | Own | Own | Own |
| note_items | Own | Own | Own | Own |
| note_folders | Own | Own | Own | Own |
| note_tags | Own | Own | Own | Own |
| note_tag_links | Own | Own | ❌ | Own |
| note_reminders | Own | Own | Own | Own |
| note_shares | Own + Public active | Own | Own | Own |
| note_templates | Own + System | Own | Own | Own |
| conversations | Own | Own | Own | Own |
| messages | Via conversation owner | Via conversation owner | Via conversation owner | Via conversation owner |
| crypto_* | Own | Own | Own | Own |
| partner_keys | Public + Admin | Admin | Admin | Admin |
| verified_emails | Public + Admin | Admin | Admin | Admin |
| system_connection | All auth | Auth | configured_by | configured_by |
