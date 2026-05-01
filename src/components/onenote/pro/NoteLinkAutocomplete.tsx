import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  position: { top: number; left: number };
  initialQuery?: string;
  onSelect: (note: { id: string; title: string }) => void;
  onClose: () => void;
}

interface NoteRow {
  id: string;
  title: string;
}

/**
 * Floating cmdk picker invoked when the user types `[[` in a block.
 * Lists notes owned by the current user matching the query.
 */
export function NoteLinkAutocomplete({ position, initialQuery = "", onSelect, onClose }: Props) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const { data: notes = [] } = useQuery<NoteRow[]>({
    queryKey: ["note_links", "picker", user?.id, query],
    queryFn: async () => {
      if (!user) return [];
      let q = supabase.from("notes").select("id, title").eq("user_id", user.id).limit(8);
      if (query) q = q.ilike("title", `%${query}%`);
      const { data, error } = await q.order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as NoteRow[];
    },
    enabled: !!user,
    staleTime: 10_000,
  });

  return (
    <div
      className="fixed z-[100] w-72 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <Command shouldFilter={false}>
        <div className="px-2 py-1.5 border-b border-border">
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder={t("onenote.linkPicker.placeholder")}
            className="w-full text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
        <Command.List className="max-h-56 overflow-y-auto p-1">
          <Command.Empty className="py-3 text-center text-xs text-muted-foreground">
            {t("onenote.linkPicker.empty")}
          </Command.Empty>
          {notes.map((n) => (
            <Command.Item
              key={n.id}
              value={n.title || n.id}
              onSelect={() => onSelect(n)}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-foreground cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
            >
              <span className="text-muted-foreground">[[</span>
              <span className="truncate">{n.title || "Untitled"}</span>
              <span className="text-muted-foreground">]]</span>
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}
