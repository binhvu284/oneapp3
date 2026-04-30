import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";

type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuthSafe();
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("oneapp-theme");
    return (saved as Theme) || "system";
  });
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Apply theme to DOM
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

    const activeTheme = newTheme === "system" ? systemTheme : newTheme;

    if (activeTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("oneapp-theme", newTheme);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, applyTheme]);

  // Fetch theme from database
  const fetchTheme = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("theme")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.theme) {
        const dbTheme = data.theme as Theme;
        setThemeState(dbTheme);
        applyTheme(dbTheme);
      } else {
        // Create settings with current theme
        await supabase
          .from("user_settings")
          .upsert([{ user_id: user.id, theme }]);
      }
    } catch (error) {
      console.error("Error fetching theme:", error);
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  }, [user, theme, applyTheme]);

  // Set theme and sync to database
  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);

    if (user) {
      try {
        await supabase
          .from("user_settings")
          .upsert([{ user_id: user.id, theme: newTheme }]);
      } catch (error) {
        console.error("Error saving theme:", error);
      }
    }
  }, [user, applyTheme]);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Fetch theme when user logs in
  useEffect(() => {
    if (!authLoading && user && !initialized) {
      fetchTheme();
    } else if (!authLoading && !user) {
      setIsLoading(false);
      setInitialized(false);
    }
  }, [user, authLoading, initialized, fetchTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
