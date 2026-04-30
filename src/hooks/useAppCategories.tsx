import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";

export interface AppCategory {
  id: string;
  app_id: string;
  category_id: string;
  user_id: string;
  created_at: string;
}

export function useAppCategories() {
  const { user } = useAuth();
  const [appCategories, setAppCategories] = useState<AppCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppCategories = useCallback(async () => {
    if (!user) {
      setAppCategories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_categories')
        .select('*');

      if (error) throw error;
      setAppCategories(data || []);
    } catch (err) {
      console.error('Error fetching app categories:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get category IDs for an app
  const getCategoryIdsForApp = useCallback((appId: string): string[] => {
    return appCategories
      .filter(ac => ac.app_id === appId)
      .map(ac => ac.category_id);
  }, [appCategories]);

  // Get app IDs for a category
  const getAppIdsForCategory = useCallback((categoryId: string): string[] => {
    return appCategories
      .filter(ac => ac.category_id === categoryId)
      .map(ac => ac.app_id);
  }, [appCategories]);

  // Get apps count for a category
  const getAppsCountForCategory = useCallback((categoryId: string): number => {
    return appCategories.filter(ac => ac.category_id === categoryId).length;
  }, [appCategories]);

  // Add app to category
  const addAppToCategory = async (appId: string, categoryId: string) => {
    if (!user) return null;

    // Check if already exists
    const exists = appCategories.some(
      ac => ac.app_id === appId && ac.category_id === categoryId
    );
    if (exists) return null;

    try {
      const { data, error } = await supabase
        .from('app_categories')
        .insert({
          app_id: appId,
          category_id: categoryId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setAppCategories(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding app to category:', err);
      return null;
    }
  };

  // Remove app from category
  const removeAppFromCategory = async (appId: string, categoryId: string) => {
    try {
      const { error } = await supabase
        .from('app_categories')
        .delete()
        .eq('app_id', appId)
        .eq('category_id', categoryId);

      if (error) throw error;
      setAppCategories(prev => 
        prev.filter(ac => !(ac.app_id === appId && ac.category_id === categoryId))
      );
      return true;
    } catch (err) {
      console.error('Error removing app from category:', err);
      return false;
    }
  };

  // Set all categories for an app (replaces existing)
  const setAppCategories_ = async (appId: string, categoryIds: string[]) => {
    if (!user) return false;

    try {
      // Delete existing categories for this app
      const { error: deleteError } = await supabase
        .from('app_categories')
        .delete()
        .eq('app_id', appId);

      if (deleteError) throw deleteError;

      // Insert new categories
      if (categoryIds.length > 0) {
        const insertData = categoryIds.map(categoryId => ({
          app_id: appId,
          category_id: categoryId,
          user_id: user.id,
        }));

        const { data, error: insertError } = await supabase
          .from('app_categories')
          .insert(insertData)
          .select();

        if (insertError) throw insertError;

        // Update local state
        setAppCategories(prev => {
          const filtered = prev.filter(ac => ac.app_id !== appId);
          return [...filtered, ...(data || [])];
        });
      } else {
        // Just remove from local state
        setAppCategories(prev => prev.filter(ac => ac.app_id !== appId));
      }

      return true;
    } catch (err) {
      console.error('Error setting app categories:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchAppCategories();
  }, [fetchAppCategories]);

  return {
    appCategories,
    loading,
    getCategoryIdsForApp,
    getAppIdsForCategory,
    getAppsCountForCategory,
    addAppToCategory,
    removeAppFromCategory,
    setAppCategories: setAppCategories_,
    refetch: fetchAppCategories,
  };
}
