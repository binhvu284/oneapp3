import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { FF_ONECOMMAND } from "@/lib/feature-flags";

export interface NavItem {
  id: string;
  title: string;
  url: string;
  iconName: string;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

interface SidebarSettings {
  basicItems: string[];
  customSections: NavSection[];
}

interface SidebarSettingsContextType {
  settings: SidebarSettings;
  toggleBasicItem: (id: string) => void;
  addSection: (label: string) => void;
  updateSection: (id: string, label: string) => void;
  deleteSection: (id: string) => void;
  addItemToSection: (sectionId: string, item: Omit<NavItem, "id">) => void;
  removeItemFromSection: (sectionId: string, itemId: string) => void;
  resetToDefaults: () => void;
  isLoading: boolean;
}

export const basicNavItems: NavItem[] = [
  { id: "dashboard", title: "Dashboard", url: "/", iconName: "LayoutDashboard" },
  { id: "notification", title: "Notification", url: "/notifications", iconName: "Bell" },
  { id: "library", title: "OneLibrary", url: "/library", iconName: "MonitorPlay" },
];

const defaultSettings: SidebarSettings = {
  basicItems: ["dashboard", "library"],
  customSections: [
    {
      id: "my-workspace",
      label: "MY WORKSPACE",
      items: [
        { id: "ws-data", title: "OneApp Data", url: "/developing/data", iconName: "Database" },
        { id: "ws-dev", title: "OneApp Developer", url: "/workspace/developer", iconName: "Zap" },
        { id: "ws-ai", title: "OneApp AI", url: "/developing/ai", iconName: "Sparkles" },
        { id: "ws-crypto", title: "OneCrypto", url: "/apps/crypto", iconName: "Bitcoin" },
        ...(FF_ONECOMMAND ? [{ id: "ws-onecommand", title: "OneCommand", url: "/apps/onecommand", iconName: "Terminal" }] : []),
      ],
    },
  ],
};

const STORAGE_KEY = "oneapp-sidebar-settings";

const SidebarSettingsContext = createContext<SidebarSettingsContextType | undefined>(undefined);

export function SidebarSettingsProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuthSafe();
  const [settings, setSettings] = useState<SidebarSettings>(() => {
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
  const saveSettings = useCallback(async (newSettings: SidebarSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    
    if (user) {
      try {
        await supabase
          .from("user_settings")
          .upsert([{ 
            user_id: user.id, 
            sidebar_settings: JSON.parse(JSON.stringify(newSettings))
          }]);
      } catch (error) {
        console.error("Error saving sidebar settings:", error);
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
        .select("sidebar_settings")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.sidebar_settings && typeof data.sidebar_settings === 'object') {
        const sidebarData = data.sidebar_settings as Record<string, unknown>;
        const dbSettings: SidebarSettings = {
          basicItems: Array.isArray(sidebarData.basicItems) ? (sidebarData.basicItems as string[]) : defaultSettings.basicItems,
          customSections: Array.isArray(sidebarData.customSections) ? (sidebarData.customSections as NavSection[]) : defaultSettings.customSections,
        };
        setSettings(dbSettings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dbSettings));
      }
    } catch (error) {
      console.error("Error fetching sidebar settings:", error);
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

  const toggleBasicItem = (id: string) => {
    const isEnabled = settings.basicItems.includes(id);
    let newSettings: SidebarSettings;
    
    if (isEnabled) {
      newSettings = { ...settings, basicItems: settings.basicItems.filter((i) => i !== id) };
    } else {
      if (settings.basicItems.length >= 3) return;
      newSettings = { ...settings, basicItems: [...settings.basicItems, id] };
    }
    
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const addSection = (label: string) => {
    const newSection: NavSection = {
      id: `section-${Date.now()}`,
      label: label.toUpperCase(),
      items: [],
    };
    const newSettings = {
      ...settings,
      customSections: [...settings.customSections, newSection],
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const updateSection = (id: string, label: string) => {
    const newSettings = {
      ...settings,
      customSections: settings.customSections.map((s) =>
        s.id === id ? { ...s, label: label.toUpperCase() } : s
      ),
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const deleteSection = (id: string) => {
    const newSettings = {
      ...settings,
      customSections: settings.customSections.filter((s) => s.id !== id),
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const addItemToSection = (sectionId: string, item: Omit<NavItem, "id">) => {
    const newItem: NavItem = { ...item, id: `item-${Date.now()}` };
    const newSettings = {
      ...settings,
      customSections: settings.customSections.map((s) =>
        s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
      ),
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const removeItemFromSection = (sectionId: string, itemId: string) => {
    const newSettings = {
      ...settings,
      customSections: settings.customSections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
          : s
      ),
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
  };

  return (
    <SidebarSettingsContext.Provider
      value={{
        settings,
        toggleBasicItem,
        addSection,
        updateSection,
        deleteSection,
        addItemToSection,
        removeItemFromSection,
        resetToDefaults,
        isLoading,
      }}
    >
      {children}
    </SidebarSettingsContext.Provider>
  );
}

export function useSidebarSettings() {
  const context = useContext(SidebarSettingsContext);
  if (context === undefined) {
    throw new Error("useSidebarSettings must be used within a SidebarSettingsProvider");
  }
  return context;
}

export { defaultSettings };
