-- Add service_role_key column to external_connections
ALTER TABLE public.external_connections 
ADD COLUMN IF NOT EXISTS supabase_service_key TEXT;