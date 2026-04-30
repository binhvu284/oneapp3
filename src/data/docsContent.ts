import { LucideIcon, BookOpen, Rocket, Layers, Settings, Code2, Users, FileText } from "lucide-react";

export interface DocPage {
  id: string;
  title: string;
  slug: string;
  content: string;
}

export interface DocCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  pages: DocPage[];
}

export const docsCategories: DocCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    pages: [
      {
        id: "overview",
        title: "Overview",
        slug: "overview",
        content: `# Overview

Welcome to **OneApp** — a modular super app designed as your all-in-one digital workspace.

OneApp is built around three core principles: **Focused · Flexible · Personalized**. Every feature you need is integrated into a single platform so you never have to switch between multiple tools.

## What is OneApp?

OneApp acts as a "home" for many smaller apps that work together seamlessly. Think of it as your personal operating system for productivity — from managing tasks and notes to tracking crypto assets and getting AI assistance.

## Key Benefits

- **Single workspace** — All your tools in one place
- **Modular design** — Install only the apps you need
- **Secure** — End-to-end encrypted data storage
- **Customizable** — Personalize your layout, theme, and workflow
- **AI-powered** — Built-in multi-model AI assistant

## Version

Current stable release: **OneApp 2.6.8**

The next major release, **2.7**, focuses on reducing technical debt, unifying sub-app UI, and performance improvements.`,
      },
      {
        id: "quick-start",
        title: "Quick Start",
        slug: "quick-start",
        content: `# Quick Start

Get up and running with OneApp in minutes.

## 1. Create Your Account

Visit the OneApp homepage and click **Get Started**. You can sign up as:

- **User** — Standard access to all apps and features
- **Developer** — Additional workspace for API keys, data explorer, and developer tools
- **Partner** — Extended access with partner verification

## 2. Explore the Dashboard

After logging in, you'll land on your **Dashboard** — a fully customizable grid of widgets. You can drag, resize, and rearrange any widget to match your workflow.

## 3. Install Apps

Navigate to **Library** to browse available modules. Install the apps you need:

\`\`\`
OneAI      → AI chat, agents, and memory
OneNote    → Smart note management
OneCrypto  → Crypto portfolio tracker
OneLibrary → Document storage
\`\`\`

## 4. Personalize Your Workspace

Go to **Settings → Appearance** to configure:
- Light / Dark / System theme
- Interface language
- Layout preferences
- Sidebar and header style

## 5. Connect Your Data

For developers, connect your own Supabase instance under **Workspace → Developer** to point OneApp to your own database.`,
      },
      {
        id: "installation",
        title: "Installation",
        slug: "installation",
        content: `# Installation

OneApp is a web application — no installation required for regular users. Simply open it in your browser.

## For Developers (Self-hosted)

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Supabase project

### Setup

\`\`\`bash
# Clone the repository
git clone https://github.com/your-org/oneapp.git
cd oneapp

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
\`\`\`

### Environment Variables

\`\`\`env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### Build for Production

\`\`\`bash
npm run build
# Output in dist/ folder
\`\`\`

Deploy to Vercel, Netlify, or any static hosting provider. The \`vercel.json\` config is already included for SPA routing support.`,
      },
    ],
  },
  {
    id: "core-features",
    title: "Core Features",
    icon: Layers,
    pages: [
      {
        id: "dashboard",
        title: "Dashboard",
        slug: "dashboard",
        content: `# Dashboard

The Dashboard is your central command center in OneApp.

## Customizable Widget Grid

The dashboard uses a drag-and-drop grid layout (\`react-grid-layout\`) that lets you:

- **Add widgets** — Choose from available module widgets
- **Resize** — Drag the corner of any widget to resize
- **Rearrange** — Drag widgets to different positions
- **Remove** — Click the X on any widget to remove it

## Available Widgets

| Widget | Description |
|--------|-------------|
| AI Summary | Latest AI conversation snippet |
| Note Preview | Quick view of recent notes |
| Crypto Portfolio | Current holdings value |
| Quick Actions | Shortcuts to frequently used features |
| Weather | Local weather (if enabled) |

## Layout Persistence

Your dashboard layout is automatically saved and synced across devices. Changes persist even after refreshing the page.

## Mobile Dashboard

On mobile, the grid adapts to a single-column vertical scroll layout for easier navigation.`,
      },
      {
        id: "oneai",
        title: "OneAI",
        slug: "oneai",
        content: `# OneAI — AI Assistant

OneAI is the built-in AI assistant that brings multi-model intelligence to your workspace.

## Features

### Multi-Model Chat

Talk with different AI models in a familiar chat interface. Ask questions, get summaries, generate content, or debug code.

### Custom Agents

Create specialized AI "agents" with custom personalities and capabilities:

\`\`\`
Examples:
• Translation Agent — Handles language translation tasks
• Code Review Agent — Analyzes and reviews code
• Research Agent — Searches and summarizes information
\`\`\`

Navigate to **AI → Agents** to create and manage your agents.

### AI Memory

OneAI remembers your previous conversations to provide better, context-aware responses over time. Memory is stored securely and can be cleared at any time from **Settings → AI**.

### AI Translate

A dedicated translation tool accessible at **AI → Translate**. Supports multiple languages with instant translation.

## API Configuration

To use OneAI, configure your API keys in **Workspace → Developer**:

\`\`\`
OpenAI API Key   → For GPT models
ElevenLabs Key   → For voice synthesis (optional)
\`\`\``,
      },
      {
        id: "onenote",
        title: "OneNote",
        slug: "onenote",
        content: `# OneNote — Smart Notes

OneNote is your intelligent note management system, integrated directly into OneApp.

## Creating Notes

Click **New Note** to create a note. The editor supports:

- Rich text formatting
- Markdown syntax
- Code blocks with syntax highlighting
- Checklists and bullet lists

## Organization

### Folders

Create folders to organize notes by project, topic, or any category you choose. Nested folders are supported.

### Tags

Add tags to notes for cross-folder categorization. Filter your note list by tag in the search bar.

## Reminders

Set reminders on any note to get notified at a specific date and time. Reminders appear in your notification panel.

## Sharing

Share notes with others using secure share links:

1. Open a note
2. Click the **Share** button
3. Copy the generated link

Recipients can view the note without needing a OneApp account. Shared links can be revoked at any time.

## Security

All notes are encrypted at rest. Only you (and explicitly shared recipients) can access your note content.`,
      },
      {
        id: "onecrypto",
        title: "OneCrypto",
        slug: "onecrypto",
        content: `# OneCrypto — Crypto Portfolio

OneCrypto gives you a clear view of your cryptocurrency holdings in one place.

## Portfolio Overview

The portfolio screen shows:

- **Total value** — Current USD value of all holdings
- **Holdings table** — Each asset with amount, price, and value
- **24h change** — Profit/loss in the last 24 hours
- **Allocation chart** — Visual breakdown of your portfolio

## Adding Holdings

1. Click **Add Asset**
2. Search for the cryptocurrency
3. Enter your amount
4. Save

## Transaction History

Log your buy/sell transactions to accurately calculate profit and loss:

| Field | Description |
|-------|-------------|
| Type | Buy or Sell |
| Asset | Cryptocurrency |
| Amount | Quantity traded |
| Price | Price at transaction time |
| Date | Transaction date |

## Watchlist

Add cryptocurrencies to your watchlist to monitor price movements without holding them. Set **price alerts** to be notified when an asset reaches your target price.

## Data Source

Price data is fetched from public crypto APIs and refreshed regularly.`,
      },
      {
        id: "onelibrary",
        title: "OneLibrary",
        slug: "onelibrary",
        content: `# OneLibrary — Document Storage

OneLibrary is your secure document storage and management system.

## Uploading Files

Drag and drop files into OneLibrary, or click **Upload** to browse your local files.

Supported file types:
- Documents (PDF, DOCX, TXT)
- Images (PNG, JPG, GIF, WebP)
- Spreadsheets (XLSX, CSV)
- Code files (JS, TS, PY, etc.)

## Smart Classification

OneLibrary automatically categorizes files based on type. Use the filter chips to quickly browse by category:

- **All** — View all files
- **Available** — Currently accessible files
- **Coming Soon** — Features in development

## Search

The search bar filters files by name in real-time. Type any part of a filename to find it instantly.

## Security

Files are stored using Supabase Storage with access control policies ensuring only you can access your documents.`,
      },
    ],
  },
  {
    id: "customization",
    title: "Customization",
    icon: Settings,
    pages: [
      {
        id: "theme",
        title: "Theme & Appearance",
        slug: "theme",
        content: `# Theme & Appearance

OneApp offers extensive appearance customization to match your personal preference.

## Theme Modes

Access theme settings via **Settings → Appearance** or the quick-access command menu (\`Ctrl+K\`).

| Mode | Description |
|------|-------------|
| **Light** | Clean white interface |
| **Dark** | Easy on the eyes, great for night use |
| **System** | Automatically follows your OS preference |

Theme preference is saved to your account and syncs across devices.

## Interface Language

Change the display language from **Settings → Appearance**. Language preference is stored locally and doesn't require a page reload.

## Layout Options

Navigate to **Customization → Layout** to adjust:

- **Sidebar width** — Collapsed or expanded
- **Header style** — Fixed or scrollable
- **Content density** — Comfortable or compact

## Custom Themes

Advanced users can create custom color themes via **Customization → Theme**. The theme system uses CSS variables, allowing you to customize:

- Primary color
- Background shades
- Accent colors
- Border styles`,
      },
      {
        id: "sidebar",
        title: "Sidebar & Navigation",
        slug: "sidebar",
        content: `# Sidebar & Navigation

The sidebar is your primary navigation tool in OneApp.

## Sidebar Modes

| Mode | Behavior |
|------|---------|
| **Expanded** | Full labels visible |
| **Collapsed** | Icon-only mode, hover to see labels |
| **Hidden** | Full-width content, toggle with keyboard |

Toggle the sidebar using the **≡** button in the header, or with the keyboard shortcut.

## Navigation Items

The sidebar is organized into sections:

- **Apps** — Installed module apps (OneNote, OneCrypto, etc.)
- **Workspace** — Developer tools, data explorer
- **Settings** — Account, appearance, security

## Mobile Navigation

On mobile, the sidebar becomes a **bottom navigation bar** with the most important shortcuts, plus a hamburger menu for full navigation access.

## Customization

Reorder sidebar items in **Customization → Sidebar** by dragging items to your preferred order.`,
      },
    ],
  },
  {
    id: "developer",
    title: "Developer",
    icon: Code2,
    pages: [
      {
        id: "architecture",
        title: "Architecture",
        slug: "architecture",
        content: `# Architecture

OneApp is built as a modern Single Page Application (SPA) with a focus on performance and extensibility.

## Tech Stack

\`\`\`
Frontend:   React 18 + TypeScript + Vite
Styling:    Tailwind CSS + Radix UI + shadcn/ui
Routing:    React Router DOM v6
State:      TanStack React Query + React Context
Backend:    Supabase (Auth, PostgreSQL, Storage)
Animations: Framer Motion + Anime.js
\`\`\`

## Project Structure

\`\`\`
src/
├── pages/          # Route-level page components
├── components/     # Reusable components
│   ├── ui/         # Atomic design elements (shadcn/ui)
│   ├── explore/    # Landing page components
│   ├── layout/     # App shell (header, sidebar)
│   └── [module]/   # Module-specific components
├── hooks/          # Custom React hooks
├── contexts/       # Global React Context providers
├── lib/            # Utilities and data layer
├── data/           # Static data and content
└── types/          # TypeScript type definitions
\`\`\`

## Key Architectural Patterns

### Module System
Sub-apps (OneNote, OneCrypto) are decoupled and lazy-loaded via React's \`lazy()\` + \`Suspense\`.

### Data Layer
A custom data-layer abstraction in \`src/lib/data-layer/\` supports dynamic Supabase connections, letting advanced users point OneApp to their own backend.

### Auth Flow
Authentication is handled by Supabase Auth. The \`AuthSourceContext\` provider manages auth state globally and supports external auth source switching.

### Theme System
CSS custom properties (variables) in \`index.css\` power the theme system, with \`next-themes\` managing light/dark switching.`,
      },
      {
        id: "api-integration",
        title: "API Integration",
        slug: "api-integration",
        content: `# API Integration

OneApp supports connecting third-party APIs through the Developer Workspace.

## Adding API Keys

Navigate to **Workspace → Developer** to manage your API keys.

Supported integrations:
- **OpenAI** — Powers OneAI chat and agents
- **Supabase** — Custom database connection
- **ElevenLabs** — Voice synthesis for AI responses

## Connecting External Database

Advanced users can connect their own Supabase project:

1. Go to **Workspace → Developer**
2. Click **External Connection**
3. Enter your Supabase URL and anon key
4. Click **Test Connection**
5. If successful, click **Save**

OneApp will then use your database instead of the default.

## Data Sync

The \`useDataSourceSync\` hook handles real-time synchronization between the UI and your connected data source. Changes are reflected immediately without requiring a page refresh.

## Schema Reference

The full database schema is documented in \`schema.txt\`. Key tables:

| Table | Purpose |
|-------|---------|
| \`oneapp_users\` | User profiles and metadata |
| \`ai_agents\` | Custom AI agent definitions |
| \`ai_conversations\` | Chat history |
| \`modules\` | Available app modules |
| \`in_use_apps\` | User's installed apps |

## Security Considerations

- Never expose your Supabase service role key in the frontend
- Use Row Level Security (RLS) policies on all tables
- API keys are encrypted before storage using \`src/lib/encryption.ts\``,
      },
      {
        id: "data-layer",
        title: "Data Layer",
        slug: "data-layer",
        content: `# Data Layer

The OneApp data layer is a custom abstraction over Supabase that supports dynamic database connections.

## Overview

The data layer lives in \`src/lib/data-layer/\` and provides:

- A unified API for database operations
- Dynamic connection switching (default vs. external)
- Query caching via TanStack React Query
- Encryption utilities for sensitive data

## Using the Data Layer

\`\`\`typescript
import { useDataSource } from "@/lib/data-layer";

function MyComponent() {
  const { supabase } = useDataSource();

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("my_table")
      .select("*");
    return data;
  };
}
\`\`\`

## Encryption

Sensitive fields (API keys, private notes) are encrypted using AES-256 before storage:

\`\`\`typescript
import { encrypt, decrypt } from "@/lib/encryption";

const encrypted = await encrypt(apiKey);
const original = await decrypt(encrypted);
\`\`\`

## Caching Strategy

Queries are cached using React Query with the following defaults:

| Setting | Value |
|---------|-------|
| staleTime | 60 seconds |
| retry | 1 attempt |
| refetchOnWindowFocus | disabled |

Override these defaults by passing \`queryOptions\` to the query hooks.`,
      },
    ],
  },
  {
    id: "community",
    title: "Community",
    icon: Users,
    pages: [
      {
        id: "forum",
        title: "Forum & Community",
        slug: "forum",
        content: `# Forum & Community

The OneApp community is a space for users and developers to connect, share insights, and get support.

## Intel Forum

The **Intel Forum** is available at \`/forum\` and provides:

- **Announcements** — Latest OneApp updates and releases
- **Discussions** — General conversation about OneApp usage
- **Feature Requests** — Suggest new features or improvements
- **Bug Reports** — Report issues you encounter
- **Developer Talk** — Technical discussions for developers

## Getting Help

If you need help with OneApp:

1. Search the forum for existing answers
2. Post a new thread with a clear description
3. Tag relevant team members for urgent issues

## Contributing

OneApp welcomes contributions from the community. See the Contributing guide for details on:

- Code contributions
- Documentation improvements
- Bug reports
- Feature requests`,
      },
      {
        id: "contributing",
        title: "Contributing",
        slug: "contributing",
        content: `# Contributing to OneApp

Thank you for your interest in contributing to OneApp! This guide covers how to contribute effectively.

## Code of Conduct

Be respectful and constructive in all interactions. We aim for an inclusive community.

## How to Contribute

### Bug Reports

1. Check existing issues to avoid duplicates
2. Create a detailed bug report including:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Browser/OS version

### Feature Requests

Open an issue with the \`enhancement\` label describing:
- The problem you're solving
- Your proposed solution
- Any alternatives you've considered

### Pull Requests

\`\`\`bash
# Fork the repository
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Write tests if applicable
# Run linting
npm run lint

# Commit with clear message
git commit -m "feat: add your feature description"

# Push and open PR
git push origin feature/your-feature-name
\`\`\`

## Code Standards

- TypeScript strict mode — no \`any\` types
- Components in PascalCase, hooks in camelCase with \`use\` prefix
- Use existing \`shadcn/ui\` components from \`src/components/ui/\`
- Follow Tailwind CSS utility-first patterns
- Test with \`npm run test\` before submitting`,
      },
      {
        id: "changelog",
        title: "Changelog",
        slug: "changelog",
        content: `# Changelog

Track all notable changes to OneApp across versions.

## v2.6.8 — Current

### New Features
- Enhanced ecosystem visualization with interactive app connections
- Animated stats section on landing page
- Feature grid section with hover effects
- Professional docs portal with search and dark mode

### Improvements
- Orbit nodes now show real app ecosystem (OneNote, OneCrypto, OneAI, OneLibrary)
- Coming Soon apps highlighted with pulse animation
- Connection lines animate between hub and active node
- Navigation header updated with Docs link

---

## v2.6.0

### New Features
- OneNote sharing via secure token links
- OneCrypto watchlist with price alerts
- Dashboard widget drag-and-drop reordering
- AI agent memory persistence

### Improvements
- Faster page transitions using Framer Motion
- Improved mobile sidebar behavior
- Dark mode system preference detection

---

## v2.5.0

### New Features
- EcosystemOrbitSection with Anime.js animations
- ParticleBackground for landing page
- CoreValuesSection constellation animation
- Counter preloader on first visit

### Improvements
- Performance optimization with React lazy loading
- PWA support with Workbox offline caching

---

## v2.0.0

### New Features
- Complete redesign with new component system
- Supabase integration for auth and storage
- Module architecture for extensible apps
- Theme customization with CSS variables`,
      },
    ],
  },
];

// Flat list of all pages for search
export const allDocPages: (DocPage & { categoryId: string; categoryTitle: string })[] =
  docsCategories.flatMap((cat) =>
    cat.pages.map((page) => ({
      ...page,
      categoryId: cat.id,
      categoryTitle: cat.title,
    }))
  );

export function getDocPage(categoryId: string, pageSlug: string): DocPage | undefined {
  const cat = docsCategories.find((c) => c.id === categoryId);
  return cat?.pages.find((p) => p.slug === pageSlug);
}

export function getFirstPage(): DocPage & { categoryId: string } {
  const firstCat = docsCategories[0];
  return { ...firstCat.pages[0], categoryId: firstCat.id };
}
