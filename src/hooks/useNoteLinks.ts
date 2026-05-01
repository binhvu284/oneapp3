import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";

export interface NoteLink {
  id: string;
  source_note_id: string;
  target_note_id: string;
  user_id: string;
  created_at: string;
}

export interface BacklinkRow extends NoteLink {
  source: { id: string; title: string } | null;
}

const BACKLINKS_KEY = (noteId: string | null) => ["note_links", "backlinks", noteId];

/**
 * Backlinks for a note — rows in note_links where target = noteId, joined with
 * the source note's title. Subscribes to realtime changes on note_links.
 */
export function useBacklinks(noteId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<BacklinkRow[]>({
    queryKey: BACKLINKS_KEY(noteId),
    queryFn: async () => {
      if (!noteId) return [];
      const { data, error } = await supabase
        .from("note_links")
        .select("id, source_note_id, target_note_id, user_id, created_at, source:notes!note_links_source_note_id_fkey(id, title)")
        .eq("target_note_id", noteId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as BacklinkRow[];
    },
    enabled: !!user && !!noteId,
  });

  useEffect(() => {
    if (!user || !noteId) return;
    const channel = supabase
      .channel(`note_links-backlinks-${noteId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "note_links", filter: `target_note_id=eq.${noteId}` },
        () => queryClient.invalidateQueries({ queryKey: BACKLINKS_KEY(noteId) })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, noteId, queryClient]);

  return query;
}

/**
 * Resolve a list of `[[target title]]` strings to note ids the user owns.
 * Titles that don't match any note are returned as `unresolved` so the caller
 * can render a broken-link affordance.
 */
export function useResolveLinkTitles(titles: string[]) {
  const { user } = useAuth();
  const key = useMemo(() => titles.slice().sort(), [titles]);

  return useQuery({
    queryKey: ["note_links", "resolve", user?.id, key],
    queryFn: async () => {
      if (!user || titles.length === 0) return { resolved: {} as Record<string, string>, unresolved: [] as string[] };
      const { data, error } = await supabase
        .from("notes")
        .select("id, title")
        .eq("user_id", user.id)
        .in("title", titles);
      if (error) throw error;
      const resolved: Record<string, string> = {};
      for (const row of data ?? []) {
        resolved[(row as { title: string }).title] = (row as { id: string }).id;
      }
      const unresolved = titles.filter(t => !(t in resolved));
      return { resolved, unresolved };
    },
    enabled: !!user,
    staleTime: 15_000,
  });
}

/**
 * Persist outbound links for a note. Calls the sync_note_links RPC which
 * removes deleted edges and inserts new ones inside a single transaction.
 */
export async function syncNoteLinks(noteId: string, targetIds: string[]) {
  const { error } = await supabase.rpc("sync_note_links", {
    p_source: noteId,
    p_targets: targetIds,
  });
  if (error) throw error;
}
