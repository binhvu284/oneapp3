-- Create partner_keys table for Partner Key verification
CREATE TABLE public.partner_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key_code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.oneapp_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create verified_emails table for pre-approved partner emails
CREATE TABLE public.verified_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.oneapp_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.partner_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_emails ENABLE ROW LEVEL SECURITY;

-- RLS policies for partner_keys (admins can manage, public can verify)
CREATE POLICY "Admins can manage partner keys" 
ON public.partner_keys 
FOR ALL 
USING (has_higher_or_equal_level(
  (SELECT ou.id FROM oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1), 
  2
));

CREATE POLICY "Anyone can verify partner keys" 
ON public.partner_keys 
FOR SELECT 
USING (true);

-- RLS policies for verified_emails (admins can manage, public can check)
CREATE POLICY "Admins can manage verified emails" 
ON public.verified_emails 
FOR ALL 
USING (has_higher_or_equal_level(
  (SELECT ou.id FROM oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1), 
  2
));

CREATE POLICY "Anyone can check verified emails" 
ON public.verified_emails 
FOR SELECT 
USING (true);

-- Add must_change_password column to oneapp_users for super admin seed
ALTER TABLE public.oneapp_users 
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

-- Create Super Admin Seed function
CREATE OR REPLACE FUNCTION public.seed_super_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_exists BOOLEAN;
  new_user_id UUID;
BEGIN
  -- Check if super admin already exists
  SELECT EXISTS(
    SELECT 1 FROM oneapp_users WHERE email = 'admin@oneapp.local'
  ) INTO admin_exists;
  
  IF NOT admin_exists THEN
    -- Create super admin user with bcrypt hash of 'OneApp@Admin123'
    INSERT INTO oneapp_users (
      email,
      password_hash,
      display_name,
      nickname,
      level,
      email_verified,
      is_active,
      must_change_password
    ) VALUES (
      'admin@oneapp.local',
      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      'Super Admin',
      'superadmin',
      1,
      true,
      true,
      true
    )
    RETURNING id INTO new_user_id;
    
    -- Assign admin role
    INSERT INTO user_roles (user_id, role)
    VALUES (new_user_id, 'admin');
    
    RAISE NOTICE 'Super Admin seeded successfully';
  ELSE
    RAISE NOTICE 'Super Admin already exists';
  END IF;
END;
$$;

-- Execute the seed function
SELECT public.seed_super_admin();

-- Create trigger to update updated_at on partner_keys
CREATE TRIGGER update_partner_keys_updated_at
BEFORE UPDATE ON public.partner_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update updated_at on verified_emails
CREATE TRIGGER update_verified_emails_updated_at
BEFORE UPDATE ON public.verified_emails
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();