# Changelog

All notable changes to this project will be documented in this file.

## [2.6.8] - 2026-03-06

### Added
- Rate limiting for Login and Partner Registration to prevent brute force.
- Dashboard with `react-grid-layout` and dynamic configurable widgets.
- `husky` and `lint-staged` for pre-commit quality checks.
- Basic `vitest` unit test setup and sample test.

### Changed
- Refactored `App.tsx` context configurations to rely heavily on declarative provider wraps.
- Extracted static data out of React components (e.g. `INTEGRATED_APPS`) to constants files.
- Consolidated `useOneAppAuth` and `useAuth` into centralized auth patterns.
- Re-architected `WorkspaceDeveloper` routing and subcomponent separation.

### Fixed
- Fixed recursive context loops in `DataSourceContext` and `useSchemaSync`.
