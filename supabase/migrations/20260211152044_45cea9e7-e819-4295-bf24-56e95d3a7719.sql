
-- 1. Add folder_id to notes
ALTER TABLE public.notes ADD COLUMN folder_id uuid DEFAULT NULL;

-- 2. Note folders table
CREATE TABLE public.note_folders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT '',
  parent_id uuid DEFAULT NULL REFERENCES public.note_folders(id) ON DELETE CASCADE,
  icon_name text DEFAULT 'Folder',
  color text DEFAULT '#3b82f6',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.note_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own folders" ON public.note_folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own folders" ON public.note_folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own folders" ON public.note_folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own folders" ON public.note_folders FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_note_folders_updated_at BEFORE UPDATE ON public.note_folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add FK from notes to note_folders
ALTER TABLE public.notes ADD CONSTRAINT notes_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.note_folders(id) ON DELETE SET NULL;

-- 3. Note reminders table
CREATE TABLE public.note_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  note_id uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  remind_at timestamptz NOT NULL,
  is_dismissed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.note_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders" ON public.note_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reminders" ON public.note_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON public.note_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders" ON public.note_reminders FOR DELETE USING (auth.uid() = user_id);

-- 4. Note templates table
CREATE TABLE public.note_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid DEFAULT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  content text DEFAULT '',
  note_type text NOT NULL DEFAULT 'note',
  icon_name text DEFAULT 'FileText',
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.note_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates" ON public.note_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view system templates" ON public.note_templates FOR SELECT USING (is_system = true);
CREATE POLICY "Users can create own templates" ON public.note_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON public.note_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.note_templates FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_note_templates_updated_at BEFORE UPDATE ON public.note_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed system templates
INSERT INTO public.note_templates (name, description, content, note_type, icon_name, is_system) VALUES
('Meeting Notes', 'Template for meeting notes', '{"blocks":[{"id":"1","type":"heading","level":1,"content":"Meeting Notes"},{"id":"2","type":"heading","level":2,"content":"Attendees"},{"id":"3","type":"paragraph","content":""},{"id":"4","type":"heading","level":2,"content":"Agenda"},{"id":"5","type":"paragraph","content":""},{"id":"6","type":"heading","level":2,"content":"Action Items"},{"id":"7","type":"checklist","items":[]}]}', 'note', 'Users', true),
('Daily Journal', 'Daily reflection template', '{"blocks":[{"id":"1","type":"heading","level":1,"content":"Daily Journal"},{"id":"2","type":"heading","level":2,"content":"Highlights"},{"id":"3","type":"paragraph","content":""},{"id":"4","type":"heading","level":2,"content":"Challenges"},{"id":"5","type":"paragraph","content":""},{"id":"6","type":"heading","level":2,"content":"Tomorrow''s Goals"},{"id":"7","type":"paragraph","content":""}]}', 'note', 'BookOpen', true),
('Project Plan', 'Project planning template', '{"blocks":[{"id":"1","type":"heading","level":1,"content":"Project Plan"},{"id":"2","type":"heading","level":2,"content":"Overview"},{"id":"3","type":"paragraph","content":""},{"id":"4","type":"heading","level":2,"content":"Timeline"},{"id":"5","type":"paragraph","content":""},{"id":"6","type":"heading","level":2,"content":"Tasks"},{"id":"7","type":"checklist","items":[]},{"id":"8","type":"heading","level":2,"content":"Resources"},{"id":"9","type":"paragraph","content":""}]}', 'note', 'Target', true),
('Weekly Review', 'Weekly review and planning', '{"blocks":[{"id":"1","type":"heading","level":1,"content":"Weekly Review"},{"id":"2","type":"heading","level":2,"content":"Accomplishments"},{"id":"3","type":"paragraph","content":""},{"id":"4","type":"heading","level":2,"content":"Lessons Learned"},{"id":"5","type":"paragraph","content":""},{"id":"6","type":"heading","level":2,"content":"Next Week Goals"},{"id":"7","type":"checklist","items":[]}]}', 'note', 'Calendar', true),
('Bug Report', 'Bug report template', '{"blocks":[{"id":"1","type":"heading","level":1,"content":"Bug Report"},{"id":"2","type":"heading","level":2,"content":"Description"},{"id":"3","type":"paragraph","content":""},{"id":"4","type":"heading","level":2,"content":"Steps to Reproduce"},{"id":"5","type":"paragraph","content":"1. "},{"id":"6","type":"heading","level":2,"content":"Expected Behavior"},{"id":"7","type":"paragraph","content":""},{"id":"8","type":"heading","level":2,"content":"Actual Behavior"},{"id":"9","type":"paragraph","content":""}]}', 'note', 'Bug', true);

-- 5. Note shares table
CREATE TABLE public.note_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  share_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.note_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shares" ON public.note_shares FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own shares" ON public.note_shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shares" ON public.note_shares FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shares" ON public.note_shares FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public can view active shares" ON public.note_shares FOR SELECT USING (is_active = true);
