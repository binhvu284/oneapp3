-- Add icon_url column to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon_url text;

-- Create junction table for many-to-many relationship between apps and categories
CREATE TABLE public.app_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES public.in_use_apps(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(app_id, category_id)
);

-- Enable RLS on app_categories
ALTER TABLE public.app_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for app_categories
CREATE POLICY "Users can view own app_categories"
ON public.app_categories
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own app_categories"
ON public.app_categories
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own app_categories"
ON public.app_categories
FOR DELETE
USING (auth.uid() = user_id);

-- Remove category column from in_use_apps (no longer needed)
ALTER TABLE public.in_use_apps DROP COLUMN IF EXISTS category;