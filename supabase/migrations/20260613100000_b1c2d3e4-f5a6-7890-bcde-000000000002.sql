-- Phase 2 — OneCommand scaffold
-- Adds: github_pat + vercel_token to user_api_keys; onecommand_integrations table.

-- 1. New token columns on the existing user_api_keys table
ALTER TABLE public.user_api_keys
  ADD COLUMN IF NOT EXISTS github_pat      text,
  ADD COLUMN IF NOT EXISTS vercel_token    text;

-- 2. OneCommand project integrations
CREATE TABLE IF NOT EXISTS public.onecommand_integrations (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES public.oneapp_users(id) ON DELETE CASCADE,
  type              text        NOT NULL CHECK (type IN ('github', 'vercel', 'both')),
  project_name      text        NOT NULL,
  github_repo       text,        -- "owner/repo"
  vercel_project_id text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.onecommand_integrations ENABLE ROW LEVEL SECURITY;

-- Users manage only their own integrations
CREATE POLICY "onecommand_integrations_user_policy"
  ON public.onecommand_integrations
  USING (
    user_id = (
      SELECT id FROM public.oneapp_users
      WHERE lovable_user_id = auth.uid()
      LIMIT 1
    )
  )
  WITH CHECK (
    user_id = (
      SELECT id FROM public.oneapp_users
      WHERE lovable_user_id = auth.uid()
      LIMIT 1
    )
  );

-- updated_at trigger
CREATE OR REPLACE TRIGGER onecommand_integrations_updated_at
  BEFORE UPDATE ON public.onecommand_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
