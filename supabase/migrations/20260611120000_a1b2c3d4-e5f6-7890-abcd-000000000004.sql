-- OneApp 3 — Phase 4 scaffold (Interface 3.0)
-- Theme-engine foundation (F4.5): per-user theme preset, accent hue, and
-- sidebar pinned quick-actions. Additive + idempotent; no destructive changes.
-- File only — apply via the Supabase migration workflow when Phase 4 ships.

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS theme_preset text NOT NULL DEFAULT 'midnight';

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS accent_hue integer NOT NULL DEFAULT 186; -- 186 = cyan

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS sidebar_pinned_actions jsonb NOT NULL DEFAULT '[]'::jsonb;
