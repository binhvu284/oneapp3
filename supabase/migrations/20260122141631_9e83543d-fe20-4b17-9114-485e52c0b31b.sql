-- Create system_connection table for global/system-wide external connection
-- This replaces per-user external_connections for connection settings
CREATE TABLE IF NOT EXISTS public.system_connection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_url TEXT,
  supabase_anon_key TEXT,
  supabase_service_key TEXT,
  is_active BOOLEAN DEFAULT false,
  connection_status TEXT DEFAULT 'not_setup',
  last_tested_at TIMESTAMPTZ,
  error_message TEXT,
  configured_by uuid REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_connection ENABLE ROW LEVEL SECURITY;

-- Allow ALL authenticated users to READ the system connection
CREATE POLICY "All authenticated users can view system connection"
  ON public.system_connection FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to INSERT (first setup)
CREATE POLICY "Authenticated users can create system connection"
  ON public.system_connection FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow the user who configured it to UPDATE
CREATE POLICY "Configured user can update system connection"
  ON public.system_connection FOR UPDATE
  TO authenticated
  USING (auth.uid() = configured_by);

-- Allow the user who configured it to DELETE
CREATE POLICY "Configured user can delete system connection"
  ON public.system_connection FOR DELETE
  TO authenticated
  USING (auth.uid() = configured_by);

-- Create trigger for updated_at
CREATE TRIGGER update_system_connection_updated_at
  BEFORE UPDATE ON public.system_connection
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();