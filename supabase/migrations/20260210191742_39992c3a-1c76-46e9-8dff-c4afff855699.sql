ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS dashboard_settings JSONB;