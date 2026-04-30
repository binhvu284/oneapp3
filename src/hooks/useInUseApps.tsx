import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";
import { toast } from "@/hooks/use-toast";

export type AppStatus = "available" | "disable" | "developing";

export interface InUseApp {
  id: string;
  user_id: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  icon_url: string | null;
  app_image_url: string | null;
  route: string;
  status: AppStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateInUseAppData {
  name: string;
  short_description?: string;
  long_description?: string;
  icon_url?: string;
  app_image_url?: string;
  route: string;
  status?: AppStatus;
  sort_order?: number;
}

export interface UpdateInUseAppData {
  name?: string;
  short_description?: string;
  long_description?: string;
  icon_url?: string;
  app_image_url?: string;
  route?: string;
  status?: AppStatus;
  sort_order?: number;
}

// Default apps to seed when user has no apps
const DEFAULT_APPS: Omit<CreateInUseAppData, "user_id">[] = [
  {
    name: "Dashboard",
    short_description: "Overview of your workspace and quick access to key features",
    long_description: "The Dashboard is the central hub of OneApp, providing a comprehensive overview of your workspace. It offers quick access to all key features, recent activity tracking, and personalized widgets that help you stay productive.",
    route: "/",
    status: "available",
    sort_order: 1,
  },
  {
    name: "OneApp AI",
    short_description: "Get help and answers from the AI assistant",
    long_description: "OneApp AI is your intelligent assistant that helps you with various tasks. It can answer questions, provide suggestions, and help you navigate through the application efficiently.",
    route: "/developing/ai",
    status: "available",
    sort_order: 2,
  },
  {
    name: "System Admin",
    short_description: "System administration and configuration options",
    long_description: "System Admin provides powerful tools for managing your OneApp instance. Configure user permissions, manage system settings, and monitor application health all from one place.",
    route: "/customization/admin",
    status: "available",
    sort_order: 3,
  },
  {
    name: "OneApp Data",
    short_description: "View and manage database schemas and structures",
    long_description: "OneApp Data gives you complete control over your data. Browse database schemas, manage data structures, and perform data operations with an intuitive interface.",
    route: "/developing/data",
    status: "available",
    sort_order: 4,
  },
  {
    name: "OneLibrary",
    short_description: "Browse and discover applications in your library",
    long_description: "OneLibrary is your application catalog. Discover new apps, manage installed applications, and explore integrations to extend your OneApp experience.",
    route: "/library",
    status: "available",
    sort_order: 5,
  },
  {
    name: "OneApp Developer",
    short_description: "Manage and develop applications in your workspace",
    long_description: "OneApp Developer is your development hub for creating and managing applications. Build new features, configure app settings, and monitor app performance.",
    route: "/workspace/developer",
    status: "available",
    sort_order: 6,
  },
  {
    name: "OneCrypto",
    short_description: "Track your crypto portfolio and market trends",
    long_description: "OneCrypto is your personal crypto management app. Track your portfolio across multiple platforms (MetaMask, Binance, OKX), manage transactions, view market data, and monitor Fear & Greed Index - all in one place.",
    route: "/apps/crypto",
    status: "available",
    sort_order: 7,
  },
  {
    name: "OneNote",
    short_description: "Take notes, create todos, organize with tags",
    long_description: "OneNote is your personal note-taking app with Simple and Professional modes. Create notes, todo lists, organize with colors and tags. Simple mode for quick, easy use; Professional mode for advanced features.",
    route: "/apps/onenote",
    status: "available",
    sort_order: 8,
  },
];

export function useInUseApps() {
  const [apps, setApps] = useState<InUseApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const seedDefaultApps = useCallback(async () => {
    if (!user) return;

    try {
      const appsToInsert = DEFAULT_APPS.map((app) => ({
        ...app,
        user_id: user.id,
      }));

      const { error } = await supabase
        .from("in_use_apps")
        .insert(appsToInsert);

      if (error) throw error;
    } catch (error) {
      console.error("Error seeding default apps:", error);
    }
  }, [user]);

  const syncMissingDefaults = useCallback(async (existingApps: InUseApp[]) => {
    if (!user) return false;
    const existingRoutes = new Set(existingApps.map(a => a.route));
    const missing = DEFAULT_APPS.filter(app => !existingRoutes.has(app.route));
    if (missing.length === 0) return false;

    try {
      const toInsert = missing.map(app => ({ ...app, user_id: user.id }));
      const { error } = await supabase.from("in_use_apps").insert(toInsert);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error syncing missing default apps:", error);
      return false;
    }
  }, [user]);

  const fetchApps = useCallback(async () => {
    if (!user) {
      setApps([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("in_use_apps")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      let needsRefetch = false;
      if (!data || data.length === 0) {
        await seedDefaultApps();
        needsRefetch = true;
      } else {
        needsRefetch = await syncMissingDefaults(data as InUseApp[]);
      }

      if (needsRefetch) {
        const { data: refreshed, error: refreshedError } = await supabase
          .from("in_use_apps")
          .select("*")
          .eq("user_id", user.id)
          .order("sort_order", { ascending: true });
        if (refreshedError) throw refreshedError;
        setApps((refreshed as InUseApp[]) || []);
      } else {
        setApps((data as InUseApp[]) || []);
      }
    } catch (error) {
      console.error("Error fetching in use apps:", error);
      toast({
        title: "Error",
        description: "Failed to load apps",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, seedDefaultApps, syncMissingDefaults]);

  const addApp = async (appData: CreateInUseAppData) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("in_use_apps")
        .insert({
          ...appData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setApps((prev) => [...prev, data as InUseApp]);
      toast({
        title: "Success",
        description: "App added successfully",
      });
      return data as InUseApp;
    } catch (error) {
      console.error("Error adding app:", error);
      toast({
        title: "Error",
        description: "Failed to add app",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateApp = async (id: string, updates: UpdateInUseAppData) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("in_use_apps")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setApps((prev) =>
        prev.map((app) => (app.id === id ? { ...app, ...updates } : app))
      );
      toast({
        title: "Success",
        description: "App updated successfully",
      });
      return true;
    } catch (error) {
      console.error("Error updating app:", error);
      toast({
        title: "Error",
        description: "Failed to update app",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateStatus = async (id: string, status: AppStatus) => {
    return updateApp(id, { status });
  };

  const deleteApp = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("in_use_apps")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setApps((prev) => prev.filter((app) => app.id !== id));
      toast({
        title: "Success",
        description: "App deleted successfully",
      });
      return true;
    } catch (error) {
      console.error("Error deleting app:", error);
      toast({
        title: "Error",
        description: "Failed to delete app",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  return {
    apps,
    isLoading,
    addApp,
    updateApp,
    updateStatus,
    deleteApp,
    refetch: fetchApps,
  };
}
