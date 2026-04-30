import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";
import { toast } from "@/hooks/use-toast";

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  note_type: string;
  color: string | null;
  is_pinned: boolean;
  is_archived: boolean;
  sort_order: number;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export type NoteFilter = "all" | "pinned" | "archived";
export type NoteSort = "newest" | "oldest" | "az" | "za";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<NoteFilter>("all");
  const [sort, setSort] = useState<NoteSort>("newest");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNotes = useCallback(async () => {
    if (!user) { setNotes([]); setIsLoading(false); return; }
    try {
      let query = supabase.from("notes").select("*");

      if (filter === "pinned") {
        query = query.eq("is_pinned", true).eq("is_archived", false);
      } else if (filter === "archived") {
        query = query.eq("is_archived", true);
      } else {
        query = query.eq("is_archived", false);
      }

      switch (sort) {
        case "newest": query = query.order("created_at", { ascending: false }); break;
        case "oldest": query = query.order("created_at", { ascending: true }); break;
        case "az": query = query.order("title", { ascending: true }); break;
        case "za": query = query.order("title", { ascending: false }); break;
      }

      const { data, error } = await query;
      if (error) throw error;

      let filtered = (data as Note[]) || [];

      // If tag filter, fetch note_tag_links to filter
      if (tagFilter) {
        const { data: links } = await supabase
          .from("note_tag_links")
          .select("note_id")
          .eq("tag_id", tagFilter);
        const noteIds = new Set((links || []).map((l: any) => l.note_id));
        filtered = filtered.filter(n => noteIds.has(n.id));
      }

      setNotes(filtered);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, filter, sort, tagFilter]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notes-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, () => {
        fetchNotes();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchNotes]);

  const createNote = async (data: Partial<Note> = {}) => {
    if (!user) return null;
    try {
      const { data: note, error } = await supabase
        .from("notes")
        .insert({ user_id: user.id, title: data.title || "", content: data.content || "", note_type: data.note_type || "note", color: data.color || null, ...data })
        .select()
        .single();
      if (error) throw error;
      await fetchNotes();
      return note as Note;
    } catch (error) {
      console.error("Error creating note:", error);
      toast({ title: "Error", description: "Failed to create note", variant: "destructive" });
      return null;
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from("notes").update(updates).eq("id", id);
      if (error) throw error;
      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
      return true;
    } catch (error) {
      console.error("Error updating note:", error);
      return false;
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
      setNotes(prev => prev.filter(n => n.id !== id));
      toast({ title: "Deleted", description: "Note deleted" });
      return true;
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({ title: "Error", description: "Failed to delete note", variant: "destructive" });
      return false;
    }
  };

  const togglePin = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) return updateNote(id, { is_pinned: !note.is_pinned });
    return false;
  };

  const toggleArchive = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      const result = await updateNote(id, { is_archived: !note.is_archived });
      if (result) await fetchNotes();
      return result;
    }
    return false;
  };

  return {
    notes, isLoading, filter, setFilter, sort, setSort, tagFilter, setTagFilter,
    createNote, updateNote, deleteNote, togglePin, toggleArchive, refetch: fetchNotes,
  };
}
