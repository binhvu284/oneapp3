-- Create enum for app status
CREATE TYPE public.app_status AS ENUM ('available', 'disable', 'developing');

-- Create in_use_apps table
CREATE TABLE public.in_use_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  icon_url TEXT,
  app_image_url TEXT,
  route TEXT NOT NULL,
  category TEXT,
  status app_status NOT NULL DEFAULT 'developing',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.in_use_apps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own in_use_apps"
ON public.in_use_apps
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own in_use_apps"
ON public.in_use_apps
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own in_use_apps"
ON public.in_use_apps
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own in_use_apps"
ON public.in_use_apps
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_in_use_apps_updated_at
BEFORE UPDATE ON public.in_use_apps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();