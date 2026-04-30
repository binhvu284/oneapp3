-- Remove sensitive credential columns from external_connections table
-- This table is legacy and credentials should not be stored here
-- The system now uses system_connection table with edge function handling

-- Drop the sensitive columns that could expose credentials
ALTER TABLE public.external_connections 
DROP COLUMN IF EXISTS supabase_anon_key,
DROP COLUMN IF EXISTS supabase_service_key;

-- Add a comment to document this change
COMMENT ON TABLE public.external_connections IS 'Legacy per-user connection table. Sensitive credentials have been removed for security. Use system_connection table instead.';