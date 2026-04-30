-- ============================================
-- Create all triggers (safe to re-run)
-- ============================================

-- profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- user_settings
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- user_api_keys
DROP TRIGGER IF EXISTS update_user_api_keys_updated_at ON public.user_api_keys;
CREATE TRIGGER update_user_api_keys_updated_at
  BEFORE UPDATE ON public.user_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- in_use_apps
DROP TRIGGER IF EXISTS update_in_use_apps_updated_at ON public.in_use_apps;
CREATE TRIGGER update_in_use_apps_updated_at
  BEFORE UPDATE ON public.in_use_apps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- conversations
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- external_connections
DROP TRIGGER IF EXISTS update_external_connections_updated_at ON public.external_connections;
CREATE TRIGGER update_external_connections_updated_at
  BEFORE UPDATE ON public.external_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- system_connection
DROP TRIGGER IF EXISTS update_system_connection_updated_at ON public.system_connection;
CREATE TRIGGER update_system_connection_updated_at
  BEFORE UPDATE ON public.system_connection
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auth trigger for auto-creating profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();