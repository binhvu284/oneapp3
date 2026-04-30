-- ============================================================================
-- OneApp User System - Complete Schema
-- ============================================================================

-- 1. Create role enum with hierarchical levels
CREATE TYPE public.oneapp_role AS ENUM ('admin', 'developer', 'business_partner', 'customer');

-- 2. Create oneapp_users table (single source of truth for all user data)
CREATE TABLE public.oneapp_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  nickname TEXT,
  avatar_url TEXT,
  phone TEXT,
  level INTEGER NOT NULL DEFAULT 4, -- 1=admin, 2=developer, 3=business_partner, 4=customer
  email_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  lovable_user_id UUID, -- Link to auth.users for sync
  github_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  bio TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create user_roles table (many-to-many for flexibility)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.oneapp_users(id) ON DELETE CASCADE,
  role oneapp_role NOT NULL,
  assigned_by UUID REFERENCES public.oneapp_users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 4. Create role_permissions table for fine-grained control
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role oneapp_role NOT NULL,
  permission TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (role, permission)
);

-- 5. Create user_sessions table for custom session management
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.oneapp_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  device_info TEXT,
  ip_address TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Enable RLS on all tables
ALTER TABLE public.oneapp_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- 7. Create security definer function to check role (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_oneapp_role(_user_id UUID, _role oneapp_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 8. Create function to get user level (for hierarchical checks)
CREATE OR REPLACE FUNCTION public.get_user_level(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT level FROM public.oneapp_users WHERE id = _user_id),
    999 -- Return high number if user not found (lowest privilege)
  )
$$;

-- 9. Create function to check if user has permission based on level
CREATE OR REPLACE FUNCTION public.has_higher_or_equal_level(_user_id UUID, _target_level INTEGER)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_level(_user_id) <= _target_level
$$;

-- 10. RLS Policies for oneapp_users
-- Users can view their own data
CREATE POLICY "Users can view own profile"
ON public.oneapp_users
FOR SELECT
USING (id = (SELECT ou.id FROM public.oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1));

-- Users can update their own non-sensitive data
CREATE POLICY "Users can update own profile"
ON public.oneapp_users
FOR UPDATE
USING (id = (SELECT ou.id FROM public.oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1));

-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON public.oneapp_users
FOR SELECT
USING (
  public.has_higher_or_equal_level(
    (SELECT ou.id FROM public.oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1),
    1
  )
);

-- Admins can update all users
CREATE POLICY "Admins can update all users"
ON public.oneapp_users
FOR UPDATE
USING (
  public.has_higher_or_equal_level(
    (SELECT ou.id FROM public.oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1),
    1
  )
);

-- Admins can delete users
CREATE POLICY "Admins can delete users"
ON public.oneapp_users
FOR DELETE
USING (
  public.has_higher_or_equal_level(
    (SELECT ou.id FROM public.oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1),
    1
  )
);

-- Allow insert for signup (will be validated in edge function)
CREATE POLICY "Allow signup insert"
ON public.oneapp_users
FOR INSERT
WITH CHECK (true);

-- 11. RLS Policies for user_roles
-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (
  user_id = (SELECT ou.id FROM public.oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1)
);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  public.has_higher_or_equal_level(
    (SELECT ou.id FROM public.oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1),
    1
  )
);

-- Admins can manage roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  public.has_higher_or_equal_level(
    (SELECT ou.id FROM public.oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1),
    1
  )
);

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (
  public.has_higher_or_equal_level(
    (SELECT ou.id FROM public.oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1),
    1
  )
);

-- 12. RLS Policies for role_permissions (read-only for all, admin manages)
CREATE POLICY "Anyone can view permissions"
ON public.role_permissions
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage permissions"
ON public.role_permissions
FOR ALL
USING (
  public.has_higher_or_equal_level(
    (SELECT ou.id FROM public.oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1),
    1
  )
);

-- 13. RLS Policies for user_sessions
CREATE POLICY "Users can view own sessions"
ON public.user_sessions
FOR SELECT
USING (
  user_id = (SELECT ou.id FROM public.oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1)
);

CREATE POLICY "Users can delete own sessions"
ON public.user_sessions
FOR DELETE
USING (
  user_id = (SELECT ou.id FROM public.oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1)
);

CREATE POLICY "Allow session insert"
ON public.user_sessions
FOR INSERT
WITH CHECK (true);

-- 14. Create updated_at trigger for oneapp_users
CREATE TRIGGER update_oneapp_users_updated_at
BEFORE UPDATE ON public.oneapp_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Insert default permissions for each role
INSERT INTO public.role_permissions (role, permission, description) VALUES
-- Admin permissions (level 1)
('admin', 'manage_users', 'Create, update, delete users'),
('admin', 'manage_roles', 'Assign and remove roles'),
('admin', 'manage_system', 'Configure system settings'),
('admin', 'view_all_data', 'View all data in the system'),
('admin', 'manage_apps', 'Create, update, delete apps'),
('admin', 'manage_datasource', 'Configure external datasources'),
-- Developer permissions (level 2)
('developer', 'create_apps', 'Create new apps'),
('developer', 'edit_apps', 'Edit existing apps'),
('developer', 'view_developer_data', 'View developer-specific data'),
('developer', 'manage_categories', 'Manage app categories'),
-- Business partner permissions (level 3)
('business_partner', 'view_reports', 'View business reports'),
('business_partner', 'export_data', 'Export allowed data'),
('business_partner', 'view_analytics', 'View analytics dashboard'),
-- Customer permissions (level 4)
('customer', 'use_apps', 'Use available apps'),
('customer', 'view_profile', 'View own profile'),
('customer', 'edit_profile', 'Edit own profile');

-- 16. Create index for performance
CREATE INDEX idx_oneapp_users_email ON public.oneapp_users(email);
CREATE INDEX idx_oneapp_users_lovable_user_id ON public.oneapp_users(lovable_user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(expires_at);