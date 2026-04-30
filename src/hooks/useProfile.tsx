import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource } from "@/hooks/useAuthSource";
import { toast } from "sonner";

export interface Profile {
  id: string;
  display_name: string | null;
  nickname: string | null;
  phone: string | null;
  avatar_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user, isAuthenticated } = useAuthSource();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const fetchProfile = async () => {
    if (!isAuthenticated || !user?.id) return;

    try {
      setIsLoading(true);
      // Fetch from oneapp_users table (primary source) instead of profiles
      const { data, error } = await supabase
        .from("oneapp_users")
        .select("id, display_name, nickname, phone, avatar_url, github_url, twitter_url, linkedin_url, website_url, bio, created_at, updated_at")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data as Profile | null);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!isAuthenticated || !user?.id) return { error: new Error("Not authenticated") };

    try {
      // Update oneapp_users table (primary source)
      const { error } = await supabase
        .from("oneapp_users")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      toast.success("Profile updated successfully");
      return { error: null };
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      return { error };
    }
  };

  return {
    profile,
    isLoading,
    updateProfile,
    refetch: fetchProfile,
  };
}
