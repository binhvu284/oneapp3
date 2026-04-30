-- Create external_connections table for storing Supabase connection credentials
CREATE TABLE external_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Supabase',
  supabase_url TEXT,
  supabase_anon_key TEXT,
  is_active BOOLEAN DEFAULT false,
  connection_status TEXT DEFAULT 'not_setup',
  last_tested_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE external_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own connections"
ON external_connections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections"
ON external_connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
ON external_connections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
ON external_connections FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_external_connections_updated_at
  BEFORE UPDATE ON external_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();