import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getCachedSystemConnection,
  type CachedSystemConnection,
  SYSTEM_CONNECTION_CHANGED_EVENT,
} from "@/hooks/useSystemConnection";

// Portable user type - works with OneApp Custom Auth
export interface PortableUser {
  id: string;
  email: string;
  name?: string | null;         // Column `name` from oneapp_users (required, always has data)
  display_name?: string | null; // Optional override - explicitly set by user
  nickname?: string | null;
  avatar_url?: string | null;
  level: number;
  roles: string[];
  created_at: string;
}

export type AuthMode = "oneapp" | "lovable" | "external";

export interface AuthResult {
  error: Error | null;
  source?: "oneapp" | "lovable" | "external";
  syncedToExternal?: boolean;
}

interface AuthSourceContextType {
  // Current auth mode
  authMode: AuthMode;

  // Unified user data
  user: PortableUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Auth methods (work with both modes)
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;

  // Update user data (for profile updates)
  updateUser: (updates: Partial<PortableUser>) => void;

  // OneApp specific
  oneappToken: string | null;

  // Role/Level helpers
  isAdmin: boolean;
  isDeveloper: boolean;
  hasMinLevel: (level: number) => boolean;
  hasRole: (role: string) => boolean;

  // Connection info for external operations
  hasExternalConnection: boolean;
  updateProfile: (profileData: Record<string, any>) => Promise<{ success: boolean; error?: string }>;
}

const AuthSourceContext = createContext<AuthSourceContextType | undefined>(undefined);

const ONEAPP_AUTH_TOKEN_KEY = "oneapp_auth_token";

// Re-export cache types for convenience
export type { CachedSystemConnection };

export function AuthSourceProvider({ children }: { children: ReactNode }) {
  // OneApp Custom Auth state
  const [oneappUser, setOneappUser] = useState<PortableUser | null>(null);
  const [oneappToken, setOneappToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ONEAPP_AUTH_TOKEN_KEY);
    }
    return null;
  });
  const [oneappLoading, setOneappLoading] = useState(true);
  const [hasValidatedToken, setHasValidatedToken] = useState(false);

  // CRITICAL: Initialize from cache for IMMEDIATE availability
  const [systemConnection, setSystemConnection] = useState<{
    supabase_url?: string;
    supabase_service_key?: string;
    is_active?: boolean;
    connection_status?: string;
  } | null>(() => {
    const cached = getCachedSystemConnection();
    if (cached) {
      if (import.meta.env.DEV) console.log("[AuthSource] Initializing systemConnection from cache");
      return {
        supabase_url: cached.supabase_url,
        supabase_service_key: cached.supabase_service_key,
        is_active: cached.is_active,
        connection_status: cached.connection_status,
      };
    }
    return null;
  });
  const [connectionLoading, setConnectionLoading] = useState(true);

  // Get cached connection - make it REACTIVE with useState
  const [cachedConnection, setCachedConnection] = useState<CachedSystemConnection | null>(() => {
    return getCachedSystemConnection();
  });

  // Fetch system connection via Edge Function (works even when logged out)
  const fetchSystemConnection = useCallback(async () => {
    try {
      setConnectionLoading(true);
      const { data, error } = await supabase.functions.invoke("get-system-connection");

      if (!error && data?.success && data.connection) {
        if (import.meta.env.DEV) console.log("[AuthSource] Fetched system connection from edge function");
        setSystemConnection(data.connection);
      } else {
        setSystemConnection(null);
      }
    } catch (err) {
      console.error("[AuthSource] Failed to fetch system connection:", err);
      setSystemConnection(null);
    } finally {
      setConnectionLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSystemConnection();
  }, [fetchSystemConnection]);

  // Re-check cache when systemConnection changes
  useEffect(() => {
    setCachedConnection(getCachedSystemConnection());
  }, [systemConnection]);

  // Listen for connection change events
  useEffect(() => {
    const handleConnectionChanged = () => {
      if (import.meta.env.DEV) console.log("[AuthSource] System connection changed event - refreshing");

      const freshCache = getCachedSystemConnection();
      setCachedConnection(freshCache);

      if (freshCache) {
        setSystemConnection({
          supabase_url: freshCache.supabase_url,
          supabase_service_key: freshCache.supabase_service_key,
          is_active: freshCache.is_active,
          connection_status: freshCache.connection_status,
        });
      } else {
        setSystemConnection(null);
      }

      fetchSystemConnection();
    };

    window.addEventListener(SYSTEM_CONNECTION_CHANGED_EVENT, handleConnectionChanged);
    return () => window.removeEventListener(SYSTEM_CONNECTION_CHANGED_EVENT, handleConnectionChanged);
  }, [fetchSystemConnection]);

  // Check if external connection is properly configured
  const hasExternalConnection = useMemo(() => {
    if (!connectionLoading && systemConnection !== null) {
      const isValid = systemConnection.supabase_url &&
        systemConnection.supabase_service_key &&
        systemConnection.connection_status === "connected";
      return isValid;
    }

    if (connectionLoading && cachedConnection) {
      const isValid = cachedConnection.is_active &&
        cachedConnection.connection_status === "connected";
      return isValid;
    }

    return false;
  }, [systemConnection, connectionLoading, cachedConnection]);

  // Validate OneApp token on mount
  // Supports both Lovable Cloud and External Supabase based on active connection
  const validateOneappSession = useCallback(async () => {
    if (!oneappToken) {
      if (import.meta.env.DEV) console.log("[AuthSource] No OneApp token found");
      setOneappUser(null);
      setOneappLoading(false);
      setHasValidatedToken(true);
      return;
    }

    // Determine datasource from cached connection
    const cached = getCachedSystemConnection();
    const useExternal = cached?.is_active && cached?.connection_status === "connected";

    if (import.meta.env.DEV) console.log("[AuthSource] Validating OneApp session...", { useExternal });
    setOneappLoading(true);

    try {
      // Build request body based on datasource
      const requestBody: Record<string, unknown> = {
        action: "validate",
        token: oneappToken,
      };

      // If external datasource is active, pass credentials to edge function
      if (useExternal && cached?.supabase_url && cached?.supabase_service_key) {
        requestBody.datasource = "external";
        requestBody.external_url = cached.supabase_url;
        requestBody.external_service_key = cached.supabase_service_key;
        if (import.meta.env.DEV) console.log("[AuthSource] Validating token against external datasource");
      }

      const response = await supabase.functions.invoke("oneapp-auth", {
        body: requestBody,
      });

      if (response.data?.valid && response.data?.user) {
        if (import.meta.env.DEV) console.log("[AuthSource] OneApp session valid:", response.data.user.email, { useExternal });
        setOneappUser({
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          display_name: response.data.user.display_name,
          nickname: response.data.user.nickname,
          avatar_url: response.data.user.avatar_url,
          level: response.data.user.level || 4,
          roles: response.data.user.roles || ["customer"],
          created_at: response.data.user.created_at,
        });
      } else {
        if (import.meta.env.DEV) console.log("[AuthSource] OneApp token invalid, clearing");
        localStorage.removeItem(ONEAPP_AUTH_TOKEN_KEY);
        setOneappToken(null);
        setOneappUser(null);
      }
    } catch (error) {
      console.error("[AuthSource] Token validation error:", error);
      localStorage.removeItem(ONEAPP_AUTH_TOKEN_KEY);
      setOneappToken(null);
      setOneappUser(null);
    } finally {
      setOneappLoading(false);
      setHasValidatedToken(true);
    }
  }, [oneappToken]);

  useEffect(() => {
    validateOneappSession();
  }, [validateOneappSession]);

  // Determine auth mode
  const authMode: AuthMode = useMemo(() => {
    // Always prefer OneApp Custom Auth
    return "oneapp";
  }, []);

  // ── Shared auth helpers ───────────────────────────────────────────────────

  const detectExternalDatasource = () => {
    const cached = getCachedSystemConnection();
    const useExternal =
      (cached?.is_active && cached?.connection_status === "connected") ||
      hasExternalConnection;
    return { useExternal, cached };
  };

  const buildAuthRequestBody = (
    action: string,
    credentials: Record<string, unknown>,
    useExternal: boolean,
    cached: ReturnType<typeof getCachedSystemConnection>,
  ): Record<string, unknown> => {
    const body: Record<string, unknown> = { action, ...credentials };
    if (useExternal && cached?.supabase_url && cached?.supabase_service_key) {
      body.datasource = "external";
      body.external_url = cached.supabase_url;
      body.external_service_key = cached.supabase_service_key;
    }
    return body;
  };

  const mapResponseUser = (u: Record<string, unknown>): PortableUser => ({
    id: u.id as string,
    email: u.email as string,
    name: u.name as string | null,
    display_name: u.display_name as string | null,
    nickname: u.nickname as string | null,
    avatar_url: u.avatar_url as string | null,
    level: (u.level as number) || 4,
    roles: (u.roles as string[]) || ["customer"],
    created_at: u.created_at as string,
  });

  // ── Auth methods ──────────────────────────────────────────────────────────

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const { useExternal, cached } = detectExternalDatasource();
    const source = useExternal ? "external" : "oneapp";
    try {
      const response = await supabase.functions.invoke("oneapp-auth", {
        body: buildAuthRequestBody("signin", { email, password }, useExternal, cached),
      });

      if (response.error) return { error: new Error(response.error.message), source };
      if (response.data?.error) return { error: new Error(response.data.error), source };

      if (response.data?.user && response.data?.token) {
        localStorage.setItem(ONEAPP_AUTH_TOKEN_KEY, response.data.token);
        setOneappToken(response.data.token);
        setOneappUser(mapResponseUser(response.data.user));
        return { error: null, source };
      }

      return { error: new Error("Unknown error during sign in"), source };
    } catch (error: unknown) {
      return { error: new Error(error instanceof Error ? error.message : "Sign in failed"), source };
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<AuthResult> => {
    const { useExternal, cached } = detectExternalDatasource();
    const source = useExternal ? "external" : "oneapp";
    try {
      const response = await supabase.functions.invoke("oneapp-auth", {
        body: buildAuthRequestBody("signup", { email, password, display_name: displayName }, useExternal, cached),
      });

      if (response.error) return { error: new Error(response.error.message), source };
      if (response.data?.error) return { error: new Error(response.data.error), source };

      if (response.data?.user && response.data?.token) {
        localStorage.setItem(ONEAPP_AUTH_TOKEN_KEY, response.data.token);
        setOneappToken(response.data.token);
        setOneappUser(mapResponseUser(response.data.user));
        return { error: null, source, syncedToExternal: useExternal };
      }

      return { error: new Error("Unknown error during sign up"), source };
    } catch (error: unknown) {
      return { error: new Error(error instanceof Error ? error.message : "Sign up failed"), source };
    }
  };

  // UNIFIED SIGN OUT
  const signOut = async (): Promise<void> => {
    if (import.meta.env.DEV) console.log("[AuthSource] Unified Sign Out...");

    // Call oneapp-auth signout if token exists
    if (oneappToken) {
      try {
        await supabase.functions.invoke("oneapp-auth", {
          body: {
            action: "signout",
            token: oneappToken,
          },
        });
      } catch (error) {
        console.warn("[AuthSource] OneApp signout API error:", error);
      }
    }

    // Clear OneApp token
    localStorage.removeItem(ONEAPP_AUTH_TOKEN_KEY);
    setOneappToken(null);
    setOneappUser(null);
    setHasValidatedToken(false);

    // Clear Lovable Auth (Supabase)
    try {
      await supabase.auth.signOut();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "";
      if (!message.includes("session_not_found") && !message.includes("Session not found")) {
        console.warn("[AuthSource] Supabase signOut error:", error);
      }
    }
  };

  // Role/Level helpers
  const isAdmin = useMemo(() => {
    return oneappUser?.level === 1 || oneappUser?.roles.includes("admin");
  }, [oneappUser]);

  const isDeveloper = useMemo(() => {
    return (oneappUser?.level || 999) <= 2 || oneappUser?.roles.includes("developer");
  }, [oneappUser]);

  const hasMinLevel = useCallback((level: number): boolean => {
    return (oneappUser?.level || 999) <= level;
  }, [oneappUser]);

  const hasRole = useCallback((role: string): boolean => {
    return oneappUser?.roles.includes(role) || false;
  }, [oneappUser]);

  // Update user data (e.g. after profile update)
  const updateUser = useCallback((updates: Partial<PortableUser>) => {
    setOneappUser((prev) => prev ? { ...prev, ...updates } : null);
  }, []);

  const updateProfile = useCallback(async (profileData: Record<string, any>) => {
    if (!oneappToken) return { success: false, error: "Not authenticated" };

    try {
      const { data, error } = await supabase.functions.invoke("oneapp-auth", {
        body: {
          action: "update-profile",
          token: oneappToken,
          profile_data: profileData,
        },
      });

      if (error || !data?.success) {
        return { success: false, error: data?.error || error?.message || "Failed to update profile" };
      }

      if (data.user) {
        updateUser(data.user);
      }

      return { success: true };
    } catch (err) {
      console.error("[AuthSource] updateProfile error:", err);
      return { success: false, error: "Failed to update profile" };
    }
  }, [oneappToken, updateUser]);

  // Get unified user
  const user: PortableUser | null = oneappUser;

  // Unified loading state
  const isLoading = oneappLoading || (oneappToken && !hasValidatedToken);

  const isAuthenticated = !!user;

  return (
    <AuthSourceContext.Provider
      value={{
        authMode,
        user,
        isAuthenticated,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateUser,
        oneappToken,
        isAdmin,
        isDeveloper,
        hasMinLevel,
        hasRole,
        hasExternalConnection,
        updateProfile,
      }}
    >
      {children}
    </AuthSourceContext.Provider>
  );
}

export function useAuthSource() {
  const context = useContext(AuthSourceContext);
  if (context === undefined) {
    console.warn("[useAuthSource] Called outside AuthSourceProvider - returning default state");
    return {
      authMode: "oneapp" as AuthMode,
      user: null,
      isAuthenticated: false,
      isLoading: true,
      signIn: async (): Promise<AuthResult> => ({ error: new Error("AuthSourceProvider not mounted") }),
      signUp: async (): Promise<AuthResult> => ({ error: new Error("AuthSourceProvider not mounted") }),
      signOut: async () => { },
      updateUser: () => { },
      oneappToken: null,
      isAdmin: false,
      isDeveloper: false,
      hasMinLevel: () => false,
      hasRole: () => false,
      hasExternalConnection: false,
      updateProfile: async () => ({ success: false, error: "AuthSourceProvider not mounted" }),
    };
  }
  return context;
}
