export type ConnectionStatus = "not_setup" | "disconnected" | "testing" | "connected" | "error";

// Cache key for localStorage
export const CACHE_KEY = "oneapp_system_connection_cache";

// Event name for cache invalidation
export const SYSTEM_CONNECTION_CHANGED_EVENT = "system-connection-changed";

// Cache structure for localStorage
export interface CachedSystemConnection {
    supabase_url: string;
    supabase_service_key: string;
    is_active: boolean;
    connection_status: ConnectionStatus;
    cached_at: string;
}

// Get cached connection from localStorage
export function getCachedSystemConnection(): CachedSystemConnection | null {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const parsed = JSON.parse(cached) as CachedSystemConnection;

        // Validate required fields
        if (!parsed.supabase_url || !parsed.supabase_service_key) {
            return null;
        }

        // Only return if connection was connected
        if (parsed.connection_status !== "connected") {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

// Check if there's a cached active connection
export function hasCachedSystemConnection(): boolean {
    const cached = getCachedSystemConnection();
    return cached?.is_active === true;
}

// Set cached connection - EXPORTED for external use
// dispatchEvent: whether to dispatch SYSTEM_CONNECTION_CHANGED_EVENT (default: false)
export function setCachedSystemConnection(
    connection: {
        supabase_url: string | null;
        supabase_service_key: string | null | undefined;
        is_active: boolean;
        connection_status: string | null;
    },
    dispatchEvent: boolean = false
): void {
    try {
        if (connection.supabase_url && connection.supabase_service_key && connection.connection_status === "connected") {
            const cache: CachedSystemConnection = {
                supabase_url: connection.supabase_url,
                supabase_service_key: connection.supabase_service_key,
                is_active: connection.is_active,
                connection_status: "connected",
                cached_at: new Date().toISOString(),
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            console.log("[useSystemConnection] Connection cached successfully");

            // Only dispatch event when explicitly requested (user actions like test/setActive)
            if (dispatchEvent && typeof window !== "undefined") {
                console.log("[useSystemConnection] Dispatching connection changed event");
                window.dispatchEvent(new CustomEvent(SYSTEM_CONNECTION_CHANGED_EVENT));
            }
        }
    } catch (error) {
        console.error("[useSystemConnection] Error caching connection:", error);
    }
}

// Clear cached connection
export function clearCachedSystemConnection(): void {
    try {
        localStorage.removeItem(CACHE_KEY);
        console.log("[useSystemConnection] Cache cleared");
    } catch {
        // Ignore
    }
}

// Invalidate cache and notify listeners (for disconnect flow)
export function invalidateSystemConnectionCache(): void {
    clearCachedSystemConnection();
    // Dispatch custom event to trigger re-render in AuthSourceContext
    if (typeof window !== "undefined") {
        console.log("[useSystemConnection] Dispatching cache invalidation event");
        window.dispatchEvent(new CustomEvent(SYSTEM_CONNECTION_CHANGED_EVENT));
    }
}

// Update cached connection status
export function updateCachedSystemConnectionStatus(is_active: boolean, dispatchEvent: boolean = false): void {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return;

        const parsed = JSON.parse(cached) as CachedSystemConnection;
        parsed.is_active = is_active;
        parsed.cached_at = new Date().toISOString();
        localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));

        // Only dispatch event when explicitly requested
        if (dispatchEvent && typeof window !== "undefined") {
            console.log("[useSystemConnection] Dispatching connection status changed event");
            window.dispatchEvent(new CustomEvent(SYSTEM_CONNECTION_CHANGED_EVENT));
        }
    } catch {
        // Ignore
    }
}
