import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";

export interface HeaderItem {
  id: string;
  title: string;
  iconName: string;
  enabled: boolean;
  displayType?: "toggle" | "button" | "dropdown";
  value1?: string;
  value2?: string;
  currentValue?: string;
}

interface HeaderSettings {
  items: HeaderItem[];
  maxItems: number;
}

interface HeaderSettingsContextType {
  settings: HeaderSettings;
  toggleItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<HeaderItem>) => void;
  getEnabledItems: () => HeaderItem[];
  resetToDefaults: () => void;
  isLoading: boolean;
}

const defaultSettings: HeaderSettings = {
  maxItems: 2,
  items: [
    {
      id: "theme",
      title: "Theme",
      iconName: "Sun",
      enabled: true,
      displayType: "toggle",
      value1: "Light",
      value2: "Dark",
      currentValue: "Dark",
    },
    {
      id: "notification",
      title: "Notification",
      iconName: "Bell",
      enabled: false,
    },
    {
      id: "language",
      title: "Language",
      iconName: "Globe",
      enabled: false,
      displayType: "dropdown",
    },
  ],
};

const STORAGE_KEY = "oneapp-header-settings";

const HeaderSettingsContext = createContext<HeaderSettingsContextType | undefined>(undefined);

export function HeaderSettingsProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuthSafe();
  const [settings, setSettings] = useState<HeaderSettings>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return { ...defaultSettings, ...parsed };
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
  const saveSettings = useCallback(async (newSettings: HeaderSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    
    if (user) {
      try {
        await supabase
          .from("user_settings")
          .upsert([{ 
            user_id: user.id, 
            header_settings: JSON.parse(JSON.stringify(newSettings))
          }]);
      } catch (error) {
        console.error("Error saving header settings:", error);
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
        .select("header_settings")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.header_settings && typeof data.header_settings === 'object') {
        const headerData = data.header_settings as Record<string, unknown>;
        const dbSettings: HeaderSettings = {
          maxItems: typeof headerData.maxItems === 'number' ? headerData.maxItems : defaultSettings.maxItems,
          items: Array.isArray(headerData.items) ? (headerData.items as HeaderItem[]) : defaultSettings.items,
        };
        setSettings(dbSettings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dbSettings));
      }
    } catch (error) {
      console.error("Error fetching header settings:", error);
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

  const toggleItem = (id: string) => {
    const enabledCount = settings.items.filter((i) => i.enabled).length;
    const item = settings.items.find((i) => i.id === id);
    
    if (!item) return;
    
    if (!item.enabled && enabledCount >= settings.maxItems) {
      return;
    }

    const newSettings = {
      ...settings,
      items: settings.items.map((i) =>
        i.id === id ? { ...i, enabled: !i.enabled } : i
      ),
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const updateItem = (id: string, updates: Partial<HeaderItem>) => {
    const newSettings = {
      ...settings,
      items: settings.items.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const getEnabledItems = () => {
    return settings.items.filter((i) => i.enabled);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
  };

  return (
    <HeaderSettingsContext.Provider
      value={{
        settings,
        toggleItem,
        updateItem,
        getEnabledItems,
        resetToDefaults,
        isLoading,
      }}
    >
      {children}
    </HeaderSettingsContext.Provider>
  );
}

export function useHeaderSettings() {
  const context = useContext(HeaderSettingsContext);
  if (context === undefined) {
    throw new Error("useHeaderSettings must be used within a HeaderSettingsProvider");
  }
  return context;
}

export { defaultSettings };
