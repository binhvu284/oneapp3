# OneApp 2.6.8

OneApp is a modular super app acting as a workspace for users and developers. It includes authentication, data integrations (Lovable Cloud / Supabase), and modular sub-apps (Dashboard, Open Source, Workspace Data).

## Documentation

### OneApp 3 (current)

- [docs/ONEAPP_3_PRD.md](./docs/ONEAPP_3_PRD.md) - Product Requirements Document for OneApp 3.
- [docs/PHASE_1_IMPLEMENTATION_PLAN.md](./docs/PHASE_1_IMPLEMENTATION_PLAN.md) - Engineering plan for Phase 1 (OneNote 3.0).

### Old versions (OneApp 1 & 2)

- [old version/ONEAPP_USER_GUIDE.md](./old%20version/ONEAPP_USER_GUIDE.md) - Hướng dẫn tổng quan các chức năng ứng dụng (v2.6.8).
- [old version/ONEAPP_2.7_PLAN.md](./old%20version/ONEAPP_2.7_PLAN.md) - Phân tích tính năng, đánh giá và kế hoạch phát triển 2.7.
- [old version/ARCHITECTURE_AND_AI_CONTEXT.md](./old%20version/ARCHITECTURE_AND_AI_CONTEXT.md) - Tài liệu kiến trúc dự án dành cho Developer & AI Agent.
- [old version/CHANGELOG.md](./old%20version/CHANGELOG.md) - Historical changelog (up to v2.6.8).

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Run the unit tests:

```bash
npm run test
```

## Features

- **Supabase Authentication**: Integrated Auth and DB.
- **Dynamic Dashboard**: Grid-based modular dashboard with draggable widgets.
- **Integrated Apps**: Categorize and manage your connected apps.

## Scripts

- `npm run dev`: Starts the Vite dev server.
- `npm run build`: Builds the project for production.
- `npm run format`: Formats code using Prettier.
- `npm run lint`: Lints code using ESLint.
- `npm run test`: Runs the Vitest test suite.
