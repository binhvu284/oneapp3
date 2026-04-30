import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";

export interface NoteTemplate {
  id: string;
  user_id: string | null;
  name: string;
  description: string;
  content: string;
  note_type: string;
  icon_name: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export function useNoteTemplates() {
  const { user } = useAuth();

  const { data: templates = [], isLoading } = useQuery<NoteTemplate[]>({
    queryKey: ["note_templates", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("note_templates")
        .select("*")
        .order("is_system", { ascending: false })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as NoteTemplate[];
    },
    enabled: !!user,
  });

  const systemTemplates = templates.filter(t => t.is_system);
  const userTemplates = templates.filter(t => !t.is_system);

  return { templates, systemTemplates, userTemplates, isLoading };
}
