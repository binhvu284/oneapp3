import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";

export interface CustomThemeColors {
  main: string;
  sidebar: string;
  header: string;
  card: string;
  primary: string;
  text: string;
  textMuted: string;
  border: string;
}

const DEFAULT_DARK_COLORS: CustomThemeColors = {
  main: "#0a0a0a",
  sidebar: "#1a1a1a",
  header: "#1a1a1a",
  card: "#141414",
  primary: "#0ea5e9",
  text: "#f5f5f5",
  textMuted: "#8c8c8c",
  border: "#363636",
};

const DEFAULT_LIGHT_COLORS: CustomThemeColors = {
  main: "#ffffff",
  sidebar: "#f0f0f0",
  header: "#f8f8f8",
  card: "#f5f5f5",
  primary: "#0ea5e9",
  text: "#1a1a2e",
  textMuted: "#6b7280",
  border: "#d1d5db",
};

const STORAGE_KEY = "oneapp-custom-theme";

function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function useCustomTheme() {
  const { user } = useAuthSafe();
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  const [colors, setColors] = useState<CustomThemeColors>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return isDark ? parsed.dark : parsed.light;
      } catch {
        return isDark ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS;
      }
    }
    return isDark ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS;
  });

  const [initialized, setInitialized] = useState(false);

  // Watch for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("dark");
      setIsDark(dark);

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setColors(dark ? parsed.dark : parsed.light);
        } catch {
          setColors(dark ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS);
        }
      } else {
        setColors(dark ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Fetch from database on mount
  useEffect(() => {
    const fetchThemeColors = async () => {
      if (!user || initialized) return;

      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("custom_theme_colors")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data?.custom_theme_colors && typeof data.custom_theme_colors === 'object') {
          const themeData = data.custom_theme_colors as Record<string, unknown>;
          if (themeData.dark && themeData.light) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(themeData));
            const currentColors = isDark ? (themeData.dark as CustomThemeColors) : (themeData.light as CustomThemeColors);
            setColors(currentColors);
          }
        }
      } catch (error) {
        console.error("Error fetching custom theme colors:", error);
      } finally {
        setInitialized(true);
      }
    };

    fetchThemeColors();
  }, [user, isDark, initialized]);

  const applyColors = useCallback((newColors: CustomThemeColors) => {
    const root = document.documentElement;

    root.style.setProperty("--background", hexToHsl(newColors.main));
    root.style.setProperty("--sidebar-background", hexToHsl(newColors.sidebar));
    root.style.setProperty("--header-background", hexToHsl(newColors.header));
    root.style.setProperty("--card", hexToHsl(newColors.card));
    root.style.setProperty("--card-hover", hexToHsl(newColors.card));
    root.style.setProperty("--primary", hexToHsl(newColors.primary));
    root.style.setProperty("--sidebar-primary", hexToHsl(newColors.primary));
    root.style.setProperty("--sidebar-accent", hexToHsl(newColors.primary));
    root.style.setProperty("--ring", hexToHsl(newColors.primary));
    root.style.setProperty("--foreground", hexToHsl(newColors.text));
    root.style.setProperty("--card-foreground", hexToHsl(newColors.text));
    root.style.setProperty("--header-foreground", hexToHsl(newColors.text));
    root.style.setProperty("--muted-foreground", hexToHsl(newColors.textMuted));
    root.style.setProperty("--sidebar-foreground", hexToHsl(newColors.textMuted));
    root.style.setProperty("--border", hexToHsl(newColors.border));
    root.style.setProperty("--sidebar-border", hexToHsl(newColors.border));
    root.style.setProperty("--header-border", hexToHsl(newColors.border));
    root.style.setProperty("--card-border", hexToHsl(newColors.border));
  }, []);

  const saveColors = useCallback(async (newColors: CustomThemeColors) => {
    setColors(newColors);
    applyColors(newColors);

    const stored = localStorage.getItem(STORAGE_KEY);
    let allColors = { dark: DEFAULT_DARK_COLORS, light: DEFAULT_LIGHT_COLORS };

    if (stored) {
      try {
        allColors = JSON.parse(stored);
      } catch (_e) {
        // ignore parsing error
      }
    }

    if (isDark) {
      allColors.dark = newColors;
    } else {
      allColors.light = newColors;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allColors));

    // Save to database
    if (user) {
      try {
        await supabase
          .from("user_settings")
          .upsert([{
            user_id: user.id,
            custom_theme_colors: JSON.parse(JSON.stringify(allColors))
          }]);
      } catch (error) {
        console.error("Error saving custom theme colors:", error);
      }
    }
  }, [isDark, applyColors, user]);

  const resetColors = useCallback(async () => {
    const defaultColors = isDark ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS;
    setColors(defaultColors);

    const root = document.documentElement;
    root.style.removeProperty("--background");
    root.style.removeProperty("--sidebar-background");
    root.style.removeProperty("--header-background");
    root.style.removeProperty("--card");
    root.style.removeProperty("--card-hover");
    root.style.removeProperty("--primary");
    root.style.removeProperty("--sidebar-primary");
    root.style.removeProperty("--sidebar-accent");
    root.style.removeProperty("--ring");
    root.style.removeProperty("--foreground");
    root.style.removeProperty("--card-foreground");
    root.style.removeProperty("--header-foreground");
    root.style.removeProperty("--muted-foreground");
    root.style.removeProperty("--sidebar-foreground");
    root.style.removeProperty("--border");
    root.style.removeProperty("--sidebar-border");
    root.style.removeProperty("--header-border");
    root.style.removeProperty("--card-border");

    localStorage.removeItem(STORAGE_KEY);

    // Remove from database
    if (user) {
      try {
        await supabase
          .from("user_settings")
          .upsert([{ user_id: user.id, custom_theme_colors: null }]);
      } catch (error) {
        console.error("Error resetting custom theme colors:", error);
      }
    }
  }, [isDark, user]);

  return {
    colors,
    setColors: saveColors,
    resetColors,
    isDark,
    defaultColors: isDark ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS,
  };
}
