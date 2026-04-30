import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";

export interface NoteTag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export function useNoteTags() {
  const [tags, setTags] = useState<NoteTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchTags = useCallback(async () => {
    if (!user) { setTags([]); setIsLoading(false); return; }
    try {
      const { data, error } = await supabase.from("note_tags").select("*").order("name");
      if (error) throw error;
      setTags((data as NoteTag[]) || []);
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  const createTag = async (name: string, color: string = "#3b82f6") => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from("note_tags")
        .insert({ user_id: user.id, name, color })
        .select()
        .single();
      if (error) throw error;
      const tag = data as NoteTag;
      setTags(prev => [...prev, tag]);
      return tag;
    } catch (error) {
      console.error("Error creating tag:", error);
      return null;
    }
  };

  const deleteTag = async (id: string) => {
    try {
      const { error } = await supabase.from("note_tags").delete().eq("id", id);
      if (error) throw error;
      setTags(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting tag:", error);
      return false;
    }
  };

  // Tag links for a specific note
  const getNoteTags = async (noteId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from("note_tag_links")
        .select("tag_id")
        .eq("note_id", noteId);
      if (error) throw error;
      return (data || []).map((l: any) => l.tag_id);
    } catch { return []; }
  };

  const setNoteTags = async (noteId: string, tagIds: string[]) => {
    if (!user) return;
    try {
      // Remove existing
      await supabase.from("note_tag_links").delete().eq("note_id", noteId);
      // Insert new
      if (tagIds.length > 0) {
        const links = tagIds.map(tag_id => ({ note_id: noteId, tag_id, user_id: user.id }));
        await supabase.from("note_tag_links").insert(links);
      }
    } catch (error) {
      console.error("Error setting note tags:", error);
    }
  };

  return { tags, isLoading, createTag, deleteTag, getNoteTags, setNoteTags, refetch: fetchTags };
}
