# Current Plan

> **Last Updated:** 2026-02-12

## ✅ Completed

### Forgot Password & Friendly Login Errors (v2.9)
- [x] Forgot Password page (`/auth/forgot-password`) with direct reset
- [x] `reset-password` action in `oneapp-auth` edge function
- [x] Friendly error messages on Login page (EN/VI)
- [x] Login page "Forgot password?" link → `/auth/forgot-password`
- [x] Translation keys for forgot password flow
- [x] Route added in `App.tsx`

### Profile Update Fix (v2.9)
- [x] Profile updates via `oneapp-auth` edge function (`update-profile` action)
- [x] `useDataSourceProfile` hook updated to use edge function
- [x] `updateUser()` method in AuthSourceContext for header sync
- [x] Fixed `.single()` → `.maybeSingle()` for cross-datasource compatibility
- [x] Added null check for `updatedUser` in edge function

---

## 🔜 Pending / Future Features

- [ ] OneNote: Note templates (system + custom)
- [ ] OneNote: Search & replace in block editor
- [ ] OneNote: Reminder system with notifications
- [ ] OneNote: Share notes via public link (`note_shares`)
- [ ] Auto-migration for external databases
- [ ] Data sync between sources
- [ ] Advanced analytics
- [ ] Team collaboration
