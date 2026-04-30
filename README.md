# OneApp 2.6.8

OneApp is a modular super app acting as a workspace for users and developers. It includes authentication, data integrations (Lovable Cloud / Supabase), and modular sub-apps (Dashboard, Open Source, Workspace Data).

## Documentation

- [ONEAPP_USER_GUIDE.md](./ONEAPP_USER_GUIDE.md) - Hướng dẫn tổng quan các chức năng ứng dụng.
- [ONEAPP_2.7_PLAN.md](./ONEAPP_2.7_PLAN.md) - Phân tích tính năng, đánh giá và kế hoạch phát triển 2.7.
- [ARCHITECTURE_AND_AI_CONTEXT.md](./ARCHITECTURE_AND_AI_CONTEXT.md) - Tài liệu kiến trúc dự án dành cho Developer & AI Agent.

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
