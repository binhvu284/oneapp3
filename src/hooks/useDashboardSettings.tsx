import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { DashboardSettings, DEFAULT_DASHBOARD } from "@/components/dashboard/widgets/WidgetRegistry";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useDashboardSettings() {
  const { user, isLoading: authLoading } = useAuthSafe();
  const queryClient = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: settings = DEFAULT_DASHBOARD, isLoading: isQueryLoading } = useQuery({
    queryKey: ["dashboard_settings", user?.id],
    queryFn: async () => {
      if (!user) return DEFAULT_DASHBOARD;

      const { data, error } = await supabase
        .from("user_settings")
        .select("dashboard_settings")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.dashboard_settings) {
        const parsed = data.dashboard_settings as unknown as DashboardSettings;
        if (parsed.layouts && parsed.widgets) return parsed;
      }
      return DEFAULT_DASHBOARD;
    },
    enabled: !!user && !authLoading,
  });

  const saveMutation = useMutation({
    mutationFn: async (newSettings: DashboardSettings) => {
      if (!user) throw new Error("No user");
      const { error } = await supabase
        .from("user_settings")
        .update({ dashboard_settings: newSettings as any })
        .eq("user_id", user.id);
      if (error) throw error;
      return newSettings;
    },
    onError: (err) => {
      console.error("Failed to save dashboard:", err);
      toast({
        title: "Save failed",
        description: "Could not save dashboard layout",
        variant: "destructive",
      });
    }
  });

  const saveSettings = useCallback(
    (newSettings: DashboardSettings) => {
      if (!user) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        saveMutation.mutate(newSettings);
      }, 2000);
    },
    [user, saveMutation]
  );

  const updateSettings = useCallback(
    (newSettings: DashboardSettings) => {
      // Optimistic update
      queryClient.setQueryData(["dashboard_settings", user?.id], newSettings);
      saveSettings(newSettings);
    },
    [queryClient, user?.id, saveSettings]
  );

  const resetToDefault = useCallback(() => {
    updateSettings(DEFAULT_DASHBOARD);
    toast({ title: "Dashboard reset", description: "Restored default layout" });
  }, [updateSettings]);

  return {
    settings,
    isLoading: authLoading || isQueryLoading,
    updateSettings,
    resetToDefault
  };
}
