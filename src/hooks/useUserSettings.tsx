import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";

interface UserSettings {
  theme: string;
  custom_theme_colors: any;
  display_settings: any;
  layout_settings: any;
  header_settings: any;
  sidebar_settings: any;
}

interface UserSettingsContextType {
  settings: UserSettings | null;
  isLoading: boolean;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

const defaultSettings: UserSettings = {
  theme: "dark",
  custom_theme_colors: null,
  display_settings: null,
  layout_settings: null,
  header_settings: null,
  sidebar_settings: null,
};

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch settings from database
  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          theme: data.theme || "dark",
          custom_theme_colors: data.custom_theme_colors,
          display_settings: data.display_settings,
          layout_settings: data.layout_settings,
          header_settings: data.header_settings,
          sidebar_settings: data.sidebar_settings,
        });
      } else {
        // Create default settings for user
        const { data: newData, error: insertError } = await supabase
          .from("user_settings")
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;

        setSettings({
          theme: newData.theme || "dark",
          custom_theme_colors: newData.custom_theme_colors,
          display_settings: newData.display_settings,
          layout_settings: newData.layout_settings,
          header_settings: newData.header_settings,
          sidebar_settings: newData.sidebar_settings,
        });
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
      setSettings(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Update a specific setting
  const updateSetting = useCallback(async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_settings")
        .update({ [key]: value })
        .eq("user_id", user.id);

      if (error) throw error;

      setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
    }
  }, [user]);

  const refreshSettings = useCallback(async () => {
    setIsLoading(true);
    await fetchSettings();
  }, [fetchSettings]);

  // Fetch settings when user changes
  useEffect(() => {
    if (!authLoading) {
      fetchSettings();
    }
  }, [user, authLoading, fetchSettings]);

  return (
    <UserSettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateSetting,
        refreshSettings,
      }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error("useUserSettings must be used within a UserSettingsProvider");
  }
  return context;
}
