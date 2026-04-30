import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";
import { FileText, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

export default function NotesWidget() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("notes")
          .select("id, title, content, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(4);

        if (error) throw error;
        setNotes(data || []);
      } catch (err) {
        console.error("Error fetching notes for widget:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin pr-1 pb-1">
        {notes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-muted-foreground text-center">No notes found.</span>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              onClick={() => navigate(`/apps/onenote?id=${note.id}`)}
              className="group flex flex-col gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-xs font-medium text-foreground truncate">{note.title || "Untitled Note"}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              <div className="flex items-center justify-between pl-5 pr-1">
                <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                  {note.content?.replace(/<[^>]*>?/gm, '').substring(0, 30) || "Empty note"}
                </span>
                <span className="text-[9px] text-muted-foreground/60 whitespace-nowrap ml-2">
                  {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
