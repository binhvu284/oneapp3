/**
 * DataSource Synchronization Hook
 * 
 * This hook bridges the gap between useSystemConnection (manages external DB credentials)
 * and DataSourceContext (manages the data layer abstraction).
 * 
 * It ensures that when a user switches between Lovable Cloud and External Supabase
 * via the UI, the DataSourceContext is updated accordingly.
 */

import { useEffect, useRef } from "react";
import { useSystemConnection, SYSTEM_CONNECTION_CHANGED_EVENT } from "@/hooks/useSystemConnection";
import { useDataSourceSafe } from "@/lib/data-layer";

/**
 * Hook to synchronize system connection state with data layer
 * Should be used once in a high-level component (e.g., App.tsx or AppLayout)
 */
export function useDataSourceSync() {
  const { connection, isLovableCloudActive, isSupabaseActive } = useSystemConnection();
  const dataSource = useDataSourceSafe();
  const lastActiveSourceRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  // Sync DataSourceContext when system connection changes
  useEffect(() => {
    if (!dataSource || dataSource.isLoading) return;

    const targetSourceId = isSupabaseActive && connection?.connection_status === "connected"
      ? "supabase" // Will be matched by type, not exact ID
      : "lovable-cloud";

    // Determine which source ID to use
    const currentActiveId = dataSource.activeSource?.config.id;
    const currentActiveType = dataSource.activeSource?.config.type;

    // Check if we need to switch
    const shouldSwitchToSupabase = isSupabaseActive &&
      connection?.connection_status === "connected" &&
      currentActiveType !== "supabase";

    const shouldSwitchToLovable = isLovableCloudActive &&
      currentActiveType !== "lovable";

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      console.log("[useDataSourceSync] Initialized - Active:", currentActiveType, "Target:", targetSourceId);
    }

    if (shouldSwitchToSupabase) {
      // Find supabase source in dataSources
      const supabaseSource = dataSource.dataSources.find(s => s.config.type === "supabase");
      if (supabaseSource && supabaseSource.config.id !== lastActiveSourceRef.current) {
        console.log("[useDataSourceSync] Switching to External Supabase");
        lastActiveSourceRef.current = supabaseSource.config.id;
        dataSource.switchSource(supabaseSource.config.id);
      }
    } else if (shouldSwitchToLovable) {
      // Find lovable source
      const lovableSource = dataSource.dataSources.find(s => s.config.type === "lovable");
      if (lovableSource && lovableSource.config.id !== lastActiveSourceRef.current) {
        console.log("[useDataSourceSync] Switching to Lovable Cloud");
        lastActiveSourceRef.current = lovableSource.config.id;
        dataSource.switchSource(lovableSource.config.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dataSource?.isLoading,
    dataSource?.activeSource?.config.type,
    isLovableCloudActive,
    isSupabaseActive,
    connection?.connection_status,
  ]);

  // Listen for system connection change events
  useEffect(() => {
    const handleConnectionChange = () => {
      console.log("[useDataSourceSync] System connection changed event received");
      // The above useEffect will handle the actual switch
    };

    window.addEventListener(SYSTEM_CONNECTION_CHANGED_EVENT, handleConnectionChange);
    return () => {
      window.removeEventListener(SYSTEM_CONNECTION_CHANGED_EVENT, handleConnectionChange);
    };
  }, []);

  return {
    isSync: dataSource?.activeSource?.config.type === (isSupabaseActive ? "supabase" : "lovable"),
    activeType: dataSource?.activeSource?.config.type || null,
    systemActive: isSupabaseActive ? "external" : "lovable",
  };
}

/**
 * Component wrapper for useDataSourceSync
 * Can be added to App.tsx for automatic synchronization
 */
export function DataSourceSyncProvider({ children }: { children: React.ReactNode }) {
  useDataSourceSync();
  return <>{children}</>;
}
