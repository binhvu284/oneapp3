
-- ============================================================================
-- OneNote Tables
-- ============================================================================

-- 1. Notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  note_type TEXT NOT NULL DEFAULT 'note',
  color TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  parent_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Note items (todo items inside a note)
CREATE TABLE public.note_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT DEFAULT '',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  due_date TIMESTAMPTZ,
  priority TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Note tags
CREATE TABLE public.note_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Note tag links (many-to-many)
CREATE TABLE public.note_tag_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.note_tags(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  UNIQUE(note_id, tag_id)
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_note_items_note_id ON public.note_items(note_id);
CREATE INDEX idx_note_items_user_id ON public.note_items(user_id);
CREATE INDEX idx_note_tags_user_id ON public.note_tags(user_id);
CREATE INDEX idx_note_tag_links_note_id ON public.note_tag_links(note_id);
CREATE INDEX idx_note_tag_links_user_id ON public.note_tag_links(user_id);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tag_links ENABLE ROW LEVEL SECURITY;

-- Notes policies
CREATE POLICY "Users can view own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- Note items policies
CREATE POLICY "Users can view own note_items" ON public.note_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own note_items" ON public.note_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own note_items" ON public.note_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own note_items" ON public.note_items FOR DELETE USING (auth.uid() = user_id);

-- Note tags policies
CREATE POLICY "Users can view own note_tags" ON public.note_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own note_tags" ON public.note_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own note_tags" ON public.note_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own note_tags" ON public.note_tags FOR DELETE USING (auth.uid() = user_id);

-- Note tag links policies
CREATE POLICY "Users can view own note_tag_links" ON public.note_tag_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own note_tag_links" ON public.note_tag_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own note_tag_links" ON public.note_tag_links FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- Triggers (reuse existing update_updated_at_column function)
-- ============================================================================
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_note_items_updated_at
  BEFORE UPDATE ON public.note_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Realtime
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.note_items;
