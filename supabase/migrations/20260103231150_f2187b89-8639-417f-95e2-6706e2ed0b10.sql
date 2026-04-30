-- Create user_settings table to store personalized settings per user
CREATE TABLE public.user_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text DEFAULT 'dark',
  custom_theme_colors jsonb DEFAULT NULL,
  display_settings jsonb DEFAULT NULL,
  layout_settings jsonb DEFAULT NULL,
  header_settings jsonb DEFAULT NULL,
  sidebar_settings jsonb DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own settings"
ON public.user_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
ON public.user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
ON public.user_settings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
ON public.user_settings
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();