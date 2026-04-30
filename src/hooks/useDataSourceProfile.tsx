import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource } from "@/hooks/useAuthSource";
import { getCachedSystemConnection } from "@/hooks/useSystemConnection";
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

/**
 * Data-Source-Aware Profile Hook
 * 
 * Uses oneapp_users as the primary profile source (since we use custom auth).
 * Falls back to profiles table for Lovable-only mode.
 */
export function useDataSourceProfile() {
  const { authMode, user, hasExternalConnection, oneappToken, updateUser } = useAuthSource();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"lovable" | "external" | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      setProfile(null);
      return;
    }

    try {
      setIsLoading(true);
      console.log(`[useDataSourceProfile] Fetching profile for ${user.id.substring(0, 8)}... (mode: ${authMode})`);

      // For oneapp/external mode, get profile from oneapp_users via edge function
      if ((authMode === "oneapp" || authMode === "external") && oneappToken) {
        // The user object from auth already has display_name, nickname, etc.
        // Build profile from user data
        setProfile({
          id: user.id,
          display_name: user.display_name || null,
          nickname: user.nickname || null,
          phone: null,
          avatar_url: user.avatar_url || null,
          github_url: null,
          twitter_url: null,
          linkedin_url: null,
          website_url: null,
          bio: null,
          created_at: user.created_at,
          updated_at: user.created_at,
        });
        setDataSource(authMode === "external" ? "external" : "lovable");

        // Also try to get full profile from oneapp_users
        try {
          const cachedConnection = authMode === "external" && hasExternalConnection
            ? getCachedSystemConnection()
            : null;

          const body: Record<string, unknown> = {
            action: "query",
            table: "oneapp_users",
            options: {
              select: "id,display_name,nickname,phone,avatar_url,github_url,twitter_url,linkedin_url,website_url,bio,created_at,updated_at",
              filters: [{ column: "id", operator: "eq", value: user.id }],
              single: true,
            },
          };

          if (cachedConnection?.supabase_url && cachedConnection?.supabase_service_key) {
            body.supabase_url = cachedConnection.supabase_url;
            body.supabase_service_key = cachedConnection.supabase_service_key;
          } else {
            // Use Lovable Cloud via data-query — but we need URL/key
            // Fallback: query profiles table directly
            await fetchFromLovable(user.id);
            return;
          }

          const { data, error } = await supabase.functions.invoke("data-query", { body });

          if (!error && data?.success && data?.result) {
            const row = data.result;
            setProfile({
              id: row.id,
              display_name: row.display_name,
              nickname: row.nickname,
              phone: row.phone,
              avatar_url: row.avatar_url,
              github_url: row.github_url,
              twitter_url: row.twitter_url,
              linkedin_url: row.linkedin_url,
              website_url: row.website_url,
              bio: row.bio,
              created_at: row.created_at,
              updated_at: row.updated_at,
            });
            setDataSource("external");
            console.log("[useDataSourceProfile] Full profile fetched from oneapp_users");
          }
        } catch (err) {
          console.warn("[useDataSourceProfile] Failed to fetch full profile:", err);
        }
      } else {
        // Lovable-only mode: query profiles table directly
        await fetchFromLovable(user.id);
      }
    } catch (error) {
      console.error("[useDataSourceProfile] Error fetching profile:", error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, authMode, hasExternalConnection, oneappToken]);

  const fetchFromLovable = async (userId: string) => {
    console.log("[useDataSourceProfile] Querying Lovable Cloud profiles...");
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[useDataSourceProfile] Lovable query error:", error);
      throw error;
    }

    setProfile(data);
    setDataSource("lovable");
    console.log("[useDataSourceProfile] Profile fetched from Lovable Cloud");
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) return { error: new Error("Not authenticated") };

    try {
      console.log(`[useDataSourceProfile] Updating profile (mode: ${authMode})`);

      // For oneapp/external mode, use oneapp-auth update-profile action
      if ((authMode === "oneapp" || authMode === "external") && oneappToken) {
        const body: Record<string, unknown> = {
          action: "update-profile",
          token: oneappToken,
          profile_data: updates,
        };

        // If external mode, pass external datasource
        if (authMode === "external" && hasExternalConnection) {
          const cachedConnection = getCachedSystemConnection();
          if (cachedConnection?.supabase_url && cachedConnection?.supabase_service_key) {
            body.datasource = "external";
            body.external_url = cachedConnection.supabase_url;
            body.external_service_key = cachedConnection.supabase_service_key;
          }
        }

        const { data, error } = await supabase.functions.invoke("oneapp-auth", { body });

        if (error || data?.error) {
          console.error("[useDataSourceProfile] Update error:", error || data?.error);
          toast.error("Failed to update profile");
          return { error: error || new Error(data?.error || "Update failed") };
        }

        // Update local state + auth context (so header refreshes)
        setProfile((prev) => prev ? { ...prev, ...updates } : null);
        updateUser({
          display_name: updates.display_name !== undefined ? updates.display_name : undefined,
          nickname: updates.nickname !== undefined ? updates.nickname : undefined,
          avatar_url: updates.avatar_url !== undefined ? updates.avatar_url : undefined,
        });
        toast.success("Profile updated successfully");
        return { error: null };
      } else {
        return await updateLovable(updates);
      }
    } catch (error) {
      console.error("[useDataSourceProfile] Error updating profile:", error);
      toast.error("Failed to update profile");
      return { error };
    }
  };

  const updateLovable = async (updates: Partial<Profile>) => {
    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user!.id,
          ...updates,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error("[useDataSourceProfile] Lovable upsert error:", error);
      toast.error("Failed to update profile");
      return { error };
    }

    setProfile((prev) => {
      if (prev) {
        return { ...prev, ...updates, updated_at: new Date().toISOString() };
      }
      return {
        id: user!.id,
        display_name: null,
        nickname: null,
        phone: null,
        avatar_url: null,
        github_url: null,
        twitter_url: null,
        linkedin_url: null,
        website_url: null,
        bio: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates,
      } as Profile;
    });
    
    // Also update auth context
    updateUser({
      display_name: updates.display_name !== undefined ? updates.display_name : undefined,
      nickname: updates.nickname !== undefined ? updates.nickname : undefined,
      avatar_url: updates.avatar_url !== undefined ? updates.avatar_url : undefined,
    });
    toast.success("Profile updated successfully");
    return { error: null };
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    updateProfile,
    refetch: fetchProfile,
    dataSource,
  };
}
