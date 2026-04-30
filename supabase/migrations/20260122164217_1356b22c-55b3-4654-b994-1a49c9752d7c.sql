-- ============================================
-- OneApp Schema Sync - Restore all triggers
-- FULLY IDEMPOTENT - Safe to run multiple times
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to create profile on user signup (with display_name from metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- TRIGGERS for updated_at columns
-- ============================================

-- profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- user_settings
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- user_api_keys
DROP TRIGGER IF EXISTS update_user_api_keys_updated_at ON public.user_api_keys;
CREATE TRIGGER update_user_api_keys_updated_at
  BEFORE UPDATE ON public.user_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- in_use_apps
DROP TRIGGER IF EXISTS update_in_use_apps_updated_at ON public.in_use_apps;
CREATE TRIGGER update_in_use_apps_updated_at
  BEFORE UPDATE ON public.in_use_apps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- conversations
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- external_connections
DROP TRIGGER IF EXISTS update_external_connections_updated_at ON public.external_connections;
CREATE TRIGGER update_external_connections_updated_at
  BEFORE UPDATE ON public.external_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- system_connection
DROP TRIGGER IF EXISTS update_system_connection_updated_at ON public.system_connection;
CREATE TRIGGER update_system_connection_updated_at
  BEFORE UPDATE ON public.system_connection
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER for auto-creating profile on signup
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();