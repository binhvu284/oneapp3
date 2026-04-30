import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSource as useAuth } from '@/hooks/useAuthSource';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  icon_url: string | null;
  color: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string, description?: string, iconName?: string, color?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name,
          description: description || null,
          icon_name: iconName || 'Folder',
          color: color || '#3b82f6',
          sort_order: categories.length,
        })
        .select()
        .single();

      if (error) throw error;
      setCategories([...categories, data]);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCategories(categories.map(c => c.id === id ? data : c));
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const uploadCategoryIcon = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `category-icons/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("oneappdata").upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("oneappdata").getPublicUrl(filePath);
      return publicUrl;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    uploadCategoryIcon,
    refetch: fetchCategories,
  };
}
