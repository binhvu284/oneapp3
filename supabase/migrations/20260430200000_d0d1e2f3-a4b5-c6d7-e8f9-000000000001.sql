-- OneApp 3 — Phase 1 schema (OneNote 3.0)
-- Adds: note_links table, notes columns (is_bookmarked, note_date, last_opened_at;
-- relies on existing note_type column), note_tags.metadata jsonb, sync_note_links RPC.

-- 1. note_links — bi-directional wiki-style linking between notes
CREATE TABLE IF NOT EXISTS public.note_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_note_id uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  target_note_id uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_note_id, target_note_id)
);

CREATE INDEX IF NOT EXISTS note_links_target_idx ON public.note_links(target_note_id);
CREATE INDEX IF NOT EXISTS note_links_source_idx ON public.note_links(source_note_id);

ALTER TABLE public.note_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own note_links"
  ON public.note_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own note_links"
  ON public.note_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own note_links"
  ON public.note_links FOR DELETE USING (auth.uid() = user_id);

-- 2. notes — new columns supporting bookmarks, daily briefing, and aging
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS is_bookmarked boolean NOT NULL DEFAULT false;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS note_date date;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS last_opened_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS notes_daily_briefing_uniq
  ON public.notes(user_id, note_date)
  WHERE note_type = 'daily_briefing';

CREATE INDEX IF NOT EXISTS notes_bookmarked_idx
  ON public.notes(user_id)
  WHERE is_bookmarked = true;

-- 3. note_tags — metadata jsonb for energy_level routing (M7)
ALTER TABLE public.note_tags ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 4. sync_note_links — diff outbound links and upsert/delete in one transaction.
-- Caller passes the full target list for a given source note; rows not in the
-- list are removed, missing rows are inserted. Owner-checked via SECURITY DEFINER
-- with explicit user_id guard.
CREATE OR REPLACE FUNCTION public.sync_note_links(p_source uuid, p_targets uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT user_id INTO v_user_id FROM public.notes WHERE id = p_source;
  IF v_user_id IS NULL OR v_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'sync_note_links: source note not owned by caller';
  END IF;

  DELETE FROM public.note_links
   WHERE source_note_id = p_source
     AND NOT (target_note_id = ANY (COALESCE(p_targets, ARRAY[]::uuid[])));

  INSERT INTO public.note_links (source_note_id, target_note_id, user_id)
  SELECT p_source, t, v_user_id
    FROM unnest(COALESCE(p_targets, ARRAY[]::uuid[])) AS t
   WHERE EXISTS (SELECT 1 FROM public.notes WHERE id = t AND user_id = v_user_id)
  ON CONFLICT (source_note_id, target_note_id) DO NOTHING;
END;
$$;
