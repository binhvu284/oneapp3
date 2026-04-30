import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";

export type LayoutStyle = "default" | "block";

interface LayoutSettings {
  sidebarWidth: number;
  headerHeight: number;
  layoutStyle: LayoutStyle;
}

interface LayoutSettingsContextType {
  settings: LayoutSettings;
  setSidebarWidth: (width: number) => void;
  setHeaderHeight: (height: number) => void;
  setLayoutStyle: (style: LayoutStyle) => void;
  resetToDefaults: () => void;
  isLoading: boolean;
}

const defaultSettings: LayoutSettings = {
  sidebarWidth: 256,
  headerHeight: 48,
  layoutStyle: "default",
};

const STORAGE_KEY = "oneapp-layout-settings";

const LayoutSettingsContext = createContext<LayoutSettingsContextType | undefined>(undefined);

export function LayoutSettingsProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuthSafe();
  const [settings, setSettings] = useState<LayoutSettings>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return { ...defaultSettings, ...JSON.parse(stored) };
        } catch {
          return defaultSettings;
        }
      }
    }
    return defaultSettings;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Save to localStorage and database
  const saveSettings = useCallback(async (newSettings: LayoutSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    
    if (user) {
      try {
        await supabase
          .from("user_settings")
          .upsert([{ 
            user_id: user.id, 
            layout_settings: JSON.parse(JSON.stringify(newSettings))
          }]);
      } catch (error) {
        console.error("Error saving layout settings:", error);
      }
    }
  }, [user]);

  // Fetch from database
  const fetchSettings = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("layout_settings")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.layout_settings && typeof data.layout_settings === 'object') {
        const layoutData = data.layout_settings as Record<string, unknown>;
        const dbSettings: LayoutSettings = {
          sidebarWidth: typeof layoutData.sidebarWidth === 'number' ? layoutData.sidebarWidth : defaultSettings.sidebarWidth,
          headerHeight: typeof layoutData.headerHeight === 'number' ? layoutData.headerHeight : defaultSettings.headerHeight,
          layoutStyle: layoutData.layoutStyle === 'block' ? 'block' : 'default',
        };
        setSettings(dbSettings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dbSettings));
      }
    } catch (error) {
      console.error("Error fetching layout settings:", error);
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user && !initialized) {
      fetchSettings();
    } else if (!authLoading && !user) {
      setIsLoading(false);
      setInitialized(false);
    }
  }, [user, authLoading, initialized, fetchSettings]);

  const setSidebarWidth = (width: number) => {
    const newSettings = { ...settings, sidebarWidth: Math.min(400, Math.max(200, width)) };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const setHeaderHeight = (height: number) => {
    const newSettings = { ...settings, headerHeight: Math.min(80, Math.max(48, height)) };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const setLayoutStyle = (style: LayoutStyle) => {
    const newSettings = { ...settings, layoutStyle: style };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
  };

  return (
    <LayoutSettingsContext.Provider
      value={{
        settings,
        setSidebarWidth,
        setHeaderHeight,
        setLayoutStyle,
        resetToDefaults,
        isLoading,
      }}
    >
      {children}
    </LayoutSettingsContext.Provider>
  );
}

export function useLayoutSettings() {
  const context = useContext(LayoutSettingsContext);
  if (context === undefined) {
    throw new Error("useLayoutSettings must be used within a LayoutSettingsProvider");
  }
  return context;
}

export { defaultSettings };
