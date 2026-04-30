import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";

export interface NoteItem {
  id: string;
  note_id: string;
  user_id: string;
  content: string;
  is_completed: boolean;
  sort_order: number;
  due_date: string | null;
  priority: string | null;
  parent_item_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useNoteItems(noteId: string | null) {
  const [items, setItems] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchItems = useCallback(async () => {
    if (!noteId || !user) { setItems([]); return; }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("note_items")
        .select("*")
        .eq("note_id", noteId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setItems((data as NoteItem[]) || []);
    } catch (error) {
      console.error("Error fetching note items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [noteId, user]);

  const addItem = async (content: string = "") => {
    if (!noteId || !user) return null;
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) + 1 : 0;
    try {
      const { data, error } = await supabase
        .from("note_items")
        .insert({ note_id: noteId, user_id: user.id, content, sort_order: maxOrder })
        .select()
        .single();
      if (error) throw error;
      const item = data as NoteItem;
      setItems(prev => [...prev, item]);
      return item;
    } catch (error) {
      console.error("Error adding item:", error);
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<NoteItem>) => {
    try {
      const { error } = await supabase.from("note_items").update(updates).eq("id", id);
      if (error) throw error;
      setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
      return true;
    } catch (error) {
      console.error("Error updating item:", error);
      return false;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from("note_items").delete().eq("id", id);
      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting item:", error);
      return false;
    }
  };

  const reorderItems = async (reordered: NoteItem[]) => {
    setItems(reordered);
    // Batch update sort_order
    for (let i = 0; i < reordered.length; i++) {
      await supabase.from("note_items").update({ sort_order: i }).eq("id", reordered[i].id);
    }
  };

  return { items, isLoading, fetchItems, addItem, updateItem, deleteItem, reorderItems };
}
