/**
 * External Connection Cache - Persists credentials to localStorage
 * 
 * This allows auth operations to work even when user is logged out,
 * enabling dual-database signup sync functionality.
 */

export interface CachedConnection {
  supabase_url: string;
  supabase_service_key: string;
  is_active: boolean;
  connection_status: "connected" | "disconnected" | "error";
  cached_at: string;
}

const CACHE_KEY = "oneapp_external_connection_cache";

/**
 * Get cached external connection from localStorage
 * Returns null if no cache exists or cache is invalid
 */
export function getCachedConnection(): CachedConnection | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }
    
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const parsed = JSON.parse(cached) as CachedConnection;
    
    // Validate required fields
    if (!parsed.supabase_url || !parsed.supabase_service_key) {
      console.warn("[ConnectionCache] Invalid cached data, clearing");
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    // Only return connected and active connections
    if (parsed.connection_status !== "connected") {
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error("[ConnectionCache] Error reading cache:", error);
    return null;
  }
}

/**
 * Check if there's an active external connection cached
 */
export function hasCachedExternalConnection(): boolean {
  const cached = getCachedConnection();
  return !!(cached && cached.is_active);
}

/**
 * Save connection credentials to localStorage cache
 */
export function setCachedConnection(connection: {
  supabase_url: string | null;
  supabase_service_key: string | null;
  is_active: boolean;
  connection_status: string | null;
}): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    
    // Only cache if we have valid credentials
    if (!connection.supabase_url || !connection.supabase_service_key) {
      console.log("[ConnectionCache] Missing credentials, skipping cache");
      return;
    }
    
    // Only cache if connected
    if (connection.connection_status !== "connected") {
      console.log("[ConnectionCache] Not connected status, skipping cache");
      return;
    }
    
    const cacheData: CachedConnection = {
      supabase_url: connection.supabase_url,
      supabase_service_key: connection.supabase_service_key,
      is_active: connection.is_active,
      connection_status: "connected",
      cached_at: new Date().toISOString(),
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log("[ConnectionCache] Connection cached successfully, active:", connection.is_active);
  } catch (error) {
    console.error("[ConnectionCache] Error saving cache:", error);
  }
}

/**
 * Update cached connection's active status
 */
export function updateCachedConnectionStatus(is_active: boolean): void {
  try {
    const cached = getCachedConnection();
    if (!cached) return;
    
    cached.is_active = is_active;
    cached.cached_at = new Date().toISOString();
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    console.log("[ConnectionCache] Active status updated:", is_active);
  } catch (error) {
    console.error("[ConnectionCache] Error updating cache:", error);
  }
}

/**
 * Clear the connection cache
 */
export function clearCachedConnection(): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    localStorage.removeItem(CACHE_KEY);
    console.log("[ConnectionCache] Cache cleared");
  } catch (error) {
    console.error("[ConnectionCache] Error clearing cache:", error);
  }
}
