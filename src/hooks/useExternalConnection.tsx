/**
 * ============================================================================
 * @file useExternalConnection.tsx
 * @description Hook quản lý kết nối database Supabase ngoài (External Connection).
 * 
 * Đây là logic quản lý trạng thái kết nối dành riêng cho một người dùng. 
 * External connection cho phép người dùng cấu hình Supabase riêng của họ,
 * nhưng credentials hiện tại đã được loại bỏ trên client và xử lý hoàn toàn
 * thông qua Edge Functions (ví dụ: `manage-connection`).
 * 
 * Các tính năng bao gồm:
 * - Load trạng thái kết nối từ DB/cache
 * - Kiểm tra (Test), Lưu (Save) hoặc Ngừng kết nối (Disconnect)
 * - Chuyển đổi giữa Local/Lovable Database và External Database
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource } from "@/hooks/useAuthSource";
import { toast } from "sonner";
import {
  setCachedConnection,
  clearCachedConnection,
  updateCachedConnectionStatus
} from "@/hooks/useExternalConnectionCache";

export type ConnectionStatus = "not_setup" | "disconnected" | "testing" | "connected" | "error";

export interface ExternalConnection {
  id: string;
  user_id: string;
  name: string;
  supabase_url: string | null;
  // Note: supabase_anon_key and supabase_service_key columns have been removed for security
  // Credentials are now handled via edge functions and system_connection table
  is_active: boolean;
  connection_status: ConnectionStatus;
  last_tested_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface TestConnectionResult {
  success: boolean;
  connected?: boolean;
  schema_exists?: boolean;
  message?: string;
  error?: string;
}

const CONNECTION_ID_KEY = "oneapp_connection_id";

// Safe localStorage getter - outside component to avoid hook issues
const getStoredConnectionId = (): string | null => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem(CONNECTION_ID_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
  return null;
};

export function useExternalConnection() {
  const { user, isAuthenticated } = useAuthSource();

  // All useState hooks MUST be called unconditionally at the top
  const [connection, setConnection] = useState<ExternalConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [cachedConnectionId, setCachedConnectionId] = useState<string | null>(getStoredConnectionId);

  // Fetch existing connection
  const fetchConnection = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("external_connections")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const connectionData = data as ExternalConnection;
        setConnection(connectionData);

        // Cache connection ID for use when user is null
        try {
          localStorage.setItem(CONNECTION_ID_KEY, data.id);
          setCachedConnectionId(data.id);
        } catch {
          // Ignore localStorage errors
        }

        // Cache connection metadata for use when user is logged out (dual auth)
        // Note: Actual credentials are now handled server-side via edge functions
        setCachedConnection({
          supabase_url: connectionData.supabase_url,
          supabase_service_key: null, // No longer stored client-side for security
          is_active: connectionData.is_active,
          connection_status: connectionData.connection_status,
        });
      } else {
        setConnection(null);
      }
    } catch (error) {
      console.error("Error fetching connection:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  // Save or update connection metadata (credentials now handled via edge functions)
  const saveConnection = async (url: string, _anonKey: string, _serviceKey?: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      toast.error("Please login first");
      return false;
    }

    setIsSaving(true);

    try {
      // Note: Credentials (anon_key, service_key) are now handled server-side
      // via manage-system-connection edge function for security
      if (connection) {
        const { error } = await supabase
          .from("external_connections")
          .update({
            supabase_url: url,
            connection_status: "disconnected",
            error_message: null,
          })
          .eq("id", connection.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("external_connections")
          .insert({
            user_id: user.id,
            name: "Supabase",
            supabase_url: url,
            connection_status: "disconnected",
          })
          .select("id")
          .single();

        if (error) throw error;

        // Cache the new connection ID
        if (data) {
          try {
            localStorage.setItem(CONNECTION_ID_KEY, data.id);
            setCachedConnectionId(data.id);
          } catch {
            // Ignore localStorage errors
          }
        }
      }

      await fetchConnection();
      toast.success("Connection URL saved. Use System Connection for full credential management.");
      return true;
    } catch (error: any) {
      console.error("Error saving connection:", error);
      toast.error(error.message || "Failed to save connection");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Test the connection - Note: This is now legacy, use system_connection instead
  const testConnection = async (): Promise<TestConnectionResult> => {
    if (!connection?.supabase_url) {
      return { success: false, error: "No connection URL configured. Please use System Connection for full credential management." };
    }

    setIsTesting(true);

    try {
      await supabase
        .from("external_connections")
        .update({ connection_status: "testing" })
        .eq("id", connection.id);

      setConnection(prev => prev ? { ...prev, connection_status: "testing" } : null);

      // Note: Credentials are now handled server-side via system_connection
      const { data, error } = await supabase.functions.invoke("test-external-connection", {
        body: {
          supabase_url: connection.supabase_url,
          // Credentials fetched server-side from system_connection table
        },
      });

      if (error) throw error;

      const result = data as TestConnectionResult;
      const newStatus: ConnectionStatus = result.success ? "connected" : "error";
      const errorMessage = result.success ? null : result.error;

      await supabase
        .from("external_connections")
        .update({
          connection_status: newStatus,
          last_tested_at: new Date().toISOString(),
          error_message: errorMessage,
        })
        .eq("id", connection.id);

      await fetchConnection();

      if (result.success) {
        toast.success(result.message || "Connection successful!");
      } else {
        toast.error(result.error || "Connection failed");
      }

      return result;
    } catch (error: any) {
      console.error("Error testing connection:", error);

      await supabase
        .from("external_connections")
        .update({
          connection_status: "error",
          error_message: error.message,
        })
        .eq("id", connection.id);

      await fetchConnection();

      toast.error(error.message || "Failed to test connection");
      return { success: false, error: error.message };
    } finally {
      setIsTesting(false);
    }
  };

  // Disconnect using Edge Function (bypasses RLS)
  const disconnect = async (): Promise<boolean> => {
    const connectionId = connection?.id || cachedConnectionId;

    if (!connectionId) {
      console.warn("[useExternalConnection] No connection ID available");
      return false;
    }

    console.log("[useExternalConnection] Disconnecting via Edge Function...");

    try {
      const { data, error } = await supabase.functions.invoke("manage-connection", {
        body: {
          action: "disconnect",
          connectionId,
        },
      });

      if (error) throw error;

      if (data?.success) {
        // Clear local state and caches
        try {
          localStorage.removeItem(CONNECTION_ID_KEY);
        } catch {
          // Ignore localStorage errors
        }
        setCachedConnectionId(null);
        setConnection(null);

        // Clear the connection credentials cache
        clearCachedConnection();

        toast.success("Disconnected from Supabase");
        return true;
      }

      throw new Error(data?.error || "Failed to disconnect");
    } catch (error: any) {
      console.error("[useExternalConnection] Disconnect error:", error);
      toast.error(error.message || "Failed to disconnect");
      return false;
    }
  };

  // Set this connection as active data source (using Edge Function)
  const setAsActive = async (): Promise<boolean> => {
    const connectionId = connection?.id || cachedConnectionId;

    if (!connectionId) {
      toast.error("No connection available");
      return false;
    }

    if (connection && connection.connection_status !== "connected") {
      toast.error("Please test connection first");
      return false;
    }

    setIsSwitching(true);

    try {
      const { data, error } = await supabase.functions.invoke("manage-connection", {
        body: {
          action: "set-active",
          connectionId,
          active: true,
        },
      });

      if (error) throw error;

      if (data?.success) {
        await fetchConnection();

        // Update cache active status
        updateCachedConnectionStatus(true);

        toast.success("Switched to Supabase as primary data source");
        return true;
      }

      throw new Error(data?.error || "Failed to switch data source");
    } catch (error: any) {
      console.error("[useExternalConnection] Set active error:", error);
      toast.error(error.message || "Failed to switch data source");
      return false;
    } finally {
      setIsSwitching(false);
    }
  };

  // Set Lovable Cloud as active (using Edge Function)
  const setLovableCloudActive = async (): Promise<boolean> => {
    const connectionId = connection?.id || cachedConnectionId;

    if (!connectionId) {
      return true; // Already using Lovable Cloud
    }

    setIsSwitching(true);

    try {
      const { data, error } = await supabase.functions.invoke("manage-connection", {
        body: {
          action: "set-lovable-active",
          connectionId,
        },
      });

      if (error) throw error;

      if (data?.success) {
        await fetchConnection();

        // Update cache active status
        updateCachedConnectionStatus(false);

        toast.success("Switched to Lovable Cloud as primary data source");
        return true;
      }

      throw new Error(data?.error || "Failed to switch data source");
    } catch (error: any) {
      console.error("[useExternalConnection] Set Lovable Cloud active error:", error);
      toast.error(error.message || "Failed to switch data source");
      return false;
    } finally {
      setIsSwitching(false);
    }
  };

  // Force clear all connection data (for emergency use)
  const forceClearConnection = () => {
    try {
      localStorage.removeItem(CONNECTION_ID_KEY);
    } catch {
      // Ignore localStorage errors
    }
    setCachedConnectionId(null);
    setConnection(null);

    // Also clear credentials cache
    clearCachedConnection();
  };

  return {
    connection,
    isLoading,
    isTesting,
    isSaving,
    isSwitching,
    isLovableCloudActive: !connection?.is_active,
    isSupabaseActive: connection?.is_active ?? false,
    cachedConnectionId,
    fetchConnection,
    saveConnection,
    testConnection,
    disconnect,
    setAsActive,
    setLovableCloudActive,
    forceClearConnection,
  };
}
