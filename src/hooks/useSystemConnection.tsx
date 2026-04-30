import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource } from "@/hooks/useAuthSource";
import { toast } from "sonner";

export interface SystemConnection {
  id: string;
  supabase_url: string | null;
  supabase_anon_key: string | null;
  supabase_service_key?: string | null;
  has_service_key: boolean;
  is_active: boolean;
  connection_status: ConnectionStatus;
  last_tested_at: string | null;
  error_message: string | null;
  configured_by: string | null;
  created_at: string;
  updated_at: string;
}

import {
  type ConnectionStatus,
  type CachedSystemConnection,
  SYSTEM_CONNECTION_CHANGED_EVENT,
  getCachedSystemConnection,
  hasCachedSystemConnection,
  setCachedSystemConnection,
  clearCachedSystemConnection,
  invalidateSystemConnectionCache,
  updateCachedSystemConnectionStatus
} from "@/lib/system-connection-cache";

// Re-export for backward compatibility
export type { ConnectionStatus, CachedSystemConnection };
export {
  SYSTEM_CONNECTION_CHANGED_EVENT,
  getCachedSystemConnection,
  hasCachedSystemConnection,
  setCachedSystemConnection,
  clearCachedSystemConnection,
  invalidateSystemConnectionCache,
  updateCachedSystemConnectionStatus
};

export function useSystemConnection() {
  const { user, isAuthenticated } = useAuthSource();
  const [connection, setConnection] = useState<SystemConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Fetch system connection (works even when not logged in via Edge Function)
  const fetchConnection = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke("get-system-connection");

      if (error) {
        console.error("[useSystemConnection] Fetch error:", error);
        return;
      }

      if (data?.success && data.connection) {
        const conn = data.connection as SystemConnection;
        setConnection(conn);

        // Cache connection for offline/logout scenarios
        setCachedSystemConnection({
          supabase_url: conn.supabase_url,
          supabase_service_key: conn.supabase_service_key,
          is_active: conn.is_active,
          connection_status: conn.connection_status,
        });
      } else {
        // Fallback to environment variables if no connection is saved in DB
        const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
        const envAnonKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY;
        const envProjectId = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID;

        if (envUrl && envAnonKey) {
          const envConn: SystemConnection = {
            id: 'env-default',
            supabase_url: envUrl,
            supabase_anon_key: envAnonKey,
            supabase_service_key: envAnonKey, // Fallback for components that expect service key
            has_service_key: true,
            is_active: true, // Mark as active if provided via env
            connection_status: 'connected',
            last_tested_at: new Date().toISOString(),
            error_message: null,
            configured_by: 'system_env',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setConnection(envConn);

          // Cache it too
          setCachedSystemConnection({
            supabase_url: envUrl,
            supabase_service_key: envAnonKey,
            is_active: true,
            connection_status: 'connected',
          });
        } else {
          setConnection(null);
        }
      }
    } catch (error) {
      console.error("[useSystemConnection] Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  // Save connection credentials
  const saveConnection = useCallback(async (
    url: string,
    anonKey: string,
    serviceKey?: string
  ): Promise<boolean> => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to save connection");
      return false;
    }

    try {
      setIsSaving(true);

      const { data, error } = await supabase.functions.invoke("manage-system-connection", {
        body: {
          action: "save",
          supabase_url: url,
          supabase_anon_key: anonKey,
          supabase_service_key: serviceKey,
        },
      });

      if (error || !data?.success) {
        toast.error(data?.error || "Failed to save connection");
        return false;
      }

      toast.success("Connection saved successfully");
      await fetchConnection();
      return true;
    } catch (error) {
      console.error("[useSystemConnection] Save error:", error);
      toast.error("Failed to save connection");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, fetchConnection]);

  // Test connection
  const testConnection = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to test connection");
      return { success: false, error: "Not logged in" };
    }

    try {
      setIsTesting(true);

      const { data, error } = await supabase.functions.invoke("manage-system-connection", {
        body: { action: "test" },
      });

      if (error || !data?.success) {
        const errorMsg = data?.error || "Connection test failed";
        toast.error(errorMsg);
        await fetchConnection();
        return { success: false, error: errorMsg };
      }

      toast.success("Connection test successful!");
      await fetchConnection();
      return { success: true };
    } catch (error) {
      console.error("[useSystemConnection] Test error:", error);
      toast.error("Connection test failed");
      return { success: false, error: "Test failed" };
    } finally {
      setIsTesting(false);
    }
  }, [isAuthenticated, fetchConnection]);

  // Disconnect
  const disconnect = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to disconnect");
      return false;
    }

    try {
      setIsSwitching(true);

      const { data, error } = await supabase.functions.invoke("manage-system-connection", {
        body: { action: "disconnect" },
      });

      if (error || !data?.success) {
        toast.error(data?.error || "Failed to disconnect");
        return false;
      }

      // CRITICAL: Clear cache AND dispatch event IMMEDIATELY
      invalidateSystemConnectionCache();

      // Force local state update immediately
      setConnection(null);

      toast.success("Disconnected successfully");

      // Re-fetch to sync with server
      await fetchConnection();
      return true;
    } catch (error) {
      console.error("[useSystemConnection] Disconnect error:", error);
      toast.error("Failed to disconnect");
      return false;
    } finally {
      setIsSwitching(false);
    }
  }, [isAuthenticated, fetchConnection]);

  // Set Supabase as active
  const setAsActive = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      toast.error("You must be logged in");
      return false;
    }

    if (connection?.connection_status !== "connected") {
      toast.error("Connection must be connected first");
      return false;
    }

    try {
      setIsSwitching(true);

      const { data, error } = await supabase.functions.invoke("manage-system-connection", {
        body: { action: "set-active", is_active: true },
      });

      if (error || !data?.success) {
        toast.error(data?.error || "Failed to set as active");
        return false;
      }

      // CRITICAL: Cache connection with is_active = true IMMEDIATELY and dispatch event
      if (connection?.supabase_url && connection?.supabase_service_key) {
        setCachedSystemConnection({
          supabase_url: connection.supabase_url,
          supabase_service_key: connection.supabase_service_key,
          is_active: true,
          connection_status: "connected",
        }, true); // dispatch event for user action
        console.log("[useSystemConnection] setAsActive: Cached connection with is_active=true");
      }

      toast.success("External Supabase is now active");
      await fetchConnection();
      return true;
    } catch (error) {
      console.error("[useSystemConnection] Set active error:", error);
      toast.error("Failed to set as active");
      return false;
    } finally {
      setIsSwitching(false);
    }
  }, [isAuthenticated, connection, fetchConnection]);

  // Set Lovable Cloud as active
  const setLovableCloudActive = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      toast.error("You must be logged in");
      return false;
    }

    try {
      setIsSwitching(true);

      const { data, error } = await supabase.functions.invoke("manage-system-connection", {
        body: { action: "set-active", is_active: false },
      });

      if (error || !data?.success) {
        toast.error(data?.error || "Failed to set Lovable Cloud as active");
        return false;
      }

      // Update cache and dispatch event for user action
      updateCachedSystemConnectionStatus(false, true);

      toast.success("Lovable Cloud is now active");
      await fetchConnection();
      return true;
    } catch (error) {
      console.error("[useSystemConnection] Set Lovable active error:", error);
      toast.error("Failed to set Lovable Cloud as active");
      return false;
    } finally {
      setIsSwitching(false);
    }
  }, [isAuthenticated, fetchConnection]);

  // Computed values
  const isLovableCloudActive = !connection?.is_active;
  const isSupabaseActive = connection?.is_active === true;
  const hasSystemConnection = connection?.connection_status === "connected" && connection?.is_active === true;

  return {
    connection,
    isLoading,
    isTesting,
    isSaving,
    isSwitching,
    isLovableCloudActive,
    isSupabaseActive,
    hasSystemConnection,
    fetchConnection,
    saveConnection,
    testConnection,
    disconnect,
    setAsActive,
    setLovableCloudActive,
  };
}
