import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";

export type FontFamily = "system" | "sans-serif" | "serif" | "monospace";
export type TextSizeUnit = "px" | "em";

interface DisplaySettings {
  fontFamily: FontFamily;
  textSize: number;
  textSizeUnit: TextSizeUnit;
  lineHeight: number;
  letterSpacing: number;
}

interface DisplaySettingsContextType {
  settings: DisplaySettings;
  setFontFamily: (font: FontFamily) => void;
  setTextSize: (size: number) => void;
  setTextSizeUnit: (unit: TextSizeUnit) => void;
  setLineHeight: (height: number) => void;
  setLetterSpacing: (spacing: number) => void;
  resetToDefaults: () => void;
  getTextSizeValue: () => string;
  isLoading: boolean;
}

const defaultSettings: DisplaySettings = {
  fontFamily: "system",
  textSize: 16,
  textSizeUnit: "px",
  lineHeight: 1.5,
  letterSpacing: 0,
};

const STORAGE_KEY = "oneapp-display-settings";

const DisplaySettingsContext = createContext<DisplaySettingsContextType | undefined>(undefined);

const fontFamilyMap: Record<FontFamily, string> = {
  system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  "sans-serif": "'Inter', 'Helvetica Neue', Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', Times, serif",
  monospace: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
};

const getTextSizeString = (size: number, unit: TextSizeUnit): string => {
  return `${size}${unit}`;
};

export function DisplaySettingsProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuthSafe();
  const [settings, setSettings] = useState<DisplaySettings>(() => {
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

  // Apply settings to document
  const applySettings = useCallback((s: DisplaySettings) => {
    const root = document.documentElement;
    const textSizeValue = getTextSizeString(s.textSize, s.textSizeUnit);
    
    root.style.setProperty("--app-font-family", fontFamilyMap[s.fontFamily]);
    root.style.setProperty("--app-font-size", textSizeValue);
    root.style.setProperty("--app-line-height", String(s.lineHeight));
    root.style.setProperty("--app-letter-spacing", `${s.letterSpacing}em`);
    
    document.body.style.fontFamily = fontFamilyMap[s.fontFamily];
    document.body.style.fontSize = textSizeValue;
    document.body.style.lineHeight = String(s.lineHeight);
    document.body.style.letterSpacing = `${s.letterSpacing}em`;
  }, []);

  // Save to localStorage and database
  const saveSettings = useCallback(async (newSettings: DisplaySettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    applySettings(newSettings);
    
    if (user) {
      try {
        await supabase
          .from("user_settings")
          .upsert([{ 
            user_id: user.id, 
            display_settings: JSON.parse(JSON.stringify(newSettings))
          }]);
      } catch (error) {
        console.error("Error saving display settings:", error);
      }
    }
  }, [user, applySettings]);

  // Fetch from database
  const fetchSettings = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("display_settings")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.display_settings && typeof data.display_settings === 'object') {
        const displayData = data.display_settings as Record<string, unknown>;
        const dbSettings: DisplaySettings = {
          fontFamily: (displayData.fontFamily as FontFamily) || defaultSettings.fontFamily,
          textSize: typeof displayData.textSize === 'number' ? displayData.textSize : defaultSettings.textSize,
          textSizeUnit: (displayData.textSizeUnit as TextSizeUnit) || defaultSettings.textSizeUnit,
          lineHeight: typeof displayData.lineHeight === 'number' ? displayData.lineHeight : defaultSettings.lineHeight,
          letterSpacing: typeof displayData.letterSpacing === 'number' ? displayData.letterSpacing : defaultSettings.letterSpacing,
        };
        setSettings(dbSettings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dbSettings));
        applySettings(dbSettings);
      }
    } catch (error) {
      console.error("Error fetching display settings:", error);
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  }, [user, applySettings]);

  useEffect(() => {
    applySettings(settings);
  }, []);

  useEffect(() => {
    if (!authLoading && user && !initialized) {
      fetchSettings();
    } else if (!authLoading && !user) {
      setIsLoading(false);
      setInitialized(false);
    }
  }, [user, authLoading, initialized, fetchSettings]);

  const setFontFamily = (font: FontFamily) => {
    const newSettings = { ...settings, fontFamily: font };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const setTextSize = (size: number) => {
    const min = settings.textSizeUnit === "px" ? 12 : 0.75;
    const max = settings.textSizeUnit === "px" ? 24 : 1.5;
    const newSettings = { ...settings, textSize: Math.min(max, Math.max(min, size)) };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const setTextSizeUnit = (unit: TextSizeUnit) => {
    let newSize = settings.textSize;
    if (unit === "em" && settings.textSizeUnit === "px") {
      newSize = Math.round((settings.textSize / 16) * 100) / 100;
    } else if (unit === "px" && settings.textSizeUnit === "em") {
      newSize = Math.round(settings.textSize * 16);
    }
    const newSettings = { ...settings, textSize: newSize, textSizeUnit: unit };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const getTextSizeValue = (): string => {
    return getTextSizeString(settings.textSize, settings.textSizeUnit);
  };

  const setLineHeight = (height: number) => {
    const newSettings = { ...settings, lineHeight: Math.min(2, Math.max(1, height)) };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const setLetterSpacing = (spacing: number) => {
    const newSettings = { ...settings, letterSpacing: Math.min(0.2, Math.max(-0.05, spacing)) };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
  };

  return (
    <DisplaySettingsContext.Provider
      value={{
        settings,
        setFontFamily,
        setTextSize,
        setTextSizeUnit,
        setLineHeight,
        setLetterSpacing,
        resetToDefaults,
        getTextSizeValue,
        isLoading,
      }}
    >
      {children}
    </DisplaySettingsContext.Provider>
  );
}

export function useDisplaySettings() {
  const context = useContext(DisplaySettingsContext);
  if (context === undefined) {
    throw new Error("useDisplaySettings must be used within a DisplaySettingsProvider");
  }
  return context;
}

export { defaultSettings, fontFamilyMap };
