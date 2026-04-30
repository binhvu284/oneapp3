import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";
import { toast } from "@/hooks/use-toast";

export interface NoteFolder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  icon_name: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useNoteFolders() {
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchFolders = useCallback(async () => {
    if (!user) { setFolders([]); setIsLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("note_folders")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setFolders((data as NoteFolder[]) || []);
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchFolders(); }, [fetchFolders]);

  const createFolder = async (name: string, parentId: string | null = null) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from("note_folders")
        .insert({ user_id: user.id, name, parent_id: parentId })
        .select()
        .single();
      if (error) throw error;
      const folder = data as NoteFolder;
      setFolders(prev => [...prev, folder]);
      return folder;
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({ title: "Error", description: "Failed to create folder", variant: "destructive" });
      return null;
    }
  };

  const updateFolder = async (id: string, updates: Partial<NoteFolder>) => {
    try {
      const { error } = await supabase.from("note_folders").update(updates).eq("id", id);
      if (error) throw error;
      setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
      return true;
    } catch (error) {
      console.error("Error updating folder:", error);
      return false;
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      const { error } = await supabase.from("note_folders").delete().eq("id", id);
      if (error) throw error;
      setFolders(prev => prev.filter(f => f.id !== id));
      toast({ title: "Deleted", description: "Folder deleted" });
      return true;
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({ title: "Error", description: "Failed to delete folder", variant: "destructive" });
      return false;
    }
  };

  // Build tree structure
  const getFolderTree = useCallback(() => {
    const rootFolders = folders.filter(f => !f.parent_id);
    const getChildren = (parentId: string): NoteFolder[] =>
      folders.filter(f => f.parent_id === parentId);
    return { rootFolders, getChildren };
  }, [folders]);

  return { folders, isLoading, createFolder, updateFolder, deleteFolder, getFolderTree, refetch: fetchFolders };
}
